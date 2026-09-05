import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Reply } from 'lucide-react';
import api from '../api';

const EmailDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEmail = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/mail/message/${id}`);
        setEmail(response.data);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch email details.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchEmail();
    }
  }, [id]);

  if (loading) return <div className="loading-state">Loading email...</div>;
  if (error || !email) return <div className="loading-state" style={{color: 'var(--text-secondary)'}}>{error || 'Email not found.'}</div>;

  return (
    <div className="email-detail-container">
      <button className="btn-secondary" onClick={() => navigate(-1)} style={{ marginBottom: '24px' }}>
        <ArrowLeft className="w-4 h-4" /> Back
      </button>
      
      <div className="detail-header">
        <h2 className="detail-subject">{email.subject || '(No Subject)'}</h2>
        <div className="detail-meta">
          <span className="detail-sender">From: {email.from}</span>
          <span className="detail-date">{email.date ? new Date(email.date).toLocaleString() : ''}</span>
        </div>
        <div className="detail-meta" style={{ marginTop: '8px' }}>
          <span className="detail-sender" style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>To: {email.to}</span>
        </div>
      </div>
      
      <div className="detail-body">
        {email.body || '(Empty body)'}
      </div>
      
      <div className="action-buttons">
        <button className="btn-secondary" onClick={() => navigate('/compose')}>
          <Reply className="w-4 h-4" /> Reply (Demo)
        </button>
      </div>
    </div>
  );
};

export default EmailDetail;
