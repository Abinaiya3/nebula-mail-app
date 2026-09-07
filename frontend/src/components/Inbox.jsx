import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import api from '../api';
import { useMailContext } from '../context/MailContext';
import FilterBar from './FilterBar';

const Inbox = () => {
  const { emails, setEmails, setActiveFilters } = useMailContext();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();

  const fetchInbox = async () => {
    setLoading(true);
    try {
      // Sync URL params to context so FilterBar shows correct state
      const currentFilters = {};
      for (const [key, value] of searchParams.entries()) {
        currentFilters[key] = value;
      }
      setActiveFilters(currentFilters);

      const paramsString = searchParams.toString();
      const response = await api.get(`/mail/inbox${paramsString ? '?' + paramsString : ''}`);
      setEmails(response.data.emails || []);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch emails. Ensure backend is running and authenticated.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInbox();
  }, [location.search]);

  if (loading) return <div className="loading-state">Loading inbox...</div>;
  if (error) return <div className="loading-state" style={{color: 'var(--text-secondary)'}}>{error}</div>;

  return (
    <div className="inbox-container">
      <FilterBar />
      <div className="email-list">
      {emails.length === 0 ? (
        <div className="loading-state">No emails found in inbox.</div>
      ) : (
        emails.map(email => (
          <div key={email.id} className="email-item" onClick={() => navigate(`/message/${email.id}`)}>
            <div className="email-header">
              <span className="email-sender">{email.sender || 'Unknown Sender'}</span>
              <span className="email-date">{email.date ? new Date(email.date).toLocaleDateString() : ''}</span>
            </div>
            <div className="email-subject">{email.subject || '(No Subject)'}</div>
            <div className="email-preview">{email.snippet || ''}</div>
          </div>
        ))
      )}
    </div>
    </div>
  );
};

export default Inbox;
