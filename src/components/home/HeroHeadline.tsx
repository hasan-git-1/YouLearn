'use client';

import React from 'react';
import { motion, type Variants } from 'framer-motion';

export function HeroHeadline() {
  const line1 = 'Learn anything.';
  const line2 = 'From the content that';
  const line3Highlight = 'actually matters.';

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.15,
      },
    },
  };

  const wordVariants: Variants = {
    hidden: {
      opacity: 0,
      y: 24,
      filter: 'blur(8px)',
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: {
        duration: 0.75,
        ease: [0.16, 1, 0.3, 1] as const,
      },
    },
  };

  return (
    <motion.h1
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="text-center font-extrabold tracking-tight max-w-5xl mx-auto select-none"
      style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'clamp(2.6rem, 6.5vw, 5.25rem)',
        lineHeight: 1.06,
        letterSpacing: '-0.035em',
        color: 'var(--text-primary)',
      }}
    >
      <div className="flex flex-wrap justify-center gap-x-3.5 gap-y-1 mb-1.5">
        {line1.split(' ').map((word, i) => (
          <motion.span
            key={`l1-${i}`}
            variants={wordVariants}
            className="inline-block"
          >
            {word}
          </motion.span>
        ))}
      </div>

      <div className="flex flex-wrap justify-center gap-x-3.5 gap-y-1 mb-1.5">
        {line2.split(' ').map((word, i) => (
          <motion.span
            key={`l2-${i}`}
            variants={wordVariants}
            className="inline-block text-gray-200"
          >
            {word}
          </motion.span>
        ))}
      </div>

      <div className="flex justify-center">
        <motion.span
          variants={wordVariants}
          className="inline-block relative font-black"
        >
          <span
            className="relative z-10"
            style={{
              background: 'linear-gradient(135deg, #38bdf8 0%, #818cf8 35%, #a855f7 70%, #c084fc 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 0 45px rgba(99, 102, 241, 0.45)',
            }}
          >
            {line3Highlight}
          </span>
          {/* Subtle electric violet underglow line */}
          <motion.span
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ delay: 0.85, duration: 0.8, ease: [0.16, 1, 0.3, 1] as const }}
            className="absolute left-0 bottom-1 w-full h-[2.5px] rounded-full origin-left pointer-events-none"
            style={{
              background: 'linear-gradient(90deg, transparent, #38bdf8, #818cf8, #a855f7, transparent)',
            }}
          />
        </motion.span>
      </div>
    </motion.h1>
  );
}
