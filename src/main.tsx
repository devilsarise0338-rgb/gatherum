import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { scan } from 'react-scan';
import { ErrorBoundary } from 'react-error-boundary';
import { consola } from 'consola';
import App from './App.tsx';
import './index.css';

// Initialize React-Scan for performance debugging (visualize unnecessary renders)
if (typeof window !== 'undefined') {
  scan({
    enabled: true,
  });
}

function GlobalErrorFallback({ error, resetErrorBoundary }: any) {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-red-50 p-4 text-center">
      <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong!</h2>
      <pre className="text-sm text-red-500 bg-red-100 p-4 rounded max-w-2xl overflow-auto text-left">
        {error.message}
      </pre>
      <button 
        onClick={resetErrorBoundary}
        className="mt-6 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
      >
        Try again
      </button>
    </div>
  );
}

// Override global console methods for better logging in development
if (import.meta.env.DEV) {
  consola.wrapConsole();
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary 
      FallbackComponent={GlobalErrorFallback}
      onError={(error) => consola.error("Global Error Caught:", error)}
    >
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
