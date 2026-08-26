import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { themeManager } from './services/theme';

// Ensure theme is applied immediately on load
themeManager.applyTheme();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
