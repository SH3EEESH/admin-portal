import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Create the main root for the React application
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render the app inside React Strict Mode for development checks
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);