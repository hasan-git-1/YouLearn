'use client';

import React from 'react';
import { motion } from 'framer-motion';

export function HeroHeadline() {
  const easeCurve = [0.16, 1, 0.3, 1] as const;

  return (
    <div className="flex flex-col items-center text-center select-none max-w-3xl mx-auto px-4">
      {/* ── Above Headline: Compact Product Badge ───────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.1, ease: easeCurve }}
        className="inline-flex items-center px-3.5 py-1 rounded-full border border-indigo-500/25 bg-[#0b0e22]/80 backdrop-blur-md text-indigo-300 text-[11px] font-mono tracking-wider mb-5 shadow-[0_0_14px_rgba(99,102,241,0.18)]"
      >
        <span>AI-GUIDED · QUOTA-SAFE · REAL CONTENT</span>
      </motion.div>

      {/* ── Main Headline: Professional, Crisp, Product-First Typography ── */}
      <h1
        className="text-center font-bold tracking-tight text-white max-w-2xl mx-auto"
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(2rem, 3.8vw, 3.15rem)',
          lineHeight: 1.15,
          letterSpacing: '-0.025em',
        }}
      >
        <motion.span
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: easeCurve }}
          className="inline"
        >
          Learn anything from the content that{' '}
        </motion.span>
        <motion.span
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.32, ease: easeCurve }}
          className="inline font-extrabold"
        >
          <span
            className="bg-gradient-to-r from-sky-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent"
            style={{
              textShadow: '0 0 35px rgba(99, 102, 241, 0.3)',
            }}
          >
            actually matters.
          </span>
        </motion.span>
      </h1>

      {/* ── Supporting Subtitle ─────────────────────────────────────────── */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.45, ease: easeCurve }}
        className="mt-4 mb-7 text-slate-300 text-sm sm:text-base max-w-lg mx-auto leading-relaxed font-normal"
      >
        Discover courses, videos, podcasts &amp; top creators for any topic — AI-organized, never fabricated, sourced from real indexed content.
      </motion.p>
    </div>
  );
}
