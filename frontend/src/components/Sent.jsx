import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const Sent = () => {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchSent = async () => {
    setLoading(true);
    try {
      const response = await api.get('/mail/sent');
      setEmails(response.data.emails || []);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch sent emails.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSent();
  }, []);

  if (loading) return <div className="loading-state">Loading sent mail...</div>;
  if (error) return <div className="loading-state" style={{color: 'var(--text-secondary)'}}>{error}</div>;

  return (
    <div className="email-list">
      {emails.length === 0 ? (
        <div className="loading-state">No sent emails found.</div>
      ) : (
        emails.map(email => (
          <div key={email.id} className="email-item" onClick={() => navigate(`/message/${email.id}`)}>
            <div className="email-header">
              <span className="email-sender">To: {email.to || 'Unknown'}</span>
              <span className="email-date">{email.date ? new Date(email.date).toLocaleDateString() : ''}</span>
            </div>
            <div className="email-subject">{email.subject || '(No Subject)'}</div>
            <div className="email-preview">{email.snippet || ''}</div>
          </div>
        ))
      )}
    </div>
  );
};

export default Sent;
