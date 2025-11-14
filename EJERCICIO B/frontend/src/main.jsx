import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { AuthProvider } from './Auth.jsx'; 

const container = document.getElementById('root');

if (!container) {
  const newContainer = document.createElement('div');
  newContainer.id = 'root';
  document.body.appendChild(newContainer);
}

const root = createRoot(container || document.getElementById('root'));

root.render(
  <React.StrictMode>
    <AuthProvider>
      <App /> 
    </AuthProvider>
  </React.StrictMode>
);