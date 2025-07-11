import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';
import { SettingsProvider } from './contexts/SettingsContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { LanguageProvider } from './contexts/LanguageContext';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <HashRouter>
    <NotificationProvider>
      <SettingsProvider>
        <LanguageProvider>
          <App />
        </LanguageProvider>
      </SettingsProvider>
    </NotificationProvider>
  </HashRouter>
);