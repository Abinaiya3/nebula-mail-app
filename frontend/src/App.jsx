import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Inbox from './components/Inbox';
import Sent from './components/Sent';
import Compose from './components/Compose';
import EmailDetail from './components/EmailDetail';
import api from './api';
import './index.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // For testing purposes, we'll bypass actual auth check if backend isn't ready
  // In a real flow, you'd verify session here.
  useEffect(() => {
    setIsAuthenticated(true); // Auto-authenticated for UI development
    setLoading(false);
  }, []);

  if (loading) {
    return <div className="loading-state">Loading Nebula Mail...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/inbox" replace />} />
          <Route path="inbox" element={<Inbox />} />
          <Route path="sent" element={<Sent />} />
          <Route path="compose" element={<Compose />} />
          <Route path="message/:id" element={<EmailDetail />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
