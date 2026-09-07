import React from 'react';
import { useCopilotAction, useCopilotReadable } from "@copilotkit/react-core";
import { useMailContext } from "../context/MailContext";
import { Filter, Mail, Edit3, Send, CheckCircle } from 'lucide-react';

/**
 * This hook registers all 5 CopilotKit actions and the readable context.
 * It must be used inside a component that is a child of both CopilotKit and MailProvider.
 */
export function useCopilotMailActions() {
  const {
    currentView,
    currentOpenEmailId,
    activeFilters,
    composeFormState,
    openCompose,
    sendEmail,
    filterInbox,
    openEmail,
    prefillReply,
    emails,
  } = useMailContext();

  // ── READABLE CONTEXT ────────────────────────────────────────────
  useCopilotReadable({
    description: "The current view the user is looking at (inbox, sent, compose, detail)",
    value: currentView,
  });

  useCopilotReadable({
    description: "The ID of the email currently open in detail view. Null if no email is open.",
    value: currentOpenEmailId,
  });

  useCopilotReadable({
    description: "The active filters applied to the inbox",
    value: activeFilters,
  });

  useCopilotReadable({
    description: "The current state of the compose form (to, subject, body fields)",
    value: composeFormState,
  });

  useCopilotReadable({
    description: "The list of emails currently visible to the user in the inbox. It contains their ID, sender, subject, date, and a snippet of the body.",
    value: emails.map(e => ({
      id: e.id,
      sender: e.sender || e.from,
      subject: e.subject,
      date: e.date,
      snippet: e.snippet
    })),
  });

  // ── ACTION: openCompose ─────────────────────────────────────────
  useCopilotAction({
    name: "openCompose",
    description: "Open the compose email form and optionally pre-fill it with recipient, subject, and body",
    parameters: [
      { name: "to", type: "string", description: "Recipient email address", required: false },
      { name: "subject", type: "string", description: "Email subject", required: false },
      { name: "body", type: "string", description: "Email body text", required: false },
    ],
    render: ({ status, args }) => {
      return (
        <div style={{ padding: '12px', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Edit3 style={{ color: 'var(--accent-primary)', width: '18px', height: '18px' }} />
          <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>
            {status === "inProgress" ? "Opening composer..." : `Drafting email${args.to ? ` to ${args.to}` : ''}...`}
          </span>
        </div>
      );
    },
    handler: async ({ to, subject, body }) => {
      openCompose({ to: to || '', subject: subject || '', body: body || '' });
      return `Compose form opened${to ? ` for ${to}` : ''}. The fields have been pre-filled.`;
    },
  });

  // ── ACTION: sendEmail ───────────────────────────────────────────
  useCopilotAction({
    name: "sendEmail",
    description: "Send an email to a recipient with a subject and body",
    parameters: [
      { name: "to", type: "string", description: "Recipient email address", required: true },
      { name: "subject", type: "string", description: "Email subject", required: true },
      { name: "body", type: "string", description: "Email body text", required: true },
    ],
    render: ({ status, args }) => {
      if (status === "inProgress") {
        return (
          <div style={{ padding: '12px', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Send style={{ color: 'var(--text-secondary)', width: '18px', height: '18px', animation: 'pulse 2s infinite' }} />
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Sending email...</span>
          </div>
        );
      }
      return (
        <div style={{ padding: '12px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CheckCircle style={{ color: '#10b981', width: '18px', height: '18px' }} />
          <span style={{ fontSize: '0.9rem', color: '#10b981' }}>Email sent successfully!</span>
        </div>
      );
    },
    handler: async ({ to, subject, body }) => {
      try {
        await sendEmail({ to, subject, body });
        return `Email successfully sent to ${to} with subject "${subject}".`;
      } catch (err) {
        return `Failed to send email: ${err.message}`;
      }
    },
  });

  // ── ACTION: filterInbox ─────────────────────────────────────────
  useCopilotAction({
    name: "filterInbox",
    description: "Filter the inbox by date range, sender, keyword, or read status. MUST be called whenever the user asks to show, find, search, or filter emails. Do not just list emails in the chat.",
    parameters: [
      { name: "dateFrom", type: "string", description: "Start date in YYYY/MM/DD format (Gmail format)", required: false },
      { name: "dateTo", type: "string", description: "End date in YYYY/MM/DD format (Gmail format). NOTE: This is exclusive, so to include today or a specific end date, you MUST add 1 extra day (e.g., to include Sept 7, pass 2026/09/08).", required: false },
      { name: "sender", type: "string", description: "Filter by sender email or name", required: false },
      { name: "keyword", type: "string", description: "Search keyword in subject or body", required: false },
      { name: "unreadOnly", type: "boolean", description: "Show only unread emails", required: false },
    ],
    render: ({ status, args }) => {
      return (
        <div style={{ padding: '12px', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-primary)', fontWeight: 500, fontSize: '0.9rem' }}>
            <Filter style={{ width: '16px', height: '16px' }} /> {status === "inProgress" ? "Filtering Inbox..." : "Inbox Filtered"}
          </div>
          {(args.unreadOnly || args.sender || args.keyword || args.dateFrom) && (
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {args.unreadOnly && <span style={{ background: 'var(--bg-tertiary)', padding: '2px 6px', borderRadius: '4px' }}>Unread</span>}
              {args.sender && <span style={{ background: 'var(--bg-tertiary)', padding: '2px 6px', borderRadius: '4px' }}>From: {args.sender}</span>}
              {args.keyword && <span style={{ background: 'var(--bg-tertiary)', padding: '2px 6px', borderRadius: '4px' }}>Keyword: {args.keyword}</span>}
              {args.dateFrom && <span style={{ background: 'var(--bg-tertiary)', padding: '2px 6px', borderRadius: '4px' }}>Since: {args.dateFrom}</span>}
            </div>
          )}
        </div>
      );
    },
    handler: async ({ dateFrom, dateTo, sender, keyword, unreadOnly }) => {
      await filterInbox({ dateFrom, dateTo, sender, keyword, unreadOnly });
      return `Inbox filtered successfully. CRITICAL INSTRUCTION: You MUST NOT list the emails in your chat response. Simply reply with a short confirmation that you have filtered the inbox.`;
    },
  });

  // ── ACTION: openEmail ───────────────────────────────────────────
  useCopilotAction({
    name: "openEmail",
    description: "Open a specific email. You can pass an email ID or a search description like 'latest email from David' or 'email about project update'",
    parameters: [
      { name: "emailId", type: "string", description: "The specific email ID to open", required: false },
      { name: "searchDescription", type: "string", description: "A natural language description to search for the email (e.g., 'latest email from Sarah about the project')", required: false },
    ],
    render: ({ status, args }) => {
      return (
        <div style={{ padding: '12px', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Mail style={{ color: 'var(--accent-primary)', width: '18px', height: '18px' }} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 500 }}>
              {status === "inProgress" ? "Opening email..." : "Email Opened"}
            </span>
            {args.searchDescription && <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Search: {args.searchDescription}</span>}
          </div>
        </div>
      );
    },
    handler: async ({ emailId, searchDescription }) => {
      const result = await openEmail({ emailId, searchDescription });
      if (result) {
        return `Opened email from ${result.sender} with subject "${result.subject}".`;
      }
      return "Email opened successfully.";
    },
  });

  // ── ACTION: prefillReply ────────────────────────────────────────
  useCopilotAction({
    name: "prefillReply",
    description: "Reply to the currently open email. Pre-fills the compose form with the original sender, Re: subject, and quoted body. You can optionally include custom text to prepend to the body.",
    parameters: [
      { name: "customText", type: "string", description: "Custom text to include in the reply before the quoted message", required: false }
    ],
    render: ({ status }) => {
      return (
        <div style={{ padding: '12px', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Edit3 style={{ color: 'var(--accent-primary)', width: '18px', height: '18px' }} />
          <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>
            {status === "inProgress" ? "Preparing reply..." : "Reply drafted in composer."}
          </span>
        </div>
      );
    },
    handler: async ({ customText }) => {
      if (!currentOpenEmailId) {
        return "No email is currently open. Please open an email first, then say 'reply to this'.";
      }
      await prefillReply({ customText });
      return "Reply compose form opened with the original sender, subject, and quoted message.";
    },
  });
}
