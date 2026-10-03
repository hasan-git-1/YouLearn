'use client';

import React, { useState } from 'react';
import { Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { InitialUniverseLoader } from './InitialUniverseLoader';
import { KnowledgeUniverseCanvas } from './KnowledgeUniverseCanvas';
import { HeroHeadline } from './HeroHeadline';
import { CommandSearch } from './CommandSearch';
import { FloatingEcosystemCards } from './FloatingEcosystemCards';
import { InteractiveProductSimulation } from './InteractiveProductSimulation';
import { DiscoveryBento } from './DiscoveryBento';
import { KnowledgeArchitecture } from './KnowledgeArchitecture';
import { UniverseCTA } from './UniverseCTA';

interface HomeClientProps {
  allTopics: { id: string; name: string; slug: string }[];
}

export function HomeClient({ allTopics }: HomeClientProps) {
  const [activeQuery, setActiveQuery] = useState<string>('');

  return (
    <div className="relative min-h-screen bg-[#06080f] text-white overflow-hidden">
      {/* ── Initial Micro-Loading Sequence ──────────────────────────────── */}
      <InitialUniverseLoader />

      {/* ── Fixed/Ambient Knowledge Universe Canvas Background ──────────── */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <KnowledgeUniverseCanvas activeQuery={activeQuery} />
      </div>

      {/* ── Fullscreen Immersive Hero Experience ────────────────────────── */}
      <section className="relative z-10 flex flex-col items-center justify-center min-h-[92vh] px-4 pt-16 pb-20 text-center">
        {/* Ambient hero lighting */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[720px] h-[550px] pointer-events-none rounded-full blur-[140px] opacity-20"
          style={{
            background: 'radial-gradient(circle, #6366f1 0%, #06b6d4 40%, transparent 70%)',
          }}
          aria-hidden="true"
        />

        {/* Floating Content Ecosystem Cards drifting in parallax */}
        <div className="absolute inset-0 max-w-7xl mx-auto pointer-events-none">
          <FloatingEcosystemCards />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
          {/* Animated Compact Badge */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-[11px] font-mono tracking-wider mb-6 shadow-[0_0_20px_rgba(99,102,241,0.2)]"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <Zap size={12} className="text-indigo-400" />
            <span>AI-GUIDED · QUOTA-SAFE · REAL CONTENT</span>
          </motion.div>

          {/* Enormous Editorial Headline */}
          <HeroHeadline />

          {/* Subheadline with Technical Clarity */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35, ease: [0.16, 1, 0.3, 1] as const }}
            className="mt-6 mb-10 text-gray-300 text-base sm:text-lg max-w-2xl leading-relaxed"
          >
            Discover verified YouTube Courses, Podcasts, Deep Dives &amp; top Creators for any learning goal — AI-organized, quota-safe, and always grounded in real content.
          </motion.p>

          {/* Command-Center Search Interface */}
          <div className="w-full">
            <CommandSearch onQueryChange={setActiveQuery} />
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-[10px] font-mono tracking-widest uppercase text-gray-400 pointer-events-none"
        >
          <span>Scroll to explore</span>
          <div className="w-4 h-7 rounded-full border border-gray-600 flex items-start justify-center p-1">
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
              className="w-1 h-1.5 rounded-full bg-indigo-400"
            />
          </div>
        </motion.div>
      </section>

      {/* ── Product Demonstration: Live Simulation ───────────────────────── */}
      <div className="relative z-10">
        <InteractiveProductSimulation />
      </div>

      {/* ── Discovery Section: Asymmetric Bento Grid ─────────────────────── */}
      <div className="relative z-10">
        <DiscoveryBento topicsList={allTopics} />
      </div>

      {/* ── Architecture Pillars: How Tubiq Works ───────────────────────── */}
      <div className="relative z-10">
        <KnowledgeArchitecture />
      </div>

      {/* ── Final Call to Action ────────────────────────────────────────── */}
      <div className="relative z-10 pb-20">
        <UniverseCTA />
      </div>
    </div>
  );
}
