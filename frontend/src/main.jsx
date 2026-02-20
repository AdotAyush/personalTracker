import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'react-hot-toast';
import App from './App';
import { store } from './store';
import './index.css';

// Initialize theme on page load
const savedTheme = localStorage.getItem('pt_theme') || 'dark';
const root = document.documentElement;
if (savedTheme === 'dark') {
  root.classList.add('dark');
  root.classList.remove('light');
} else if (savedTheme === 'light') {
  root.classList.remove('dark');
  root.classList.add('light');
} else {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  root.classList.toggle('dark', prefersDark);
  root.classList.toggle('light', !prefersDark);
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,        // 5 minutes
      gcTime: 1000 * 60 * 10,          // 10 minutes
      retry: (failureCount, error) => {
        if (error?.response?.status === 401) return false;
        if (error?.response?.status >= 400 && error?.response?.status < 500) return false;
        return failureCount < 3;
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            className: '',
            style: {
              background: 'rgb(var(--color-card-bg))',
              color: 'rgb(var(--color-text))',
              border: '1px solid rgb(var(--color-border))',
              borderRadius: '12px',
              fontSize: '14px',
              boxShadow: 'var(--shadow-lg)',
            },
            success: { iconTheme: { primary: '#6366f1', secondary: '#fff' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          }}
        />
        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </Provider>
  </React.StrictMode>
);

// Register service worker
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js');
  });
}
