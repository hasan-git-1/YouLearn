import React from 'react';
import { Sparkles, Compass, Target, Briefcase, CheckCircle2, ShieldCheck } from 'lucide-react';
import type { AITopicOverview } from '@/types';

interface AIOverviewCardProps {
  topicName: string;
  overview: AITopicOverview;
}

export function AIOverviewCard({ topicName, overview }: AIOverviewCardProps) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl p-6 sm:p-8 mb-10 transition-all duration-300"
      style={{
        background: 'linear-gradient(135deg, rgba(20, 24, 45, 0.85) 0%, rgba(13, 16, 32, 0.95) 100%)',
        border: '1px solid rgba(139, 92, 246, 0.25)',
        boxShadow: '0 8px 32px -4px rgba(0, 0, 0, 0.5), 0 0 24px -6px rgba(139, 92, 246, 0.15)',
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* Decorative gradient orb */}
      <div
        className="absolute -top-24 -right-24 w-64 h-64 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{
          background: 'radial-gradient(circle, #8b5cf6 0%, #3b82f6 100%)',
        }}
        aria-hidden="true"
      />

      {/* Header with AI Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2.5">
          <div
            className="flex items-center justify-center w-8 h-8 rounded-xl"
            style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
              boxShadow: '0 0 12px rgba(168, 85, 247, 0.4)',
            }}
          >
            <Sparkles size={16} className="text-white animate-pulse" />
          </div>
          <div>
            <h2
              className="text-lg font-bold text-white tracking-tight"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              AI Topic Overview {topicName ? `· ${topicName}` : ''}
            </h2>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Synthesized and grounded in real indexed curriculum
            </p>
          </div>
        </div>

        <div
          className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
          style={{
            background: 'rgba(99, 102, 241, 0.12)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            color: '#a5b4fc',
          }}
        >
          <ShieldCheck size={13} />
          <span>Grounded in DB</span>
        </div>
      </div>

      {/* What is it section */}
      <div className="mb-6">
        <p className="text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          {overview.what_is_it}
        </p>
      </div>

      {/* Core Concepts Grid */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Target size={15} style={{ color: 'var(--brand-primary)' }} />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-300">
            Core Concepts to Master
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {overview.what_to_learn.map((concept, index) => (
            <div
              key={index}
              className="flex items-start gap-2.5 p-3 rounded-xl transition-colors"
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
              }}
            >
              <CheckCircle2 size={16} className="text-indigo-400 mt-0.5 shrink-0" />
              <span className="text-sm text-gray-200 leading-snug">{concept}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended Starting Point & Career Context */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/5">
        {/* Recommended Starting Point */}
        <div
          className="p-4 rounded-xl"
          style={{
            background: 'rgba(99, 102, 241, 0.05)',
            border: '1px solid rgba(99, 102, 241, 0.15)',
          }}
        >
          <div className="flex items-center gap-2 mb-1.5 text-indigo-400 font-semibold text-xs uppercase tracking-wider">
            <Compass size={14} />
            <span>Recommended Starting Point</span>
          </div>
          <p className="text-xs text-gray-300 leading-relaxed">
            {overview.recommended_starting_point}
          </p>
        </div>

        {/* Career Context */}
        {overview.career_context && (
          <div
            className="p-4 rounded-xl"
            style={{
              background: 'rgba(16, 185, 129, 0.05)',
              border: '1px solid rgba(16, 185, 129, 0.15)',
            }}
          >
            <div className="flex items-center gap-2 mb-1.5 text-emerald-400 font-semibold text-xs uppercase tracking-wider">
              <Briefcase size={14} />
              <span>Career & Practical Application</span>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">
              {overview.career_context}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
