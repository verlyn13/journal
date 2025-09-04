import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createRoot } from 'react-dom/client';
import JournalApp from './components/JournalApp';
import './index.css';
import 'katex/dist/katex.min.css';
import 'highlight.js/styles/github-dark.css';
import './styles/tailwind.css';
import './styles/tokens.css';

function mountReactEditor() {
  const el = document.getElementById('react-editor-root');
  if (!el) return;
  const root = createRoot(el);
  const queryClient = new QueryClient();
  root.render(
    <QueryClientProvider client={queryClient}>
      <JournalApp />
    </QueryClientProvider>,
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
