import React from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Inbox, Send, Edit, Mail, LogOut } from 'lucide-react';
import api from '../api';

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Logout failed', err);
    }
    // Always redirect to login
    window.location.href = '/login';
  };
  
  const getHeaderTitle = () => {
    if (location.pathname.includes('/inbox')) return 'Inbox';
    if (location.pathname.includes('/sent')) return 'Sent Mail';
    if (location.pathname.includes('/compose')) return 'Compose Email';
    if (location.pathname.includes('/message/')) return 'Read Email';
    return 'Mail';
  };

  return (
    <div className="app-container">
      <div className="sidebar">
        <h1><Mail className="w-8 h-8" /> NebulaMail</h1>
        <nav>
          <NavLink to="/inbox" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            <Inbox className="w-5 h-5" /> Inbox
          </NavLink>
          <NavLink to="/sent" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            <Send className="w-5 h-5" /> Sent
          </NavLink>
          <NavLink to="/compose" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            <Edit className="w-5 h-5" /> Compose
          </NavLink>
        </nav>
        <div style={{ marginTop: 'auto' }}>
          <button 
            onClick={handleLogout}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', 
              width: '100%', background: 'transparent', border: 'none', 
              color: 'var(--text-secondary)', cursor: 'pointer', borderRadius: '8px',
              fontWeight: 500, fontSize: '1rem', transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'; e.currentTarget.style.color = '#ef4444'; }}
            onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
          >
            <LogOut className="w-5 h-5" /> Logout
          </button>
        </div>
      </div>
      <div className="main-content">
        <header className="header">
          <h2>{getHeaderTitle()}</h2>
        </header>
        <div className="view-container">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;
