import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AppProvider } from '@/context/AppContext';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename="/Watch-Faces">
      <AppProvider>
        <App />
        <Toaster
          position="bottom-center"
          toastOptions={{
            style: {
              background: '#1A1A1A',
              border: '1px solid #27272A',
              color: '#FFFFFF',
            },
          }}
        />
      </AppProvider>
    </BrowserRouter>
  </StrictMode>
);
