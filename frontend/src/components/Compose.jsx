import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send } from 'lucide-react';
import api from '../api';
import { useMailContext } from '../context/MailContext';

const Compose = () => {
  const { composeFormState, setComposeFormState } = useMailContext();
  const [to, setTo] = useState(composeFormState.to || '');
  const [subject, setSubject] = useState(composeFormState.subject || '');
  const [body, setBody] = useState(composeFormState.body || '');
  const [isSending, setIsSending] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setTo(composeFormState.to || '');
    setSubject(composeFormState.subject || '');
    setBody(composeFormState.body || '');
  }, [composeFormState]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!to || !subject || !body) {
      alert('Please fill out all fields.');
      return;
    }
    
    setIsSending(true);
    try {
      await api.post('/mail/send', { to, subject, body });
      alert('Email sent successfully!');
      navigate('/inbox');
    } catch (error) {
      console.error('Failed to send email:', error);
      alert('Failed to send email.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <form className="compose-form" onSubmit={handleSend}>
      <div className="form-group">
        <label htmlFor="to">To:</label>
        <input 
          id="to" 
          type="email" 
          value={to} 
          onChange={(e) => setTo(e.target.value)} 
          placeholder="recipient@example.com"
          required 
        />
      </div>
      <div className="form-group">
        <label htmlFor="subject">Subject:</label>
        <input 
          id="subject" 
          type="text" 
          value={subject} 
          onChange={(e) => setSubject(e.target.value)} 
          placeholder="Email Subject"
          required 
        />
      </div>
      <div className="form-group">
        <label htmlFor="body">Body:</label>
        <textarea 
          id="body" 
          value={body} 
          onChange={(e) => setBody(e.target.value)} 
          placeholder="Write your email here..."
          required 
        />
      </div>
      <button type="submit" className="btn-primary" disabled={isSending}>
        <Send className="w-4 h-4" />
        {isSending ? 'Sending...' : 'Send Email'}
      </button>
    </form>
  );
};

export default Compose;
