'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  Clock,
  Layers,
  CheckCircle2,
  ExternalLink,
  GraduationCap,
  Play,
  Terminal,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface SimulationData {
  query: string;
  badge: string;
  intent: string;
  taxonomy: string[];
  learningPath: {
    stage: string;
    description: string;
    items: string[];
  }[];
  featuredCourse: {
    title: string;
    channel: string;
    duration: string;
    rating: string;
    modules: string;
    slug: string;
  };
  keyVideos: {
    title: string;
    channel: string;
    duration: string;
    views: string;
  }[];
  topCreator: {
    name: string;
    role: string;
    signal: string;
  };
}

const SIMULATIONS: Record<string, SimulationData> = {
  'Learn React': {
    query: 'Learn React',
    badge: 'FRONTEND ARCHITECTURE',
    intent: 'Structured Comprehensive Learning',
    taxonomy: ['React 19', 'Server Components', 'Next.js App Router', 'Zustand', 'Performance'],
    learningPath: [
      {
        stage: '01 · FOUNDATIONS',
        description: 'JSX, component lifecycle, unidirectional data flow, core Hooks (useState, useEffect, useRef).',
        items: ['Understanding Re-renders', 'State Colocation', 'Strict Mode & Hydration'],
      },
      {
        stage: '02 · SERVER COMPONENTS & ACTIONS',
        description: 'Server vs Client boundaries, zero-bundle streaming SSR, Next.js routing paradigms.',
        items: ['Suspense Boundaries', 'Server Actions Form Flow', 'Cache Tagging'],
      },
      {
        stage: '03 · PRODUCTION SCALING',
        description: 'Memory leak prevention, TanStack Query integration, optimistic UI, bundle profiling.',
        items: ['Web Workers Integration', 'Custom Hook Extraction', 'Virtualization'],
      },
    ],
    featuredCourse: {
      title: 'Full Modern React 19 & Next.js Architecture',
      channel: 'Jack Herrington',
      duration: '11h 45m',
      rating: '4.98',
      modules: '16 Modules',
      slug: 'full-stack-web-development',
    },
    keyVideos: [
      {
        title: 'React 19 Actions & useActionState Deep Dive',
        channel: 'Theo - t3.gg',
        duration: '28m',
        views: '180K views',
      },
      {
        title: 'Stop Using useEffect for Data Fetching',
        channel: 'Cosden Solutions',
        duration: '19m',
        views: '290K views',
      },
    ],
    topCreator: {
      name: 'Dan Abramov & Kent C. Dodds',
      role: 'Curated Feeds',
      signal: '99.4% Pedagogical Signal',
    },
  },
  'System Design': {
    query: 'System Design',
    badge: 'DISTRIBUTED SYSTEMS',
    intent: 'Production Architecture & Scaling',
    taxonomy: ['Consistent Hashing', 'Database Sharding', 'Event-Driven Pub/Sub', 'Cache Invalidation', 'Raft'],
    learningPath: [
      {
        stage: '01 · FOUNDATIONS & SCALING',
        description: 'Load balancers, reverse proxies, stateless services, and horizontal vs vertical scaling.',
        items: ['DNS Routing & Anycast', 'L4 vs L7 Load Balancing', 'Session Management'],
      },
      {
        stage: '02 · DATA LAYER & REPLICATION',
        description: 'ACID vs BASE, read replicas, write sharding, and consensus algorithms.',
        items: ['Master-Replica Lag', 'WAL & Raft Consensus', 'Two-Phase Commit'],
      },
      {
        stage: '03 · FAULT TOLERANCE & QUEUES',
        description: 'Circuit breakers, backpressure, dead-letter queues, and distributed rate limiting.',
        items: ['Token Bucket Algorithm', 'Kafka Partition Strategy', 'Graceful Degradation'],
      },
    ],
    featuredCourse: {
      title: 'Distributed Systems & High Scale Engineering',
      channel: 'ByteByteGo (Alex Xu)',
      duration: '14h 20m',
      rating: '4.99',
      modules: '22 Modules',
      slug: 'system-design',
    },
    keyVideos: [
      {
        title: 'How Discord Stores Billions of Messages',
        channel: 'Hussein Nasser',
        duration: '32m',
        views: '420K views',
      },
      {
        title: 'Designing a Scalable Rate Limiter from Scratch',
        channel: 'ByteByteGo',
        duration: '24m',
        views: '310K views',
      },
    ],
    topCreator: {
      name: 'Alex Xu & Martin Kleppmann',
      role: 'Distributed Systems Authors',
      signal: '99.8% Pedagogical Signal',
    },
  },
  'AI Engineering': {
    query: 'AI Engineering',
    badge: 'LLMS & AGENTIC SYSTEMS',
    intent: 'Applied AI & Vector Pipelines',
    taxonomy: ['Prompt Grounding', 'RAG & Vector DBs', 'Fine-Tuning (LoRA)', 'Tool Calling', 'Agent Loops'],
    learningPath: [
      {
        stage: '01 · LLM INTERNALS & PROMPTS',
        description: 'Attention mechanisms, tokenization, temperature, and structured output grounding.',
        items: ['Chain-of-Thought Reasoning', 'JSON Schema Enforcement', 'System Prompt Grounding'],
      },
      {
        stage: '02 · RAG & VECTOR SEARCH',
        description: 'Semantic embeddings, chunking strategies, pgvector indexing, and hybrid search.',
        items: ['Hierarchical Chunking', 'Cross-Encoder Re-Ranking', 'Vector Metadata Filtering'],
      },
      {
        stage: '03 · AGENTIC WORKFLOWS & EVAL',
        description: 'Autonomous tool execution, multi-agent collaboration, memory, and safety evaluation.',
        items: ['Function Calling Loops', 'LangGraph State Machines', 'Evals & Guardrails'],
      },
    ],
    featuredCourse: {
      title: 'AI Engineering & Agentic Workflows Masterclass',
      channel: 'Andrej Karpathy & DeepLearning.AI',
      duration: '16h 10m',
      rating: '4.99',
      modules: '28 Modules',
      slug: 'ai-engineering',
    },
    keyVideos: [
      {
        title: 'Building Production RAG with Vector Search',
        channel: 'Mckay Wrigley',
        duration: '42m',
        views: '220K views',
      },
      {
        title: 'Building Agentic Workflows with Function Calling',
        channel: 'Prompt Engineering',
        duration: '35m',
        views: '165K views',
      },
    ],
    topCreator: {
      name: 'Andrej Karpathy',
      role: 'Foundational AI Educator',
      signal: '99.9% Pedagogical Signal',
    },
  },
};

