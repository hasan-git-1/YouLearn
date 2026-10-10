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
        className="mb-6 inline-flex items-center rounded-full border border-indigo-400/20 bg-white/[0.05] px-3 py-1 text-[10px] font-medium tracking-[0.18em] text-indigo-200 shadow-[0_0_20px_rgba(99,102,241,0.14)] backdrop-blur-xl"
      >
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
          <span className="block text-slate-100">From the content that</span>
          <span className="block bg-gradient-to-r from-violet-300 via-indigo-300 to-sky-300 bg-clip-text text-transparent">
            actually matters.
          </span>
        </motion.span>
      </h1>

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.62, ease }}
        className="mb-8 mt-6 max-w-xl text-sm font-normal leading-7 text-slate-300 sm:text-[15px]"
      >
        Discover courses, videos, podcasts and top creators for any topic — AI-organized,
        grounded in real indexed content.
      </motion.p>
    </div>
  );
}
