'use client';

import React from 'react';
import { motion } from 'framer-motion';

export function HeroHeadline() {
  const easeCurve = [0.16, 1, 0.3, 1] as const;

  return (
    <div className="flex flex-col items-center text-center select-none">
      {/* ── Above Headline: Small Clean Badge ────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: easeCurve }}
        className="inline-flex items-center px-3.5 py-1 rounded-full border border-indigo-500/30 bg-[#0c1024]/80 backdrop-blur-md text-indigo-300 text-[11px] font-mono tracking-wider mb-6 shadow-[0_0_16px_rgba(99,102,241,0.2)]"
      >
        <span>AI-GUIDED · QUOTA-SAFE · REAL CONTENT</span>
      </motion.div>

      {/* ── Main Headline: 3 Clean Lines Revealed Line-by-Line ────────────── */}
      <h1
        className="text-center font-extrabold tracking-tight max-w-4xl mx-auto"
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(2.75rem, 6.5vw, 5.5rem)',
          lineHeight: 1.05,
          letterSpacing: '-0.035em',
        }}
      >
        {/* Line 1: Pure White */}
        <motion.span
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.22, ease: easeCurve }}
          className="block text-white"
        >
          Learn anything.
        </motion.span>

        {/* Line 2: Pure White */}
        <motion.span
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.35, ease: easeCurve }}
          className="block text-white"
        >
          From the content that
        </motion.span>

        {/* Line 3: Sophisticated Blue → Violet Gradient */}
        <motion.span
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.48, ease: easeCurve }}
          className="block"
        >
          <span
            className="bg-gradient-to-r from-sky-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent"
            style={{
              textShadow: '0 0 40px rgba(99, 102, 241, 0.35)',
            }}
          >
            actually matters.
          </span>
        </motion.span>
      </h1>

      {/* ── Subtitle: Controlled Width, Highly Readable ──────────────────── */}
      <motion.p
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.65, ease: easeCurve }}
        className="mt-6 mb-8 text-slate-300 text-sm sm:text-base max-w-xl mx-auto leading-relaxed"
      >
        Discover courses, videos, podcasts &amp; top creators for any topic — AI-organized, never fabricated, sourced from real indexed content.
      </motion.p>
    </div>
  );
}