export function InteractiveProductSimulation() {
  const [selectedQuery, setSelectedQuery] = useState<string>('Learn React');
  const data = SIMULATIONS[selectedQuery] || SIMULATIONS['Learn React'];

  return (
    <section className="py-20 px-4 max-w-7xl mx-auto relative z-10" id="synthesis">
      {/* ── Section Header ────────────────────────────────────────────── */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 text-xs font-mono mb-3">
          <Sparkles size={12} className="text-cyan-400" />
          <span>03 · TUBIQ SYNTHESIS</span>
        </div>

        <h2
          className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight"
          style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}
        >
          See Tubiq synthesize real knowledge.
        </h2>

        <p className="text-gray-300 text-xs sm:text-sm mt-3 max-w-2xl mx-auto leading-relaxed">
          Unlike raw YouTube search results clogged with clickbait, Tubiq categorizes, de-noises, and constructs verified pedagogical learning paths in real time.
        </p>

        {/* Query Switcher Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
          <span className="text-[11px] font-mono text-gray-400 mr-1">Search Examples:</span>
          {Object.keys(SIMULATIONS).map((q) => (
            <button
              key={q}
              onClick={() => setSelectedQuery(q)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all duration-200 border ${
                selectedQuery === q
                  ? 'bg-indigo-600 text-white border-indigo-400 shadow-[0_0_16px_rgba(99,102,241,0.4)]'
                  : 'bg-white/[0.04] text-gray-300 border-white/10 hover:text-white hover:bg-white/[0.08]'
              }`}
            >
              &ldquo;{q}&rdquo;
            </button>
          ))}
        </div>
      </div>

      {/* ── Simulated Application Discovery Result Interface ──────────── */}
      <div
        className="rounded-3xl border border-white/10 bg-[#090c1f]/90 backdrop-blur-2xl shadow-[0_24px_64px_rgba(0,0,0,0.7)] overflow-hidden"
      >
        {/* Terminal Header Bar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 bg-[#070918]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
            <span className="text-[11px] font-mono text-gray-400 ml-2 hidden sm:inline">
              tubiq://discovery?query=&quot;{encodeURIComponent(data.query)}&quot;
            </span>
          </div>

          <div className="flex items-center gap-2 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
            <ShieldCheck size={11} />
            <span>100% Grounded</span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={data.query}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="p-5 sm:p-8"
          >
            {/* Top Row: Category & Identified Concepts */}
            <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-white/10 gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-[10px] font-mono font-bold text-cyan-300 mb-1">
                  {data.badge}
                </div>
                <h3
                  className="text-xl font-bold text-white tracking-tight"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {data.intent}
                </h3>
              </div>

              {/* Identified Concepts Taxonomy */}
              <div>
                <span className="block text-[10px] font-mono uppercase text-gray-400 mb-1.5">
                  Identified Concepts:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {data.taxonomy.map((concept) => (
                    <span
                      key={concept}
                      className="px-2.5 py-1 rounded-lg text-xs font-mono text-gray-200 bg-white/[0.04] border border-white/10"
                    >
                      {concept}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Middle Grid: Pedagogical Path + Authority & Top Course */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-6">
              {/* Left 7 Cols: Synthesized Pedagogical Path */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center gap-2 text-xs font-mono font-semibold text-indigo-400 uppercase tracking-wider">
                  <Layers size={14} />
                  <span>Synthesized Pedagogical Path</span>
                </div>

                <div className="space-y-3">
                  {data.learningPath.map((stage) => (
                    <div
                      key={stage.stage}
                      className="p-4 rounded-2xl border border-white/5 bg-white/[0.02] hover:border-white/10 transition-colors"
                    >
                      <span className="text-xs font-mono font-bold text-indigo-300 block mb-1">
                        {stage.stage}
                      </span>
                      <p className="text-xs text-gray-400 leading-relaxed mb-2.5">
                        {stage.description}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {stage.items.map((item) => (
                          <span
                            key={item}
                            className="inline-flex items-center gap-1 text-[11px] font-mono text-gray-300 bg-white/[0.03] px-2 py-0.5 rounded border border-white/5"
                          >
                            <CheckCircle2 size={10} className="text-emerald-400" />
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right 5 Cols: Top Course, Authority, & De-Noised Videos */}
              <div className="lg:col-span-5 space-y-4">
                {/* Authority Creator */}
                <div className="p-3.5 rounded-2xl border border-white/10 bg-white/[0.03] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-gray-400 block">Authority</span>
                    <span className="text-xs font-bold text-white">{data.topCreator.name}</span>
                    <span className="text-[10px] text-gray-400 block">{data.topCreator.role}</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-lg">
                    {data.topCreator.signal}
                  </span>
                </div>

                {/* Top Course */}
                <div className="p-4 rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-[#121636] to-[#0a0d20]">
                  <div className="flex items-center justify-between text-[10px] font-mono text-gray-400 mb-2">
                    <span className="text-amber-400 font-bold">★ {data.featuredCourse.rating} TOP COURSE</span>
                    <span>{data.featuredCourse.duration} • {data.featuredCourse.modules}</span>
                  </div>

                  <h4 className="text-sm font-bold text-white mb-1 leading-snug">
                    {data.featuredCourse.title}
                  </h4>
                  <p className="text-xs text-gray-400 mb-3">By {data.featuredCourse.channel}</p>

                  <Link
                    href={`/topics/${data.featuredCourse.slug}`}
                    className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors"
                  >
                    <span>Explore Verified Course</span>
                    <ArrowRight size={12} />
                  </Link>
                </div>

                {/* De-Noised Video Walkthroughs */}
                <div className="p-4 rounded-2xl border border-white/10 bg-white/[0.02]">
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-[10px] font-mono uppercase text-gray-400">De-Noised Video Walkthroughs</span>
                    <span className="text-[9px] font-mono text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded">Zero Clickbait</span>
                  </div>

                  <div className="space-y-2">
                    {data.keyVideos.map((vid) => (
                      <div
                        key={vid.title}
                        className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          <Play size={10} className="text-indigo-400 shrink-0 fill-indigo-400" />
                          <div className="truncate">
                            <span className="text-xs text-gray-200 block truncate font-medium">
                              {vid.title}
                            </span>
                            <span className="text-[10px] text-gray-400 block font-mono">
                              {vid.channel}
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono text-gray-400 shrink-0">
                          {vid.duration}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Launch live query CTA */}
                  <Link
                    href={`/search?q=${encodeURIComponent(data.query)}`}
                    className="w-full mt-3 inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl text-[11px] font-mono text-gray-300 bg-white/5 hover:bg-white/10 hover:text-white transition-colors"
                  >
                    <span>Launch live query for &ldquo;{data.query}&rdquo;</span>
                    <ExternalLink size={11} />
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
