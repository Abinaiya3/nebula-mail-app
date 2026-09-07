import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const MailContext = createContext(null);

export function MailProvider({ children }) {
  const navigate = useNavigate();

  // Shared state
  const [currentView, setCurrentView] = useState('inbox');
  const [currentOpenEmailId, setCurrentOpenEmailId] = useState(null);
  const [activeFilters, setActiveFilters] = useState({});
  const [composeFormState, setComposeFormState] = useState({ to: '', subject: '', body: '' });
  const [emails, setEmails] = useState([]);
  const [historyId, setHistoryId] = useState(null);

  // ── ACTION: openCompose ─────────────────────────────────────────
  const openCompose = useCallback(({ to = '', subject = '', body = '' } = {}) => {
    setComposeFormState({ to, subject, body });
    setCurrentView('compose');
    navigate('/compose');
  }, [navigate]);

  // ── ACTION: sendEmail ───────────────────────────────────────────
  const sendEmail = useCallback(async ({ to, subject, body }) => {
    const res = await api.post('/mail/send', { to, subject, body });
    setCurrentView('inbox');
    navigate('/inbox');
    return res.data;
  }, [navigate]);

  // ── ACTION: filterInbox ─────────────────────────────────────────
  const filterInbox = useCallback(async ({ dateFrom, dateTo, sender, keyword, unreadOnly } = {}) => {
    const filters = { date_from: dateFrom, date_to: dateTo, sender, keyword, unread_only: unreadOnly };
    Object.keys(filters).forEach(k => (filters[k] === undefined || filters[k] === null || filters[k] === '' || filters[k] === false) && delete filters[k]);
    
    const params = new URLSearchParams(filters).toString();
    setCurrentView('inbox');
    navigate(`/inbox?${params}`);
    return []; // We return empty here because Inbox.jsx will do the fetching
  }, [navigate]);

  // ── ACTION: openEmail ───────────────────────────────────────────
  const openEmail = useCallback(async ({ emailId, searchDescription } = {}) => {
    if (emailId) {
      setCurrentOpenEmailId(emailId);
      setCurrentView('detail');
      navigate(`/message/${emailId}`);
    } else if (searchDescription) {
      // Search by description — fetch inbox and find best match
      const res = await api.get(`/mail/inbox?keyword=${encodeURIComponent(searchDescription)}`);
      const results = res.data.emails || [];
      if (results.length > 0) {
        const target = results[0];
        setCurrentOpenEmailId(target.id);
        setCurrentView('detail');
        navigate(`/message/${target.id}`);
        return target;
      }
    }
  }, [navigate]);

  // ── ACTION: prefillReply ────────────────────────────────────────
  const prefillReply = useCallback(async ({ customText = "" } = {}) => {
    if (!currentOpenEmailId) return;
    const res = await api.get(`/mail/message/${currentOpenEmailId}`);
    const email = res.data;
    
    const replySubject = email.subject?.startsWith('Re:') ? email.subject : `Re: ${email.subject}`;
    const quotedBody = `${customText ? customText + '\n\n' : ''}--- Original Message ---\nFrom: ${email.from}\nDate: ${email.date}\n\n${email.body || email.snippet}`;
    
    openCompose({
      to: email.from,
      subject: replySubject,
      body: quotedBody,
    });
  }, [currentOpenEmailId, openCompose]);

  // ── BACKGROUND POLLING ──────────────────────────────────────────
  useEffect(() => {
    let intervalId;
    if (historyId) {
      intervalId = setInterval(async () => {
        try {
          const res = await api.get(`/mail/sync?history_id=${historyId}`);
          if (res.data.has_updates) {
            // Re-fetch inbox with current filters silently
            const params = new URLSearchParams(activeFilters).toString();
            const inboxRes = await api.get(`/mail/inbox?${params}`);
            setEmails(inboxRes.data.emails || []);
            if (inboxRes.data.historyId) {
              setHistoryId(inboxRes.data.historyId);
            }
          } else if (res.data.historyId) {
            // Just update historyId if it moved forward without relevant changes
            setHistoryId(res.data.historyId);
          }
        } catch (err) {
          console.error("Error during inbox sync:", err);
        }
      }, 10000); // Check every 10 seconds
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [historyId, activeFilters]);

  return (
    <MailContext.Provider value={{
      // State
      currentView, setCurrentView,
      currentOpenEmailId, setCurrentOpenEmailId,
      activeFilters, setActiveFilters,
      composeFormState, setComposeFormState,
      emails, setEmails,
      // Actions
      openCompose,
      sendEmail,
      filterInbox,
      openEmail,
      prefillReply,
    }}>
      {children}
    </MailContext.Provider>
  );
}

export function useMailContext() {
  const ctx = useContext(MailContext);
  if (!ctx) throw new Error('useMailContext must be used inside MailProvider');
  return ctx;
}
