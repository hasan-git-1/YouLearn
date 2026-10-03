'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Compass,
  Sparkles,
  TrendingUp,
  Award,
  BookOpen,
  ArrowRight,
  Clock,
} from 'lucide-react';

interface DiscoveryBentoProps {
  topicsList?: { id: string; name: string; slug: string }[];
}

export function DiscoveryBento({ topicsList = [] }: DiscoveryBentoProps) {
  const [activeFilter, setActiveFilter] = useState<'all' | 'courses' | 'podcasts' | 'roadmaps'>('all');

  return (
    <section className="py-24 px-4 max-w-7xl mx-auto relative" id="discovery">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 text-xs font-mono mb-4">
            <Compass size={12} className="text-cyan-400" />
            <span>KNOWLEDGE ECOSYSTEM</span>
          </div>
          <h2
            className="text-3xl sm:text-5xl font-black text-white tracking-tight"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Discover what is <span className="gradient-text">worth learning.</span>
          </h2>
          <p className="text-gray-400 text-sm sm:text-base mt-2 max-w-xl">
            Sourced and ranked from millions of YouTube hours. Curated strictly by pedagogical depth, zero fluff, zero hallucination.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-white/[0.04] border border-white/10">
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
              className={`px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition-all ${
                activeFilter === tab.id
                  ? 'bg-indigo-600 text-white shadow-[0_0_14px_rgba(99,102,241,0.5)]'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Asymmetric Bento Grid ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Large Feature Panel (7 cols): The Living Discovery Engine */}
        <div className="md:col-span-7 rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-indigo-950/40 via-[#0b0e1e]/90 to-[#070914] border border-indigo-500/20 relative overflow-hidden group hover:border-indigo-500/40 transition-all flex flex-col justify-between shadow-2xl">
          {/* Ambient Corner Glow */}
          <div
            className="absolute top-0 right-0 w-80 h-80 rounded-full blur-[100px] pointer-events-none opacity-20"
            style={{ background: 'radial-gradient(circle, #6366f1, #06b6d4, transparent)' }}
          />

          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-mono tracking-wider text-indigo-400 uppercase font-semibold flex items-center gap-1.5">
                <Sparkles size={13} />
                Intelligent Knowledge Graph
              </span>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                Live Postgres Index
              </span>
            </div>

            <h3
              className="text-2xl sm:text-3xl font-bold text-white mb-3"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Curated Curriculum Engine
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed mb-6">
              YouTube hosts the greatest free education on Earth, but discovery is broken. Tubiq classifies instructional formats, removes clickbait, and builds chronological pathways.
            </p>

            {/* Interactive Curriculum Preview Cards */}
            <div className="space-y-3">
              {[
                {
                  title: 'AI Engineering & Agentic Workflows',
                  tag: '28 Modules · 6 Creators',
                  category: 'High-Demand Track',
                  level: 'Intermediate',
                  slug: 'ai-engineering',
                  progress: 82,
                },
                {
                  title: 'Full Stack Web Architecture with Next.js 16',
                  tag: '36 Modules · 12 Projects',
                  category: 'Flagship Curriculum',
                  level: 'Comprehensive',
                  slug: 'full-stack-web-development',
                  progress: 94,
                },
                {
                  title: 'Distributed Systems & High Scale Engineering',
                  tag: '22 Deep Dives · Senior',
                  category: 'System Design',
                  level: 'Advanced',
                  slug: 'system-design',
                  progress: 76,
                },
              ].map((item) => (
                <Link
                  key={item.title}
                  href={`/topics/${item.slug}`}
                  className="block p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-indigo-500/40 hover:bg-white/[0.05] transition-all group/card"
                  style={{ textDecoration: 'none' }}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-white group-hover/card:text-indigo-300 transition-colors">
                      {item.title}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-indigo-300 border border-white/10">
                      {item.level}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>{item.tag}</span>
                    <div className="flex items-center gap-1 text-[11px] text-indigo-400 font-medium">
                      <span>Explore Topic</span>
                      <ArrowRight size={12} className="group-hover/card:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-white/5 flex items-center justify-between text-xs text-gray-400">
            <span>{topicsList.length > 0 ? `${topicsList.length}+ Pre-Indexed Core Disciplines` : '25+ Pre-Indexed Core Disciplines'}</span>
            <Link
              href="/topics"
              className="text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
              style={{ textDecoration: 'none' }}
            >
              <span>View All Disciplines</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>

        {/* Secondary Panels (5 cols) */}
        <div className="md:col-span-5 flex flex-col gap-6">
          {/* Panel 2: Verified Authority Creators */}
          <div className="p-6 rounded-3xl bg-[#0c1020]/80 border border-white/10 relative overflow-hidden group hover:border-cyan-500/40 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-mono tracking-wider text-cyan-400 uppercase font-semibold flex items-center gap-1.5">
                  <Award size={13} />
                  Verified Creators
                </span>
                <span className="text-[10px] font-mono text-gray-400">0% Clickbait Filter</span>
              </div>

              <h4 className="text-lg font-bold text-white mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                Pedagogical Authority Ranking
              </h4>
              <p className="text-xs text-gray-400 leading-relaxed mb-4">
                We rank creators based on explanation clarity, code correctness, and student feedback — not sensationalist thumbnails.
              </p>

              <div className="space-y-2">
                {[
                  { name: 'Andrej Karpathy', field: 'Deep Learning & LLM Core', badge: 'Ex-Tesla / OpenAI' },
                  { name: 'ByteByteGo (Alex Xu)', field: 'System Design & Distributed Data', badge: 'Author & Architect' },
                  { name: 'Jack Herrington', field: 'Modern React & TypeScript', badge: 'Principal Architect' },
                ].map((c) => (
                  <div
                    key={c.name}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/5"
                  >
                    <div>
                      <p className="text-xs font-semibold text-white">{c.name}</p>
                      <p className="text-[10px] text-gray-400">{c.field}</p>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                      {c.badge}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Panel 3: Multimodal Formats (Podcasts, Courses, Deep Dives) */}
          <div className="p-6 rounded-3xl bg-[#0c1020]/80 border border-white/10 relative overflow-hidden group hover:border-amber-500/40 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-mono tracking-wider text-amber-400 uppercase font-semibold flex items-center gap-1.5">
                <TrendingUp size={13} />
                Multimodal Classification
              </span>
              <span className="text-[10px] font-mono text-gray-400">AI Partitioned</span>
            </div>

            <h4 className="text-lg font-bold text-white mb-2" style={{ fontFamily: 'var(--font-display)' }}>
              Courses vs. Podcasts vs. Shorts
            </h4>
            <p className="text-xs text-gray-400 leading-relaxed mb-4">
              Never get a 2-hour conversational interview when you asked for a coding walkthrough. Our classifier analyzes structure and intent.
            </p>

            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                <BookOpen size={16} className="text-indigo-400 mx-auto mb-1" />
                <span className="text-xs font-bold text-white block">Courses</span>
                <span className="text-[10px] font-mono text-gray-400">Comprehensive</span>
              </div>
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <Clock size={16} className="text-amber-400 mx-auto mb-1" />
                <span className="text-xs font-bold text-white block">Podcasts</span>
                <span className="text-[10px] font-mono text-gray-400">Conversational</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
