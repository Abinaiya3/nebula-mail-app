import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Inbox, Send, Edit, Mail } from 'lucide-react';

const Layout = () => {
  const location = useLocation();
  
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
