'use client';

import { useEffect } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorBoundary({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log to error reporting in production (Phase 4)
    console.error('[error-boundary]', error);
  }, [error]);

  return (
    <div
      className="flex flex-col items-center justify-center px-4 text-center"
      style={{ minHeight: '70dvh' }}
    >
      <div
        className="flex items-center justify-center rounded-2xl mb-6"
        style={{
          width: 72,
          height: 72,
          background: 'rgba(239,68,68,0.1)',
          border: '1px solid rgba(239,68,68,0.2)',
        }}
      >
        <AlertCircle size={32} color="#ef4444" />
      </div>

      <h1
        className="font-bold text-2xl mb-3"
        style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
      >
        Something went wrong
      </h1>

      <p className="mb-2 text-sm" style={{ color: 'var(--text-secondary)', maxWidth: 400 }}>
        {error.message || 'An unexpected error occurred.'}
      </p>

      {error.digest && (
        <p className="mb-6 text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
          Error ID: {error.digest}
        </p>
      )}

      <button onClick={reset} className="btn-primary">
        <RefreshCw size={15} />
        Try again
      </button>
    </div>
  );
}
