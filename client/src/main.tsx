import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 3,   // 3 Minuten Cache
      gcTime: 1000 * 60 * 10,     // 10 Minuten im Speicher
      retry: 1,
      retryDelay: 2000,
      refetchOnWindowFocus: false, // kein Reload bei Tab-Wechsel
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);
