import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import JournalApp from './components/JournalApp';
import './index.css';
import './styles/tailwind.css';
import './styles/tokens.css';

function mountReactEditor() {
  const el = document.getElementById('react-editor-root');
  if (!el) return;

  const root = createRoot(el, {
    onUncaughtError: (_error, _errorInfo) => {
      // TODO: Send to error tracking service
    },
    onCaughtError: (_error, _errorInfo) => {
      // TODO: surface to user and/or send to telemetry
    },
  });

  // Optimized QueryClient for React 19
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        // Prevent excessive re-renders
        staleTime: 30_000,
        // Reduce refetch frequency
        refetchOnWindowFocus: false,
        // Retry logic
        retry: 2,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      },
      mutations: {
        // Ensure mutations complete
        retry: 1,
        // Network mode for better offline handling
        networkMode: 'online',
      },
    },
  });

  root.render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <JournalApp />
        <SpeedInsights />
      </QueryClientProvider>
    </StrictMode>,
  );
}

// Auto-mount when bundled as a standalone app (Vite dev/preview)
mountReactEditor();

// Also expose a global to mount within Flask templates
declare global {
  interface Window {
    JournalEditor: { mount: () => void };
  }
}
window.JournalEditor = { mount: mountReactEditor };
