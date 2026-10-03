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

// Exactly THREE subtle background signals as strictly specified:
// 1. Node.js
// 2. Data Science
// 3. Machine Learning
const SIGNALS: TopicSignal[] = [
  {
    id: 'sig-nodejs',
    name: 'Node.js',
    dotColor: '#10b981',
    dotGlow: '0 0 8px rgba(16, 185, 129, 0.6)',
    positionClass: 'top-10 left-[6%] xl:left-[10%]',
    floatDuration: 7.2,
    delay: 0,
  },
  {
    id: 'sig-ml',
    name: 'Machine Learning',
    dotColor: '#a855f7',
    dotGlow: '0 0 8px rgba(168, 85, 247, 0.6)',
    positionClass: 'top-12 right-[6%] xl:right-[10%]',
    floatDuration: 7.8,
    delay: 0.4,
  },
  {
    id: 'sig-datascience',
    name: 'Data Science',
    dotColor: '#6366f1',
    dotGlow: '0 0 8px rgba(99, 102, 241, 0.6)',
    positionClass: 'bottom-20 right-[14%] xl:right-[18%]',
    floatDuration: 8.0,
    delay: 0.8,
  },
];

export function FloatingTopicSignals() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-10" aria-hidden="true">
      {SIGNALS.map((sig) => (
        <motion.div
          key={sig.id}
          initial={{ opacity: 0 }}
          animate={{
            opacity: 0.65,
            y: [0, -5, 0],
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
          className={`absolute ${sig.positionClass} hidden lg:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-white/[0.06] shadow-[0_4px_16px_rgba(0,0,0,0.4)]`}
          style={{
            background: 'rgba(10, 13, 26, 0.6)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}
        >
          {/* Subtle Glowing Dot */}
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{
              backgroundColor: sig.dotColor,
              boxShadow: sig.dotGlow,
            }}
          />
          {/* Label Text */}
          <span className="text-[10px] font-mono text-gray-400 font-normal tracking-wide">
            {sig.name}
          </span>
        </motion.div>
      ))}
    </div>
  );
}
