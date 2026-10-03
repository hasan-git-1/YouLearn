'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Compass,
  ArrowRight,
  Layers,
  Sparkles,
  Terminal,
  Network,
  Cpu,
  TrendingUp,
} from 'lucide-react';

const EXPLORE_DISCIPLINES: {
  id: string;
  title: string;
  description: string;
  tag: string;
  tagColor: string;
  icon: () => React.ReactNode;
  modules: string;
  creators: string;
  href: string;
  accentBorder: string;
}[] = [
  {
    id: 'ai-engineering',
    title: 'AI Engineering & Agents',
    description: 'LLM orchestrations, RAG pipelines, fine-tuning, and multi-agent systems.',
    tag: 'Trending',
    tagColor: 'text-violet-400 border-violet-500/30 bg-violet-500/10',
    icon: () => <Sparkles size={18} className="text-violet-400" />,
    modules: '28 Modules',
    creators: '8 Top Creators',
    href: '/topics/ai-engineering',
    accentBorder: 'hover:border-violet-500/40',
  },
  {
    id: 'full-stack-web-development',
    title: 'Full Stack Web Architecture',
    description: 'Next.js 16, React Server Components, TypeScript, and modern DB migrations.',
    tag: 'Foundational',
    tagColor: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10',
    icon: () => <Layers size={18} className="text-cyan-400" />,
    modules: '36 Modules',
    creators: '12 Projects',
    href: '/topics/full-stack-web-development',
    accentBorder: 'hover:border-cyan-500/40',
  },
  {
    id: 'system-design',
    title: 'Distributed System Design',
    description: 'High-scale concurrency, microservices, consistent hashing, and database sharding.',
    tag: 'Advanced',
    tagColor: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
    icon: () => <Network size={18} className="text-amber-400" />,
    modules: '22 Deep Dives',
    creators: 'Senior Level',
    href: '/topics/system-design',
    accentBorder: 'hover:border-amber-500/40',
  },
  {
    id: 'python-development',
    title: 'Python Core & Async IO',
    description: 'FastAPI, Metaprogramming, Polars, and production algorithmic patterns.',
    tag: 'Popular',
    tagColor: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    icon: () => <Terminal size={18} className="text-emerald-400" />,
    modules: '24 Modules',
    creators: 'Hands-on',
    href: '/topics',
    accentBorder: 'hover:border-emerald-500/40',
  },
  {
    id: 'deep-learning',
    title: 'Machine Learning & Tensors',
    description: 'PyTorch internals, neural network architectures, backprop, and optimization.',
    tag: 'Core ML',
    tagColor: 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10',
    icon: () => <Cpu size={18} className="text-indigo-400" />,
    modules: '19 Modules',
    creators: 'Theoretical & Code',
    href: '/topics',
    accentBorder: 'hover:border-indigo-500/40',
  },
  {
    id: 'market-intelligence',
    title: 'Financial & Market Analysis',
    description: 'Algorithmic trading basics, DCF models, portfolio theory, and macroeconomics.',
    tag: 'Finance',
    tagColor: 'text-rose-400 border-rose-500/30 bg-rose-500/10',
    icon: () => <TrendingUp size={18} className="text-rose-400" />,
    modules: '16 Deep Dives',
    creators: 'Quantitative',
    href: '/topics',
    accentBorder: 'hover:border-rose-500/40',
  },
];

export function ExploreUniverseSection() {
  return (
    <section className="py-20 px-4 max-w-7xl mx-auto relative z-10" id="explore">
      {/* ── Section Header ────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-mono mb-3">
            <Compass size={13} className="text-indigo-400" />
            <span>02 · EXPLORE TUBIQ</span>
          </div>

          <h2
            className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight uppercase"
            style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}
          >
            YOUR LEARNING UNIVERSE AWAITS
          </h2>

          <p className="text-indigo-200/90 text-sm sm:text-base font-medium mt-1.5">
            Master any skill with the content that actually matters.
          </p>

          <p className="text-gray-400 text-xs sm:text-sm mt-2 max-w-xl leading-relaxed">
            Zero marketing fluff, zero hallucinations. Explore 25+ pre-indexed topic curriculums or launch a real-time semantic discovery search.
          </p>
        </div>

        {/* View All Disciplines Action */}
        <Link
          href="/topics"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-white/[0.05] border border-white/10 hover:border-indigo-500/40 hover:bg-white/[0.08] transition-all self-start md:self-auto group"
        >
          <span>View All 25+ Disciplines</span>
          <ArrowRight size={13} className="text-indigo-400 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* ── Structured Topic Exploration Cards ─────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {EXPLORE_DISCIPLINES.map((disc, idx) => (
          <motion.div
            key={disc.id}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.45, delay: idx * 0.06 }}
          >
            <Link
              href={disc.href}
              className={`block p-5 rounded-2xl border border-white/10 bg-[#0a0d20]/80 backdrop-blur-xl transition-all duration-300 group hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(0,0,0,0.6)] ${disc.accentBorder}`}
              style={{ textDecoration: 'none' }}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-white/[0.05] border border-white/10 group-hover:scale-105 transition-transform">
                  {disc.icon()}
                </div>
                <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border ${disc.tagColor}`}>
                  {disc.tag}
                </span>
              </div>

              <h3
                className="text-base font-bold text-white group-hover:text-indigo-200 transition-colors mb-1.5"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {disc.title}
              </h3>

              <p className="text-xs text-gray-400 leading-relaxed mb-4 line-clamp-2">
                {disc.description}
              </p>

              <div className="flex items-center justify-between pt-3 border-t border-white/5 text-[11px] font-mono text-gray-400">
                <span>{disc.modules}</span>
                <span className="text-gray-500">•</span>
                <span>{disc.creators}</span>
                <div className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center text-gray-400 group-hover:text-white group-hover:translate-x-0.5 transition-all">
                  <ArrowRight size={11} />
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
