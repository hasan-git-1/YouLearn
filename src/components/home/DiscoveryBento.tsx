'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Compass,
  Sparkles,
  Award,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Layers,
  Mic,
  Database,
  Users,
} from 'lucide-react';

interface DiscoveryBentoProps {
  topicsList?: { id: string; name: string; slug: string }[];
}

export function DiscoveryBento({ topicsList = [] }: DiscoveryBentoProps) {
  const [activeFilter, setActiveFilter] = useState<'all' | 'courses' | 'podcasts' | 'roadmaps'>('all');

  return (
    <section className="py-20 px-4 max-w-7xl mx-auto relative z-10" id="discovery">
      {/* ── Section Header ────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 text-xs font-mono mb-3">
            <Compass size={12} className="text-cyan-400" />
            <span>04 · KNOWLEDGE ECOSYSTEM</span>
          </div>

          <h2
            className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight"
            style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}
          >
            Discover what is <span className="gradient-text">worth learning.</span>
          </h2>

          <p className="text-gray-400 text-xs sm:text-sm mt-2 max-w-xl leading-relaxed">
            Sourced and ranked from millions of YouTube hours. Curated strictly by pedagogical depth, zero fluff, zero hallucination.
          </p>
        </div>

        {/* Filters and Status Badges */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/[0.04] border border-white/10 text-xs">
            {(
              [
                { id: 'all', label: 'All Media' },
                { id: 'courses', label: 'Full Courses' },
                { id: 'podcasts', label: 'Podcasts' },
                { id: 'roadmaps', label: 'Roadmaps' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={`px-3 py-1 rounded-lg font-medium cursor-pointer transition-all ${
                  activeFilter === tab.id
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-2 text-[10px] font-mono text-gray-400">
            <span className="flex items-center gap-1 px-2 py-1 rounded-md bg-white/[0.03] border border-white/10">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              Intelligent Knowledge Graph
            </span>
            <span className="flex items-center gap-1 px-2 py-1 rounded-md bg-white/[0.03] border border-white/10">
              <Database size={10} className="text-indigo-400" />
              Live Postgres Index
            </span>
          </div>
        </div>
      </div>

      {/* ── Bento Grid: Curated Curriculum Engine ────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* ── Left 7 Cols: Curated Curriculum Engine + 3 Topic Cards ──────── */}
        <div className="lg:col-span-7 flex flex-col justify-between p-6 sm:p-7 rounded-3xl border border-white/10 bg-[#090d22]/90 backdrop-blur-xl">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-mono text-indigo-400 uppercase tracking-wider font-semibold">
                Curated Curriculum Engine
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                100% De-Noised
              </span>
            </div>

            <h3
              className="text-lg sm:text-xl font-bold text-white mb-2"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              YouTube hosts the greatest free education on Earth, but discovery is broken.
            </h3>

            <p className="text-xs text-gray-400 leading-relaxed mb-6">
              Tubiq classifies instructional formats, removes clickbait, and builds chronological pathways.
            </p>

            {/* 3 Topic Cards */}
            <div className="space-y-3">
              {/* Topic Card 01 */}
              <div className="p-4 rounded-2xl border border-white/5 bg-white/[0.02] hover:border-violet-500/30 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 group">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-violet-500/15 text-violet-300 border border-violet-500/20">
                      Intermediate
                    </span>
                    <span className="text-xs font-mono text-gray-400">28 Modules · 6 Creators</span>
                  </div>
                  <h4 className="text-sm font-bold text-white group-hover:text-violet-200 transition-colors">
                    AI Engineering &amp; Agentic Workflows
                  </h4>
                </div>
                <Link
                  href="/topics/ai-engineering"
                  className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-white/5 hover:bg-violet-600 transition-colors shrink-0"
                >
                  <span>Explore Topic</span>
                  <ArrowRight size={12} />
                </Link>
              </div>

              {/* Topic Card 02 */}
              <div className="p-4 rounded-2xl border border-white/5 bg-white/[0.02] hover:border-cyan-500/30 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 group">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/20">
                      Comprehensive
                    </span>
                    <span className="text-xs font-mono text-gray-400">36 Modules · 12 Projects</span>
                  </div>
                  <h4 className="text-sm font-bold text-white group-hover:text-cyan-200 transition-colors">
                    Full Stack Web Architecture with Next.js 16
                  </h4>
                </div>
                <Link
                  href="/topics/full-stack-web-development"
                  className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-white/5 hover:bg-cyan-600 transition-colors shrink-0"
                >
                  <span>Explore Topic</span>
                  <ArrowRight size={12} />
                </Link>
              </div>

              {/* Topic Card 03 */}
              <div className="p-4 rounded-2xl border border-white/5 bg-white/[0.02] hover:border-amber-500/30 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 group">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/20">
                      Advanced
                    </span>
                    <span className="text-xs font-mono text-gray-400">22 Deep Dives · Senior</span>
                  </div>
                  <h4 className="text-sm font-bold text-white group-hover:text-amber-200 transition-colors">
                    Distributed Systems &amp; High Scale Engineering
                  </h4>
                </div>
                <Link
                  href="/topics/system-design"
                  className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-white/5 hover:bg-amber-600 transition-colors shrink-0"
                >
                  <span>Explore Topic</span>
                  <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          </div>

          {/* Additional 25+ Pre-Indexed Core Disciplines */}
          <div className="pt-4 mt-5 border-t border-white/5 flex items-center justify-between">
            <span className="text-xs font-mono text-gray-400">25+ Pre-Indexed Core Disciplines</span>
            <Link
              href="/topics"
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1"
            >
              <span>View All Disciplines</span>
              <ArrowRight size={12} />
            </Link>
          </div>
        </div>

        {/* ── Right 5 Cols: Verified Creators + Multimodal Classification ─── */}
        <div className="lg:col-span-5 space-y-5">
          {/* Card 1: Verified Creators (Pedagogical Authority Ranking) */}
          <div className="p-6 rounded-3xl border border-white/10 bg-[#090d22]/90 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono text-indigo-400 uppercase tracking-wider font-semibold">
                Verified Creators
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                0% Clickbait Filter
              </span>
            </div>

            <h4
              className="text-base font-bold text-white mb-1.5"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Pedagogical Authority Ranking
            </h4>

            <p className="text-xs text-gray-400 leading-relaxed mb-4">
              We rank creators based on explanation clarity, code correctness, and student feedback — not sensationalist thumbnails.
            </p>

            {/* 3 Creators */}
            <div className="space-y-2.5">
              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">Andrej Karpathy</span>
                  <span className="text-[11px] text-gray-400 block">Deep Learning &amp; LLM Core</span>
                </div>
                <span className="text-[10px] font-mono text-gray-400 bg-white/5 px-2 py-1 rounded-md">
                  Ex-Tesla / OpenAI
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">ByteByteGo (Alex Xu)</span>
                  <span className="text-[11px] text-gray-400 block">System Design &amp; Distributed Data</span>
                </div>
                <span className="text-[10px] font-mono text-gray-400 bg-white/5 px-2 py-1 rounded-md">
                  Author &amp; Architect
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">Jack Herrington</span>
                  <span className="text-[11px] text-gray-400 block">Modern React &amp; TypeScript</span>
                </div>
                <span className="text-[10px] font-mono text-gray-400 bg-white/5 px-2 py-1 rounded-md">
                  Principal Architect
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Multimodal Classification */}
          <div className="p-6 rounded-3xl border border-white/10 bg-[#090d22]/90 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono text-indigo-400 uppercase tracking-wider font-semibold">
                Multimodal Classification
              </span>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-full">
                AI Partitioned
              </span>
            </div>

            <h4
              className="text-base font-bold text-white mb-1.5"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Courses vs. Podcasts vs. Shorts
            </h4>

            <p className="text-xs text-gray-400 leading-relaxed mb-4">
              Never get a 2-hour conversational interview when you asked for a coding walkthrough. Our classifier analyzes structure and intent.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 text-center">
                <BookOpen size={16} className="text-indigo-400 mx-auto mb-1.5" />
                <span className="text-xs font-bold text-white block">Courses</span>
                <span className="text-[10px] text-gray-400 font-mono">Comprehensive</span>
              </div>
              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 text-center">
                <Mic size={16} className="text-violet-400 mx-auto mb-1.5" />
                <span className="text-xs font-bold text-white block">Podcasts</span>
                <span className="text-[10px] text-gray-400 font-mono">Conversational</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
