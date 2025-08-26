import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppContextProvider } from './contexts/AppContext.tsx';
import { SearchContextProvider } from './contexts/SearchContext.tsx';
import { AdminContextProvider } from './contexts/AdminContext.tsx';
import { HelmetProvider } from 'react-helmet-async';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 0,
    },
  },
});

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
          <AppContextProvider>
            <AdminContextProvider>
              <SearchContextProvider>
                <App />
              </SearchContextProvider>
            </AdminContextProvider>
          </AppContextProvider>
      </QueryClientProvider>
    </HelmetProvider>
  </React.StrictMode>
);
