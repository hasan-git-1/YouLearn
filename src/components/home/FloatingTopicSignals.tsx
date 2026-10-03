'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface TopicSignal {
  id: string;
  name: string;
  dotColor: string;
  dotGlow: string;
  positionClass: string;
  floatDuration: number;
  delay: number;
}

const SIGNALS: TopicSignal[] = [
  {
    id: 'sig-nodejs',
    name: 'Node.js',
    dotColor: '#10b981',
    dotGlow: '0 0 10px rgba(16, 185, 129, 0.8)',
    positionClass: 'top-10 left-[8%] sm:left-[12%]',
    floatDuration: 6.5,
    delay: 0,
  },
  {
    id: 'sig-ml',
    name: 'Machine Learning',
    dotColor: '#a855f7',
    dotGlow: '0 0 10px rgba(168, 85, 247, 0.8)',
    positionClass: 'top-12 right-[8%] sm:right-[13%]',
    floatDuration: 7.2,
    delay: 0.5,
  },
  {
    id: 'sig-fullstack',
    name: 'Full Stack',
    dotColor: '#06b6d4',
    dotGlow: '0 0 10px rgba(6, 182, 212, 0.8)',
    positionClass: 'top-[52%] left-[4%] sm:left-[7%]',
    floatDuration: 6.8,
    delay: 1.0,
  },
  {
    id: 'sig-datascience',
    name: 'Data Science',
    dotColor: '#6366f1',
    dotGlow: '0 0 10px rgba(99, 102, 241, 0.8)',
    positionClass: 'bottom-[22%] right-[22%] sm:right-[26%]',
    floatDuration: 7.6,
    delay: 1.5,
  },
];

export function FloatingTopicSignals() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-10" aria-hidden="true">
      {SIGNALS.map((sig) => (
        <motion.div
          key={sig.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{
            opacity: 0.82,
            y: [0, -6, 0],
          }}
          transition={{
            opacity: { duration: 0.8, delay: sig.delay },
            y: {
              duration: sig.floatDuration,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'easeInOut',
              delay: sig.delay,
            },
          }}
          className={`absolute ${sig.positionClass} hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-white/10 shadow-[0_4px_16px_rgba(0,0,0,0.5)]`}
          style={{
            background: 'rgba(9, 12, 25, 0.72)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}
        >
          {/* Glowing dot */}
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{
              backgroundColor: sig.dotColor,
              boxShadow: sig.dotGlow,
            }}
          />
          {/* Label text */}
          <span className="text-[11px] font-mono font-medium text-gray-300 tracking-tight">
            {sig.name}
          </span>
        </motion.div>
      ))}
    </div>
  );
}
