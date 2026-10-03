'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Cpu, GitMerge, CheckCircle, Database, Network, ArrowRight } from 'lucide-react';

const STAGES = [
  {
    step: '01',
    stage: 'STAGE 01',
    title: 'SIGNAL EXTRACTION',
    subtitle: 'Ingestion & De-noising',
    subheading: 'Filtering out the 99% fluff',
    description:
      'We crawl verified instructional domains on YouTube, discarding low-retention clickbait, sponsor bloat, and AI voice slop to isolate genuine pedagogical signal.',
    icon: <Database size={20} className="text-cyan-400" />,
    borderColor: 'hover:border-cyan-500/40',
    accent: 'from-cyan-500/20 to-transparent',
    status: 'Verified Deterministic',
  },
  {
    step: '02',
    stage: 'STAGE 02',
    title: 'INTENT TAXONOMY',
    subtitle: 'Multimodal Classification',
    subheading: 'Courses vs. Podcasts vs. Deep Dives',
    description:
      'Using dual-tier heuristic rules and Gemini structured classification, every piece of content is categorized by format, difficulty, and instructional rigor.',
    icon: <Cpu size={20} className="text-violet-400" />,
    borderColor: 'hover:border-violet-500/40',
    accent: 'from-violet-500/20 to-transparent',
    status: 'Verified Deterministic',
  },
  {
    step: '03',
    stage: 'STAGE 03',
    title: 'CURRICULUM GRAPH',
    subtitle: 'Grounded Knowledge Paths',
    subheading: 'Synthesizing discrete videos into curriculums',
    description:
      'Isolated videos are connected into structured milestone learning tracks: Foundations → Core Patterns → Production Architecture, with estimated completion times.',
    icon: <GitMerge size={20} className="text-indigo-400" />,
    borderColor: 'hover:border-indigo-500/40',
    accent: 'from-indigo-500/20 to-transparent',
    status: 'Verified Deterministic',
  },
  {
    step: '04',
    stage: 'STAGE 04',
    title: 'TRUTH GROUNDING',
    subtitle: 'Zero Hallucination Guarantee',
    subheading: 'Always rooted in real YouTube content',
    description:
      'Unlike generic LLMs that hallucinate fake book titles and broken course links, every single item in Tubiq is an indexed, verifiable video or playlist with real creator attribution.',
    icon: <ShieldCheck size={20} className="text-emerald-400" />,
    borderColor: 'hover:border-emerald-500/40',
    accent: 'from-emerald-500/20 to-transparent',
    status: 'Verified Deterministic',
  },
];

export function KnowledgeArchitecture() {
  return (
    <section className="py-24 px-4 relative max-w-7xl mx-auto border-t border-white/5">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-mono mb-4">
          <Network size={12} className="text-indigo-400" />
          <span>05 · INTELLIGENT KNOWLEDGE UNIVERSE</span>
        </div>
        <h2
          className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          How the intelligent knowledge universe works.
        </h2>
        <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
          A four-stage verification pipeline transforming the chaotic YouTube firehose into structured mastery paths.
        </p>

        {/* Sequential visual indicator */}
        <div className="flex items-center justify-center gap-2 mt-6 text-[11px] font-mono text-gray-500">
          <span className="text-indigo-400 font-bold">01</span>
          <ArrowRight size={12} className="text-gray-600" />
          <span className="text-indigo-400 font-bold">02</span>
          <ArrowRight size={12} className="text-gray-600" />
          <span className="text-indigo-400 font-bold">03</span>
          <ArrowRight size={12} className="text-gray-600" />
          <span className="text-indigo-400 font-bold">04</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
        {STAGES.map((s, idx) => (
          <motion.div
            key={s.step}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            className={`p-6 rounded-2xl bg-[#090d1a]/80 border border-white/10 ${s.borderColor} transition-all duration-300 flex flex-col justify-between group shadow-xl relative overflow-hidden`}
          >
            <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${s.accent}`} />

            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:scale-105 transition-transform">
                  {s.icon}
                </div>
                <span className="text-xs font-mono font-extrabold text-gray-400 group-hover:text-indigo-400 transition-colors">
                  {s.step}
                </span>
              </div>

              <span className="text-[10px] font-mono font-bold tracking-widest text-indigo-400 block mb-1 uppercase">
                {s.stage} · {s.title}
              </span>

              <h3
                className="text-base font-bold text-white mb-0.5 group-hover:text-indigo-200 transition-colors"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {s.subtitle}
              </h3>
              <p className="text-[11px] font-medium text-gray-400 mb-3">
                {s.subheading}
              </p>

              <p className="text-xs text-gray-300/80 leading-relaxed font-sans">
                {s.description}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-white/5 flex items-center gap-1.5 text-[11px] font-mono text-emerald-400">
              <CheckCircle size={13} className="text-emerald-400" />
              <span>{s.status}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
