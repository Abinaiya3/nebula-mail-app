from fastapi import APIRouter, Request, HTTPException, Depends
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
import base64
from email.message import EmailMessage
import os

router = APIRouter(prefix="/mail", tags=["mail"])

def get_gmail_service(request: Request):
    access_token = request.session.get('access_token')
    refresh_token = request.session.get('refresh_token')
    if not access_token:
        # For development purposes, if we don't have tokens, we might throw an error.
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    creds = Credentials(
        token=access_token,
        refresh_token=refresh_token,
        token_uri="https://oauth2.googleapis.com/token",
        client_id=os.environ.get('GOOGLE_CLIENT_ID'),
        client_secret=os.environ.get('GOOGLE_CLIENT_SECRET')
    )
    service = build('gmail', 'v1', credentials=creds)
    return service

@router.get('/inbox')
def get_inbox(request: Request, date_from: str = None, date_to: str = None, sender: str = None, keyword: str = None, unread_only: bool = False):
    service = get_gmail_service(request)
    
    profile = service.users().getProfile(userId='me').execute()
    history_id = profile.get('historyId')
    
    query_parts = ["label:inbox"]
    if unread_only:
        query_parts.append("is:unread")
    if date_from:
        query_parts.append(f"after:{date_from}")
    if date_to:
        query_parts.append(f"before:{date_to}")
    if sender:
        query_parts.append(f"from:{sender}")
    if keyword:
        query_parts.append(keyword)
        
    q = " ".join(query_parts)
    
    results = service.users().messages().list(userId='me', q=q, maxResults=20).execute()
    messages = results.get('messages', [])
    
    email_list = []
    for msg in messages:
        msg_detail = service.users().messages().get(userId='me', id=msg['id'], format='metadata', metadataHeaders=['Subject', 'From', 'Date']).execute()
        headers = {header['name']: header['value'] for header in msg_detail['payload']['headers']}
        
        email_list.append({
            "id": msg['id'],
            "threadId": msg['threadId'],
            "snippet": msg_detail.get('snippet', ''),
            "subject": headers.get('Subject', ''),
            "sender": headers.get('From', ''),
            "date": headers.get('Date', '')
        })
        
    return {"emails": email_list, "historyId": history_id}

@router.get('/sync')
def sync_inbox(request: Request, history_id: str):
    service = get_gmail_service(request)
    try:
        results = service.users().history().list(userId='me', startHistoryId=history_id).execute()
        new_history_id = results.get('historyId')
        has_updates = 'history' in results and len(results['history']) > 0
        return {"has_updates": has_updates, "historyId": new_history_id}
    except Exception as e:
        return {"has_updates": True, "historyId": None}

@router.get('/sent')
def get_sent(request: Request):
    service = get_gmail_service(request)
    results = service.users().messages().list(userId='me', q="label:sent", maxResults=20).execute()
    messages = results.get('messages', [])
    
    email_list = []
    for msg in messages:
        msg_detail = service.users().messages().get(userId='me', id=msg['id'], format='metadata', metadataHeaders=['Subject', 'To', 'Date']).execute()
        headers = {header['name']: header['value'] for header in msg_detail['payload']['headers']}
        
        email_list.append({
            "id": msg['id'],
            "threadId": msg['threadId'],
            "snippet": msg_detail.get('snippet', ''),
            "subject": headers.get('Subject', ''),
            "to": headers.get('To', ''),
            "date": headers.get('Date', '')
        })
        
    return {"emails": email_list}

@router.get('/message/{msg_id}')
def get_message(request: Request, msg_id: str):
    service = get_gmail_service(request)
    msg_detail = service.users().messages().get(userId='me', id=msg_id, format='full').execute()
    
    headers_list = msg_detail.get('payload', {}).get('headers', [])
    headers = {h['name']: h['value'] for h in headers_list}
    
    def get_body(parts):
        html_body = ""
        plain_body = ""
        for part in parts:
            mime_type = part.get('mimeType')
            if mime_type == 'text/html':
                data = part.get('body', {}).get('data', '')
                if data:
                    html_body = base64.urlsafe_b64decode(data).decode('utf-8')
            elif mime_type == 'text/plain':
                data = part.get('body', {}).get('data', '')
                if data:
                    plain_body = base64.urlsafe_b64decode(data).decode('utf-8')
            elif mime_type and mime_type.startswith('multipart/'):
                sub_html, sub_plain = get_body(part.get('parts', []))
                if sub_html: html_body = sub_html
                if sub_plain: plain_body = sub_plain
        return html_body, plain_body

    body = ""
    payload = msg_detail.get('payload', {})
    if payload.get('mimeType') in ['text/html', 'text/plain']:
        data = payload.get('body', {}).get('data', '')
        if data:
            body = base64.urlsafe_b64decode(data).decode('utf-8')
    else:
        html, plain = get_body(payload.get('parts', []))
        body = html if html else plain

    return {
        "id": msg_detail['id'],
        "threadId": msg_detail['threadId'],
        "subject": headers.get('Subject', ''),
        "from": headers.get('From', ''),
        "to": headers.get('To', ''),
        "date": headers.get('Date', ''),
        "body": body,
        "snippet": msg_detail.get('snippet', '')
    }

from pydantic import BaseModel
class SendEmailRequest(BaseModel):
    to: str
    subject: str
    body: str

@router.post('/send')
def send_email(request: Request, email_req: SendEmailRequest):
    service = get_gmail_service(request)
    
    message = EmailMessage()
    message.set_content(email_req.body)
    message['To'] = email_req.to
    message['From'] = "me"
    message['Subject'] = email_req.subject
    
    encoded_message = base64.urlsafe_b64encode(message.as_bytes()).decode()
    create_message = {'raw': encoded_message}
    
    try:
        sent_message = service.users().messages().send(userId='me', body=create_message).execute()
        return {"status": "success", "message_id": sent_message['id']}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post('/reply')
def reply_email(request: Request, email_req: SendEmailRequest, reply_to_id: str):
    service = get_gmail_service(request)
    
    # get the original message to get threadId
    original_msg = service.users().messages().get(userId='me', id=reply_to_id, format='metadata', metadataHeaders=['Message-ID', 'Subject']).execute()
    thread_id = original_msg.get('threadId')
    
    headers = {h['name']: h['value'] for h in original_msg.get('payload', {}).get('headers', [])}
    original_message_id = headers.get('Message-ID', '')
    original_subject = headers.get('Subject', '')
    
    message = EmailMessage()
    message.set_content(email_req.body)
    message['To'] = email_req.to
    message['From'] = "me"
    
    # Ensure subject has Re:
    if not original_subject.lower().startswith('re:'):
        message['Subject'] = f"Re: {original_subject}"
    else:
        message['Subject'] = original_subject
        
    if original_message_id:
        message['In-Reply-To'] = original_message_id
        message['References'] = original_message_id

    encoded_message = base64.urlsafe_b64encode(message.as_bytes()).decode()
    create_message = {'raw': encoded_message, 'threadId': thread_id}
    
    try:
        sent_message = service.users().messages().send(userId='me', body=create_message).execute()
        return {"status": "success", "message_id": sent_message['id'], "thread_id": sent_message['threadId']}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
