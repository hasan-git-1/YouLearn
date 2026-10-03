'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Compass, Sparkles, Terminal } from 'lucide-react';

export function UniverseCTA() {
  return (
    <section className="py-24 px-4 relative max-w-5xl mx-auto text-center">
      {/* Background radial glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] pointer-events-none rounded-full blur-[120px] opacity-25"
        style={{
          background: 'radial-gradient(circle, #6366f1 0%, #a855f7 40%, transparent 70%)',
        }}
        aria-hidden="true"
      />

      <div
        className="relative z-10 p-8 sm:p-14 rounded-3xl border border-indigo-500/30 overflow-hidden shadow-2xl"
        style={{
          background: 'linear-gradient(135deg, rgba(16, 20, 42, 0.95), rgba(9, 12, 24, 0.98))',
          backdropFilter: 'blur(32px)',
        }}
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-mono mb-6">
          <Sparkles size={12} className="text-indigo-400" />
          <span>YOUR LEARNING UNIVERSE AWAITS</span>
        </div>

        <h2
          className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4 max-w-3xl mx-auto"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Master any skill with the content that <span className="gradient-text">actually matters.</span>
        </h2>

        <p className="text-gray-300 text-sm sm:text-base max-w-xl mx-auto mb-8 leading-relaxed">
          Zero marketing fluff, zero hallucinations. Explore 25+ pre-indexed topic curriculums or launch a real-time semantic discovery search.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/topics"
            className="flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-semibold text-sm shadow-[0_0_24px_rgba(99,102,241,0.5)] transition-all transform hover:-translate-y-0.5"
            style={{ textDecoration: 'none' }}
          >
            <Compass size={17} />
            <span>Explore All 25+ Curriculums</span>
            <ArrowRight size={15} />
          </Link>

          <Link
            href="/search?q=AI%20Engineering"
            className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 text-gray-200 text-sm font-semibold border border-white/10 hover:border-white/20 transition-all"
            style={{ textDecoration: 'none' }}
          >
            <Terminal size={15} className="text-cyan-400" />
            <span>Try &ldquo;AI Engineering&rdquo;</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
