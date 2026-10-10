'use client';

import { motion } from 'framer-motion';

const ease = [0.16, 1, 0.3, 1] as const;

export function HeroHeadline() {
  return (
    <div className="flex max-w-[40rem] flex-col items-start text-left">
      <motion.div
        initial={{ opacity: 0, y: 8, filter: 'blur(5px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.55, delay: 0.22, ease }}
        className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-[#f8c784]/15 bg-[#2a1b12]/60 px-3 py-1.5 text-[10px] font-medium tracking-[0.18em] text-[#ffe2af] shadow-[0_0_20px_rgba(245,158,11,0.12)] backdrop-blur-xl"
      >
        <span className="h-2 w-2 rounded-full bg-[#fbbf24] shadow-[0_0_12px_rgba(251,191,36,0.9)]" />
        AI-GUIDED · QUOTA-SAFE · REAL CONTENT
      </motion.div>

      <h1
        className="max-w-[38rem] font-black tracking-[-0.065em] text-white"
        style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(3.2rem, 5.3vw, 5.8rem)', lineHeight: 0.92 }}
      >
        <motion.span
          initial={{ opacity: 0, y: 18, filter: 'blur(7px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.7, delay: 0.32, ease }}
          className="block"
        >
          Learn anything.
        </motion.span>
        <motion.span
          initial={{ opacity: 0, y: 18, filter: 'blur(7px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.7, delay: 0.46, ease }}
          className="mt-1 block"
        >
          <span className="block text-[#fff7ed]">Built for real</span>
          <span className="block bg-gradient-to-r from-[#fcd34d] via-[#fbbf24] to-[#fdba74] bg-clip-text text-transparent">
            learning momentum.
          </span>
        </motion.span>
      </h1>

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.62, ease }}
        className="mb-6 mt-6 max-w-xl text-sm font-normal leading-7 text-[#f5d4a6] sm:text-[15px]"
      >
        Discover courses, videos, podcasts and top creators for any topic — AI-organized,
        grounded in real indexed content and built to keep momentum high.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.76, ease }}
        className="flex flex-wrap items-center gap-4"
      >
        <div className="flex items-center -space-x-2" aria-hidden="true">
          {['#fbbf24', '#f59e0b', '#f97316', '#fb923c'].map((color, idx) => (
            <span
              key={color}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#1a120d] text-[10px] font-bold text-[#1a120d]"
              style={{ background: color, marginLeft: idx === 0 ? 0 : -8 }}
            >
              {idx + 1}
            </span>
          ))}
        </div>
        <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#f1c27d]">
          <span className="text-[#fff7ed]">650+ Happy Clients</span>
          <span className="mx-2 text-[#f5d4a6]">•</span>
          Live Support
        </div>
      </motion.div>
    </div>
  );
}
