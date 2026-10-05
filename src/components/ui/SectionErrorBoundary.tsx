'use client';

import { catchError, type ErrorInfo } from 'next/error';
import type { ReactNode } from 'react';

function SectionErrorFallback(
  _props: { children: ReactNode },
  { error, retry }: ErrorInfo
) {
  console.error('[topic-section] Render failed:', error);

  return (
    <section className="glass-card p-6 text-center" aria-live="polite">
      <p style={{ color: 'var(--text-secondary)' }}>
        This section could not be displayed right now.
      </p>
      <button type="button" onClick={() => retry()} className="btn-secondary mt-4">
        Try again
      </button>
    </section>
  );
}

export const SectionErrorBoundary = catchError(SectionErrorFallback);
