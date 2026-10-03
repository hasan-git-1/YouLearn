'use client';

import React from 'react';
import { ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { KnowledgeUniverseCanvas } from './KnowledgeUniverseCanvas';
import { HeroHeadline } from './HeroHeadline';
import { CommandSearch } from './CommandSearch';
import { FloatingEcosystemCards } from './FloatingEcosystemCards';
import { FloatingTopicSignals } from './FloatingTopicSignals';
import { ExploreUniverseSection } from './ExploreUniverseSection';
import { InteractiveProductSimulation } from './InteractiveProductSimulation';
import { DiscoveryBento } from './DiscoveryBento';
import { KnowledgeArchitecture } from './KnowledgeArchitecture';
import { UniverseCTA } from './UniverseCTA';

interface HomeClientProps {
  allTopics: { id: string; name: string; slug: string }[];
}

export function HomeClient({ allTopics }: HomeClientProps) {
  return (
    <div className="relative min-h-screen bg-[#05070e] text-white overflow-hidden">
      {/* ── Fixed Atmospheric Background Canvas ────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="fixed inset-0 z-0 pointer-events-none"
      >
        <KnowledgeUniverseCanvas />
      </motion.div>

      {/* ── 01: HERO / TUBIQ APPLICATION ───────────────────────────────── */}
      <section className="relative z-10 flex flex-col items-center justify-center min-h-[92vh] px-4 pt-10 pb-20 text-center">
        {/* Soft blue-violet atmospheric glow */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[680px] h-[500px] pointer-events-none rounded-full blur-[140px] opacity-15"
          style={{
            background: 'radial-gradient(circle, #6366f1 0%, #06b6d4 35%, transparent 70%)',
          }}
          aria-hidden="true"
        />

        {/* Peripheral Signals (Node.js, Machine Learning, Data Science) */}
        <FloatingTopicSignals />

        {/* Exactly 4 Floating Content Cards */}
        <div className="absolute inset-0 max-w-7xl mx-auto pointer-events-none">
          <FloatingEcosystemCards />
        </div>

        {/* Central Hero Column */}
        <div className="relative z-20 max-w-3xl mx-auto flex flex-col items-center w-full">
          {/* Headline & Subtitle */}
          <HeroHeadline />

          {/* Command Search & Topic Chips */}
          <div className="w-full">
            <CommandSearch />
          </div>
        </div>

        {/* Celestial Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.65 }}
          transition={{ delay: 1.3, duration: 0.7 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-[10px] font-mono tracking-widest uppercase text-gray-400 pointer-events-none z-20"
        >
          <div className="w-4 h-6 rounded-full border border-gray-600/60 flex items-start justify-center p-1">
            <motion.div
              animate={{ y: [0, 5, 0] }}
              transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
              className="w-1 h-1.5 rounded-full bg-indigo-400"
            />
          </div>
          <span className="text-[10px] text-gray-400 flex items-center gap-1">
            Scroll to explore
          </span>
          <ChevronDown size={12} className="text-gray-400 animate-bounce -mt-1" />
        </motion.div>
      </section>

      {/* ── 02: EXPLORE SECTION ────────────────────────────────────────── */}
      <div className="relative z-10">
        <ExploreUniverseSection />
      </div>

      {/* ── 03: TUBIQ SYNTHESIS / REAL KNOWLEDGE ───────────────────────── */}
      <div className="relative z-10">
        <InteractiveProductSimulation />
      </div>

      {/* ── 04: KNOWLEDGE ECOSYSTEM / DISCOVERY ─────────────────────────── */}
      <div className="relative z-10">
        <DiscoveryBento topicsList={allTopics} />
      </div>

      {/* ── 05: INTELLIGENT KNOWLEDGE UNIVERSE ─────────────────────────── */}
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
