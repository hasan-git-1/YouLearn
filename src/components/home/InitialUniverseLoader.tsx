'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen } from 'lucide-react';

export function InitialUniverseLoader() {
  const [visible, setVisible] = useState(false);
  const [phase, setPhase] = useState<'node' | 'network' | 'logo' | 'complete'>('node');

  useEffect(() => {
    // Check if user has already loaded this session or prefers reduced motion
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion || sessionStorage.getItem('tubiq_loader_shown')) {
      return;
    }

    const t0 = setTimeout(() => setVisible(true), 0);
    const t1 = setTimeout(() => setPhase('network'), 280);
    const t2 = setTimeout(() => setPhase('logo'), 600);
    const t3 = setTimeout(() => {
      setPhase('complete');
      setVisible(false);
      try {
        sessionStorage.setItem('tubiq_loader_shown', 'true');
      } catch {
        // ignore
      }
    }, 1000);

    return () => {
      clearTimeout(t0);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="universe-loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.45, ease: [0.4, 0, 0.2, 1] } }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center pointer-events-none select-none"
          style={{ background: '#05070d' }}
          aria-hidden="true"
        >
          {/* Ambient Glow */}
          <div
            className="absolute rounded-full pointer-events-none blur-3xl opacity-30"
            style={{
              width: 380,
              height: 380,
              background: 'radial-gradient(circle, #6366f1 0%, #06b6d4 40%, transparent 70%)',
            }}
          />

          <div className="relative flex flex-col items-center justify-center">
            {/* Visual Node & Network Animation */}
            <div className="relative w-24 h-24 flex items-center justify-center">
              {/* Radiating rings */}
              {phase !== 'node' && (
                <>
                  <motion.div
                    initial={{ scale: 0.2, opacity: 0 }}
                    animate={{ scale: 1.8, opacity: [0, 0.6, 0] }}
                    transition={{ duration: 0.7, ease: 'easeOut' }}
                    className="absolute inset-0 rounded-full border border-indigo-500/40"
                  />
                  <motion.div
                    initial={{ scale: 0.4, opacity: 0 }}
                    animate={{ scale: 2.4, opacity: [0, 0.4, 0] }}
                    transition={{ duration: 0.8, delay: 0.1, ease: 'easeOut' }}
                    className="absolute inset-0 rounded-full border border-cyan-500/30"
                  />
                </>
              )}

              {/* Connecting orbital nodes */}
              {phase === 'network' && (
                <div className="absolute inset-0">
                  {[0, 60, 120, 180, 240, 300].map((deg, i) => (
                    <motion.div
                      key={deg}
                      initial={{ scale: 0, opacity: 0, x: 0, y: 0 }}
                      animate={{
                        scale: 1,
                        opacity: 0.8,
                        x: Math.cos((deg * Math.PI) / 180) * 36,
                        y: Math.sin((deg * Math.PI) / 180) * 36,
                      }}
                      transition={{ duration: 0.35, delay: i * 0.03, ease: 'easeOut' }}
                      className="absolute top-1/2 left-1/2 w-2 h-2 -ml-1 -mt-1 rounded-full bg-indigo-400 shadow-[0_0_8px_#6366f1]"
                    />
                  ))}
                </div>
              )}

              {/* Center Core Node / Logo */}
              <motion.div
                initial={{ scale: 0.4, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="relative z-10 flex items-center justify-center rounded-2xl w-12 h-12 shadow-[0_0_24px_rgba(99,102,241,0.6)]"
                style={{
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                }}
              >
                {phase === 'logo' ? (
                  <motion.div
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <BookOpen size={22} className="text-white" strokeWidth={2.5} />
                  </motion.div>
                ) : (
                  <div className="w-3 h-3 rounded-full bg-white shadow-[0_0_10px_#fff]" />
                )}
              </motion.div>
            </div>

            {/* Subtext */}
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 0.7, y: 0 }}
              transition={{ delay: 0.2, duration: 0.3 }}
              className="mt-5 text-[11px] font-mono tracking-widest uppercase text-indigo-300/80 flex items-center gap-2"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              Initializing Knowledge Universe
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
