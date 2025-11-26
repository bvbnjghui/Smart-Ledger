
import React from 'react';
import ReactDOM from 'react-dom/client';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
const App = window.App; // Get App from global scope

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
