'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Cpu, GitMerge, CheckCircle, Database, Network } from 'lucide-react';

const PILLARS = [
  {
    step: '01',
    title: 'Ingestion & De-noising',
    subtitle: 'Filtering out the 99% fluff',
    description:
      'We crawl verified instructional domains on YouTube, discarding low-retention clickbait, sponsor bloat, and AI voice slop to isolate genuine pedagogical signal.',
    icon: <Database size={22} className="text-cyan-400" />,
    badge: 'STAGE 1: SIGNAL EXTRACTION',
    borderColor: 'border-cyan-500/30',
  },
  {
    step: '02',
    title: 'Multimodal Classification',
    subtitle: 'Courses vs. Podcasts vs. Deep Dives',
    description:
      'Using dual-tier heuristic rules and Gemini structured classification, every piece of content is categorized by format, difficulty, and instructional rigor.',
    icon: <Cpu size={22} className="text-violet-400" />,
    badge: 'STAGE 2: INTENT TAXONOMY',
    borderColor: 'border-violet-500/30',
  },
  {
    step: '03',
    title: 'Grounded Knowledge Paths',
    subtitle: 'Synthesizing discrete videos into curriculums',
    description:
      'Isolated videos are connected into structured milestone learning tracks (Foundations → Core Patterns → Production Architecture) with estimated completion times.',
    icon: <GitMerge size={22} className="text-indigo-400" />,
    badge: 'STAGE 3: CURRICULUM GRAPH',
    borderColor: 'border-indigo-500/30',
  },
  {
    step: '04',
    title: 'Zero Hallucination Guarantee',
    subtitle: 'Always rooted in real YouTube content',
    description:
      'Unlike generic LLMs that hallucinate fake book titles and broken course links, every single item in Tubiq is an indexed, verifiable video or playlist with real creator attribution.',
    icon: <ShieldCheck size={22} className="text-emerald-400" />,
    badge: 'STAGE 4: TRUTH GROUNDING',
    borderColor: 'border-emerald-500/30',
  },
];

export function KnowledgeArchitecture() {
  return (
    <section className="py-24 px-4 relative max-w-7xl mx-auto border-t border-white/5">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-mono mb-4">
          <Network size={12} className="text-indigo-400" />
          <span>SYSTEM ARCHITECTURE</span>
        </div>
        <h2
          className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          How the intelligent knowledge universe works.
        </h2>
        <p className="text-gray-400 text-sm sm:text-base">
          A four-stage verification pipeline transforming the chaotic YouTube firehose into structured mastery paths.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {PILLARS.map((p, idx) => (
          <motion.div
            key={p.step}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            className={`p-6 rounded-3xl bg-[#0b0e1d]/90 border border-white/10 hover:${p.borderColor} transition-all duration-300 flex flex-col justify-between group shadow-xl`}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:scale-105 transition-transform">
                  {p.icon}
                </div>
                <span className="text-xs font-mono font-bold text-gray-500 group-hover:text-indigo-400 transition-colors">
                  {p.step}
                </span>
              </div>

              <span className="text-[10px] font-mono tracking-wider text-gray-400 block mb-1">
                {p.badge}
              </span>

              <h3
                className="text-lg font-bold text-white mb-1 group-hover:text-indigo-300 transition-colors"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {p.title}
              </h3>
              <p className="text-xs font-medium text-indigo-400/90 mb-3">
                {p.subtitle}
              </p>

              <p className="text-xs text-gray-400 leading-relaxed">
                {p.description}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-white/5 flex items-center gap-1.5 text-[11px] font-mono text-emerald-400">
              <CheckCircle size={12} />
              <span>Verified Deterministic</span>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
