'use client';

import { Clock, Zap, Sparkles } from 'lucide-react';

interface ColdStartStateProps {
  query: string;
}

export function ColdStartState({ query }: ColdStartStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center py-24 px-4 text-center animate-fade-up"
    >
      {/* Animated icon */}
      <div
        className="relative mb-6 flex items-center justify-center rounded-2xl"
        style={{
          width: 80,
          height: 80,
          background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))',
          boxShadow: '0 0 40px rgba(99,102,241,0.3)',
        }}
      >
        <Sparkles size={36} color="white" />
        {/* Pulse ring */}
        <span
          className="absolute inset-0 rounded-2xl"
          style={{
            animation: 'pulse-ring 2s cubic-bezier(0.4,0,0.6,1) infinite',
            border: '2px solid rgba(99,102,241,0.4)',
          }}
        />
      </div>

      <h2
        className="font-bold text-2xl mb-3"
        style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
      >
        We&apos;re gathering content
      </h2>

      <p className="mb-2 max-w-md" style={{ color: 'var(--text-secondary)' }}>
        We&apos;re fetching the best YouTube content for{' '}
        <strong style={{ color: 'var(--text-primary)' }}>&ldquo;{query}&rdquo;</strong>{' '}
        right now. This usually takes a few minutes.
      </p>

      <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>
        Check back in a moment — or browse a seeded topic while you wait.
      </p>

      {/* Status indicators */}
      <div className="flex flex-col gap-3 w-full max-w-xs">
        <div
          className="flex items-center gap-3 p-3 rounded-xl"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
        >
          <div
            className="rounded-full flex-shrink-0"
            style={{
              width: 8,
              height: 8,
              background: 'var(--color-success)',
              animation: 'pulse 1.5s ease-in-out infinite',
            }}
          />
          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Ingestion job queued
          </span>
        </div>

        <div
          className="flex items-center gap-3 p-3 rounded-xl"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
        >
          <Zap size={16} style={{ color: 'var(--brand-accent)', flexShrink: 0 }} />
          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Fetching & classifying content
          </span>
        </div>

        <div
          className="flex items-center gap-3 p-3 rounded-xl"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
        >
          <Clock size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Ready in ~3-5 minutes
          </span>
        </div>
      </div>

      <style>{`
        @keyframes pulse-ring {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.15); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
