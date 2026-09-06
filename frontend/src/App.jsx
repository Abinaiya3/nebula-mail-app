import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Inbox from './components/Inbox';
import Sent from './components/Sent';
import Compose from './components/Compose';
import EmailDetail from './components/EmailDetail';
import Login from './components/Login';
import CopilotActionsRegistrar from './components/CopilotActionsRegistrar';
import { MailProvider } from './context/MailContext';
import './index.css';
import { CopilotKit } from "@copilotkit/react-core";
import { CopilotSidebar } from "@copilotkit/react-ui";
import "@copilotkit/react-ui/styles.css";

function App() {
  return (
    <CopilotKit runtimeUrl="http://localhost:4000/copilotkit">
      <Router>
        <MailProvider>
          <CopilotActionsRegistrar>
            <CopilotSidebar
              defaultOpen={false}
              clickOutsideToClose={false}
              instructions="You are a helpful AI mail assistant. You can open the compose form, send emails, filter the inbox, open specific emails, and pre-fill replies. Use the provided actions to control the UI."
              labels={{ title: "Mail Assistant", initial: "Hi! I'm your mail assistant. Try saying:\n• 'Open compose'\n• 'Show emails from last 7 days'\n• 'Reply to this'" }}
            >
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<Layout />}>
                  <Route index element={<Navigate to="/inbox" replace />} />
                  <Route path="inbox" element={<Inbox />} />
                  <Route path="sent" element={<Sent />} />
                  <Route path="compose" element={<Compose />} />
                  <Route path="message/:id" element={<EmailDetail />} />
                </Route>
              </Routes>
            </CopilotSidebar>
          </CopilotActionsRegistrar>
        </MailProvider>
      </Router>
    </CopilotKit>
  );
}

export default App;
