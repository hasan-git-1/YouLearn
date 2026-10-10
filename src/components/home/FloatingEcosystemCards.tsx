'use client';

import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import Link from 'next/link';

export function FloatingEcosystemCards() {
  return (
    <div className="absolute inset-0 pointer-events-none select-none overflow-hidden z-20">
      {/* ── CARD 1: Upper Left (COURSE — React 19 & Full Stack Patterns) ── */}
      <TiltWrapper
        className="absolute top-[16%] right-[6%]"
        delay={1.05}
        enterX={-24}
        floatDuration={6.5}
      >
        <Link
          href="/topics/full-stack-development"
          className="block w-[280px] p-4 rounded-2xl border border-white/10 shadow-[0_16px_36px_rgba(0,0,0,0.55)] hover:border-indigo-500/40 transition-all duration-300 group pointer-events-auto"
          style={{
            background: 'linear-gradient(135deg, rgba(12, 16, 34, 0.85), rgba(7, 10, 22, 0.90))',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            textDecoration: 'none',
          }}
        >
          {/* Category Badge */}
          <div className="flex items-center justify-between mb-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider bg-indigo-500/15 border border-indigo-500/30 text-indigo-300">
              COURSE
            </span>
          </div>

          {/* Strong Title */}
          <h4
            className="text-sm font-semibold text-white group-hover:text-indigo-200 transition-colors leading-snug mb-1.5"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            React 19 &amp; Full Stack Patterns
          </h4>

          {/* Minimal Metadata */}
          <p className="text-xs font-mono text-gray-400 flex items-center gap-1.5">
            <span>12h</span>
            <span>·</span>
            <span className="text-amber-400">4.8 ★</span>
          </p>
        </Link>
      </TiltWrapper>

      {/* ── CARD 2: Upper Right (ROADMAP — AI Engineering & Vector RAG) ─── */}
      <TiltWrapper
        className="absolute top-[45%] right-[15%]"
        delay={1.1}
        enterX={24}
        floatDuration={7.0}
      >
        <Link
          href="/topics/ai-engineering"
          className="block w-[280px] p-4 rounded-2xl border border-white/10 shadow-[0_16px_36px_rgba(0,0,0,0.55)] hover:border-cyan-500/40 transition-all duration-300 group pointer-events-auto"
          style={{
            background: 'linear-gradient(135deg, rgba(10, 16, 32, 0.85), rgba(6, 10, 20, 0.90))',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            textDecoration: 'none',
          }}
        >
          {/* Category Badge */}
          <div className="flex items-center justify-between mb-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider bg-cyan-500/15 border border-cyan-500/30 text-cyan-300">
              ROADMAP
            </span>
          </div>

          {/* Strong Title */}
          <h4
            className="text-sm font-semibold text-white group-hover:text-cyan-200 transition-colors leading-snug mb-1.5"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            AI Engineering &amp; Vector RAG
          </h4>

          {/* Minimal Metadata */}
          <p className="text-xs font-mono text-gray-400">
            28 videos · 8 top creators
          </p>
        </Link>
      </TiltWrapper>

      {/* ── CARD 3: Lower Left (SYSTEM DESIGN — Distributed Architecture) ── */}
      <TiltWrapper
        className="absolute bottom-[8%] right-[2%]"
        delay={1.15}
        enterX={-24}
        floatDuration={7.2}
      >
        <Link
          href="/topics/system-design"
          className="block w-[280px] p-4 rounded-2xl border border-white/10 shadow-[0_16px_36px_rgba(0,0,0,0.55)] hover:border-amber-500/40 transition-all duration-300 group pointer-events-auto"
          style={{
            background: 'linear-gradient(135deg, rgba(16, 14, 10, 0.85), rgba(10, 8, 6, 0.90))',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            textDecoration: 'none',
          }}
        >
          {/* Category Badge */}
          <div className="flex items-center justify-between mb-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider bg-amber-500/15 border border-amber-500/30 text-amber-300">
              SYSTEM DESIGN
            </span>
          </div>

          {/* Strong Title */}
          <h4
            className="text-sm font-semibold text-white group-hover:text-amber-200 transition-colors leading-snug mb-1.5"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Distributed Architecture Deep Dive
          </h4>

          {/* Minimal Metadata */}
          <p className="text-xs font-mono text-gray-400">
            High Scale · Fault Tolerance
          </p>
        </Link>
      </TiltWrapper>

      {/* ── CARD 4: Lower Right (PODCAST — Foundations of Modern AI) ───── */}
      <TiltWrapper
        className="absolute top-[72%] right-[27%]"
        delay={1.2}
        enterX={24}
        floatDuration={6.8}
      >
        <Link
          href="/topics/ai-engineering"
          className="block w-[280px] p-4 rounded-2xl border border-white/10 shadow-[0_16px_36px_rgba(0,0,0,0.55)] hover:border-violet-500/40 transition-all duration-300 group pointer-events-auto"
          style={{
            background: 'linear-gradient(135deg, rgba(14, 10, 26, 0.85), rgba(8, 6, 16, 0.90))',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            textDecoration: 'none',
          }}
        >
          {/* Category Badge */}
          <div className="flex items-center justify-between mb-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider bg-violet-500/15 border border-violet-500/30 text-violet-300">
              PODCAST
            </span>
          </div>

          {/* Strong Title */}
          <h4
            className="text-sm font-semibold text-white group-hover:text-violet-200 transition-colors leading-snug mb-1.5"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Foundations of Modern AI
          </h4>

          {/* Minimal Metadata */}
          <p className="text-xs font-mono text-gray-400">
            Deep Tech Dialogue · 1h 45m
          </p>
        </Link>
      </TiltWrapper>
    </div>
  );
}

function TiltWrapper({
  children,
  className,
  delay,
  enterX,
  floatDuration,
}: {
  children: React.ReactNode;
  className: string;
  delay: number;
  enterX: number;
  floatDuration: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 200, damping: 22 });
  const mouseYSpring = useSpring(y, { stiffness: 200, damping: 22 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['6deg', '-6deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-6deg', '6deg']);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: enterX }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] as const }}
      className={className}
      style={{ perspective: 1000 }}
    >
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{
          duration: floatDuration,
          repeat: Infinity,
          repeatType: 'reverse',
          ease: 'easeInOut',
          delay,
        }}
      >
        <motion.div
          ref={ref}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        >
          {children}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
