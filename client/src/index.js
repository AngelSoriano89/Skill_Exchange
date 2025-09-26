import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

// ✅ AGREGADO: Suprimir errores de ResizeObserver en desarrollo
if (process.env.NODE_ENV === 'development') {
  // Suprimir errores de ResizeObserver que no afectan la funcionalidad
  const resizeObserverError = window.ResizeObserver;
  window.ResizeObserver = class extends resizeObserverError {
    constructor(callback) {
      const wrappedCallback = (entries, observer) => {
        window.requestAnimationFrame(() => {
          callback(entries, observer);
        });
      };
      super(wrappedCallback);
    }
  };

  // Suprimir warnings específicos de desarrollo
  const originalError = console.error;
  console.error = (...args) => {
    if (
      args[0] && 
      args[0].includes && 
      (args[0].includes('ResizeObserver loop completed') ||
       args[0].includes('ResizeObserver loop limit exceeded'))
    ) {
      return; // Suprimir este error específico
    }
    originalError.call(console, ...args);
  };
}

// ✅ AGREGADO: Manejo de errores global para React (en captura y deteniendo propagación)
const resizeObserverGuard = (event) => {
  const message = event?.error?.message || event?.message || event?.reason?.message;
  if (message && message.includes('ResizeObserver')) {
    event.preventDefault();
    if (event.stopImmediatePropagation) event.stopImmediatePropagation();
    return false;
  }
};

window.addEventListener('error', resizeObserverGuard, true); // capture
window.addEventListener('unhandledrejection', resizeObserverGuard, true); // capture

const root = ReactDOM.createRoot(document.getElementById('root'));

if (process.env.NODE_ENV === 'production') {
  root.render(
    <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>
  );
} else {
  // En desarrollo, evitamos StrictMode para reducir dobles renders y ruido de ResizeObserver
  root.render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}

// ✅ AGREGADO: Ocultar loading inicial cuando React esté listo
const hideInitialLoading = () => {
  const loading = document.getElementById('initial-loading');
  if (loading) {
    loading.classList.add('fade-out');
    setTimeout(() => {
      loading.remove();
    }, 500);
  }
};

// Ocultar loading después de que React haya renderizado
setTimeout(hideInitialLoading, 100);
