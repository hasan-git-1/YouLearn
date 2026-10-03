'use client';

import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Star, Mic, Play, Box } from 'lucide-react';

interface FloatingCardProps {
  delay: number;
}

export function FloatingEcosystemCards() {
  return (
    <div className="absolute inset-0 pointer-events-none select-none overflow-hidden z-20">
      {/* ── CARD 1: Top-Left (React 19 & Full Stack Patterns) ─────────── */}
      <TiltWrapper
        className="hidden lg:block absolute top-12 left-4 xl:left-8"
        delay={0.1}
        floatDuration={6}
      >
        <Link
          href="/topics/full-stack-web-development"
          className="block w-[300px] p-4 rounded-2xl border border-indigo-500/30 shadow-[0_16px_40px_rgba(0,0,0,0.65)] hover:border-indigo-400/60 transition-all duration-300 group pointer-events-auto"
          style={{
            background: 'linear-gradient(135deg, rgba(14, 18, 38, 0.90), rgba(8, 10, 22, 0.94))',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            textDecoration: 'none',
          }}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              {/* Badge */}
              <div className="flex items-center gap-1.5 mb-2.5">
                <span className="flex items-center justify-center w-4 h-4 rounded bg-red-500/20 text-red-500">
                  <Play size={9} className="fill-red-500 ml-0.5" />
                </span>
                <span className="text-[11px] font-mono font-medium text-gray-300">
                  YouTube
                </span>
              </div>

              {/* Title */}
              <h4
                className="text-[13px] font-bold text-white group-hover:text-indigo-300 transition-colors leading-snug mb-2"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                React 19 &amp; Full Stack Patterns
              </h4>

              {/* Meta */}
              <p className="text-[11px] font-mono text-gray-400 flex items-center gap-1.5">
                <span>12h</span>
                <span>•</span>
                <span className="flex items-center gap-0.5 text-amber-400">
                  4.8 <Star size={10} className="fill-amber-400 inline" />
                </span>
              </p>
            </div>

            {/* Code / React Atom Preview Graphic */}
            <div className="w-14 h-14 rounded-xl bg-white/[0.04] border border-white/10 flex flex-col items-center justify-center relative overflow-hidden flex-shrink-0">
              <div className="space-y-1 w-8 opacity-40 mb-1">
                <div className="h-0.5 w-6 bg-cyan-400 rounded" />
                <div className="h-0.5 w-4 bg-indigo-400 rounded" />
              </div>
              <div className="text-cyan-400 animate-spin" style={{ animationDuration: '14s' }}>
                <span className="text-sm">⚛</span>
              </div>
            </div>
          </div>
        </Link>
      </TiltWrapper>

      {/* ── CARD 2: Top-Right (AI Engineering & Vector RAG) ──────────── */}
      <TiltWrapper
        className="hidden lg:block absolute top-14 right-4 xl:right-8"
        delay={0.25}
        floatDuration={6.5}
      >
        <Link
          href="/topics/ai-engineering"
          className="block w-[300px] p-4 rounded-2xl border border-cyan-500/30 shadow-[0_16px_40px_rgba(0,0,0,0.65)] hover:border-cyan-400/60 transition-all duration-300 group pointer-events-auto"
          style={{
            background: 'linear-gradient(135deg, rgba(11, 18, 38, 0.90), rgba(7, 11, 24, 0.94))',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            textDecoration: 'none',
          }}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              {/* Badge */}
              <div className="inline-flex items-center px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-[10px] font-mono font-bold text-cyan-300 mb-2.5">
                ROADMAP
              </div>

              {/* Title */}
              <h4
                className="text-[13px] font-bold text-white group-hover:text-cyan-300 transition-colors leading-snug mb-2"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                AI Engineering &amp; Vector RAG
              </h4>

              {/* Meta */}
              <p className="text-[11px] font-mono text-gray-400">
                28 videos • 8 top creators
              </p>
            </div>

            {/* 3D Isometric Cube Graphic + Arrow */}
            <div className="flex flex-col items-center gap-2 flex-shrink-0">
              <div className="w-11 h-11 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Box size={18} className="animate-pulse" />
              </div>
              <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 group-hover:text-cyan-300 group-hover:translate-x-0.5 transition-all">
                <ArrowRight size={11} />
              </div>
            </div>
          </div>
        </Link>
      </TiltWrapper>

      {/* ── CARD 3: Bottom-Left (Distributed Architecture Deep Dive) ──── */}
      <TiltWrapper
        className="hidden xl:block absolute bottom-12 left-4 xl:left-8"
        delay={0.4}
        floatDuration={7}
      >
        <Link
          href="/topics/system-design"
          className="block w-[310px] p-4 rounded-2xl border border-amber-500/30 shadow-[0_16px_40px_rgba(0,0,0,0.65)] hover:border-amber-400/60 transition-all duration-300 group pointer-events-auto"
          style={{
            background: 'linear-gradient(135deg, rgba(22, 17, 10, 0.90), rgba(12, 10, 8, 0.94))',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            textDecoration: 'none',
          }}
        >
          <div className="flex items-center justify-between gap-3">
            {/* System Nodes Graphic */}
            <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 flex-shrink-0">
              <span className="text-xl">⛶</span>
            </div>

            <div className="flex-1">
              {/* Badge */}
              <div className="inline-flex items-center px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-[10px] font-mono font-bold text-amber-300 mb-1.5">
                SYSTEM DESIGN
              </div>

              {/* Title */}
              <h4
                className="text-[13px] font-bold text-white group-hover:text-amber-300 transition-colors leading-snug mb-1"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Distributed Architecture Deep Dive
              </h4>

              {/* Meta */}
              <p className="text-[11px] font-mono text-gray-400">
                High Scale • Fault Tolerance
              </p>
            </div>

            {/* Arrow */}
            <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 group-hover:text-amber-300 group-hover:translate-x-0.5 transition-all flex-shrink-0">
              <ArrowRight size={11} />
            </div>
          </div>
        </Link>
      </TiltWrapper>

      {/* ── CARD 4: Bottom-Right (Foundations of Modern AI Podcast) ──── */}
      <TiltWrapper
        className="hidden xl:block absolute bottom-12 right-4 xl:right-8"
        delay={0.55}
        floatDuration={6.8}
      >
        <Link
          href="/topics/ai-engineering"
          className="block w-[310px] p-4 rounded-2xl border border-violet-500/30 shadow-[0_16px_40px_rgba(0,0,0,0.65)] hover:border-violet-400/60 transition-all duration-300 group pointer-events-auto"
          style={{
            background: 'linear-gradient(135deg, rgba(18, 12, 34, 0.90), rgba(10, 8, 20, 0.94))',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            textDecoration: 'none',
          }}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              {/* Badge */}
              <div className="inline-flex items-center px-2 py-0.5 rounded-full bg-violet-500/15 border border-violet-500/30 text-[10px] font-mono font-bold text-violet-300 mb-2">
                PODCAST
              </div>

              {/* Title */}
              <h4
                className="text-[13px] font-bold text-white group-hover:text-violet-300 transition-colors leading-snug mb-1.5"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Foundations of Modern AI
              </h4>

              {/* Meta */}
              <p className="text-[11px] font-mono text-gray-400">
                Deep Tech Dialogue • 1h 45m
              </p>
            </div>

            {/* Mic & Waveform Graphic */}
            <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
              <div className="w-10 h-10 rounded-xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center text-violet-400">
                <Mic size={17} />
              </div>
              {/* Waveform visualizer */}
              <div className="flex items-center gap-0.5 h-3">
                {[4, 8, 12, 7, 10, 5, 9, 3].map((h, i) => (
                  <span
                    key={i}
                    className="w-0.5 bg-violet-400 rounded-full"
                    style={{ height: `${h}px` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </Link>
      </TiltWrapper>
    </div>
  );
}

function TiltWrapper({
  children,
  className,
  delay,
  floatDuration,
}: {
  children: React.ReactNode;
  className: string;
  delay: number;
  floatDuration: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 220, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 220, damping: 20 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['7deg', '-7deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-7deg', '7deg']);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set(e.clientX - rect.left - rect.width / 2);
    y.set(e.clientY - rect.top - rect.height / 2);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] as const }}
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
