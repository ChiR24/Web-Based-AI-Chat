import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import './custom-theme.css'  // Import our custom theme overrides

// Add a class to detect if JavaScript is enabled
document.documentElement.classList.add('js-enabled');

// Add a class to detect touch devices
if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
  document.documentElement.classList.add('touch-device');
}

// Always use dark theme
document.documentElement.classList.add('dark');

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
) 