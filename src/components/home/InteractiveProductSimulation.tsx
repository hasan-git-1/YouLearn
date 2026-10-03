'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Sparkles,
  Video,
  ArrowRight,
  Clock,
  Layers,
  CheckCircle2,
  ExternalLink,
  GraduationCap
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
    difficulty: string;
    rating: string;
    modules: number;
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
    expertise: string;
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
        stage: '01 · Foundations',
        description: 'JSX, component lifecycle, unidirectional data flow, core Hooks (useState, useEffect, useRef).',
        items: ['Understanding Re-renders', 'State Colocation', 'Strict Mode & Hydration'],
      },
      {
        stage: '02 · Server Components & Actions',
        description: 'Server vs Client boundaries, zero-bundle streaming SSR, Next.js routing paradigms.',
        items: ['Suspense Boundaries', 'Server Actions Form Flow', 'Cache Tagging'],
      },
      {
        stage: '03 · Production Scaling',
        description: 'Memory leak prevention, TanStack Query integration, optimistic UI, bundle profiling.',
        items: ['Web Workers Integration', 'Custom Hook Extraction', 'Virtualization'],
      },
    ],
    featuredCourse: {
      title: 'Full Modern React 19 & Next.js Architecture',
      channel: 'Jack Herrington',
      duration: '11h 45m',
      difficulty: 'Intermediate',
      rating: '4.98',
      modules: 16,
      slug: 'full-stack-web-development',
    },
    keyVideos: [
      { title: 'React 19 Actions & useActionState Deep Dive', channel: 'Theo - t3.gg', duration: '28m', views: '180K' },
      { title: 'Stop Using useEffect for Data Fetching', channel: 'Cosden Solutions', duration: '19m', views: '290K' },
    ],
    topCreator: {
      name: 'Dan Abramov & Kent C. Dodds Curated Feeds',
      expertise: 'Core React Principles & Clean Architecture',
      signal: '99.4% Pedagogical Signal',
    },
  },

  'System Design': {
    query: 'System Design',
    badge: 'DISTRIBUTED SYSTEMS',
    intent: 'Senior Architecture Roadmap',
    taxonomy: ['High Availability', 'Database Sharding', 'Redis Caching', 'Kafka Streaming', 'CAP Theorem'],
    learningPath: [
      {
        stage: '01 · Fundamentals & Tradeoffs',
        description: 'Throughput vs Latency, Horizontal vs Vertical scaling, ACID vs BASE guarantees.',
        items: ['Consistent Hashing Algorithms', 'DNS & Anycast Load Balancing', 'Reverse Proxies'],
      },
      {
        stage: '02 · Data Storage at Scale',
        description: 'Relational replication topologies, NoSQL LSM trees, caching strategies (Write-Through vs Write-Back).',
        items: ['Redis Cluster Resiliency', 'Database Partition Keys', 'CDC with Debezium'],
      },
      {
        stage: '03 · Event-Driven Architectures',
        description: 'Message brokers (Kafka/RabbitMQ), idempotency keys, sagas for distributed transactions.',
        items: ['Outbox Pattern', 'Dead Letter Queues', 'gRPC Microservice Mesh'],
      },
    ],
    featuredCourse: {
      title: 'Complete Distributed Systems & System Design',
      channel: 'ByteByteGo (Alex Xu)',
      duration: '14h 10m',
      difficulty: 'Advanced',
      rating: '4.99',
      modules: 22,
      slug: 'system-design',
    },
    keyVideos: [
      { title: 'Designing a 10M Concurrent WebSocket Chat', channel: 'NeetCodeIO', duration: '34m', views: '520K' },
      { title: 'How WhatsApp Scaled to 1 Billion Users on Erlang', channel: 'Hussein Nasser', duration: '42m', views: '410K' },
    ],
    topCreator: {
      name: 'Alex Xu & Hussein Nasser',
      expertise: 'Protocols, Database Internals & Real Case Studies',
      signal: '99.8% High Signal',
    },
  },

  'AI Engineering': {
    query: 'AI Engineering',
    badge: 'LLM SYSTEMS & AGENTS',
    intent: 'Practical Production AI',
    taxonomy: ['RAG Architectures', 'pgvector & Embeddings', 'LoRA Fine-Tuning', 'Multi-Agent Tool Use', 'Evals'],
    learningPath: [
      {
        stage: '01 · LLM Core & Prompt Grounding',
        description: 'Token mechanics, context windows, few-shot prompting, structured JSON output validation.',
        items: ['Pydantic Instructor', 'Temperature & Top-P Tuning', 'System Guardrails'],
      },
      {
        stage: '02 · Retrieval-Augmented Generation (RAG)',
        description: 'Semantic vector search, hybrid dense/sparse retrieval, rerankers (Cohere), chunking strategies.',
        items: ['Postgres pgvector Indexing', 'Reciprocal Rank Fusion', 'Metadata Filtering'],
      },
      {
        stage: '03 · Autonomous Agentic Systems',
        description: 'ReAct pattern, LangGraph state machines, multi-tool execution loops, automated regression evals.',
        items: ['Human-in-the-loop State', 'Long-term Memory Storage', 'LLM-as-a-Judge Evaluation'],
      },
    ],
    featuredCourse: {
      title: 'Building Production-Grade AI Agents & RAG',
      channel: 'FreeCodeCamp / Harrison Chase',
      duration: '8h 30m',
      difficulty: 'Intermediate',
      rating: '4.95',
      modules: 12,
      slug: 'ai-engineering',
    },
    keyVideos: [
      { title: 'How RAG Actually Works Under the Hood', channel: 'StatQuest with Josh Starmer', duration: '22m', views: '380K' },
      { title: 'Building Multi-Agent Workflows from Scratch', channel: 'Dave Ebbelaar', duration: '39m', views: '150K' },
    ],
    topCreator: {
      name: 'Andrej Karpathy & Harrison Chase',
      expertise: 'Deep Learning Foundations to Practical Agent Systems',
      signal: '99.9% Authority',
    },
  },
};

export function InteractiveProductSimulation() {
  const [activeTab, setActiveTab] = useState<string>('Learn React');
  const sim = SIMULATIONS[activeTab] || SIMULATIONS['Learn React'];

  return (
    <section className="py-24 px-4 relative max-w-7xl mx-auto" id="product-simulation">
      {/* Background ambient lighting */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] pointer-events-none rounded-full blur-[140px] opacity-15"
        style={{ background: 'radial-gradient(circle, #6366f1, #06b6d4, transparent)' }}
        aria-hidden="true"
      />

      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-mono mb-4">
          <Sparkles size={12} className="text-indigo-400" />
          <span>LIVE ARCHITECTURE SIMULATION</span>
        </div>
        <h2
          className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          See Tubiq synthesize <span className="gradient-text">real knowledge.</span>
        </h2>
        <p className="text-gray-400 text-base sm:text-lg">
          Unlike raw YouTube search results clogged with clickbait, Tubiq categorizes, de-noises, and constructs verified pedagogical learning paths in real time.
        </p>

        {/* Query Selector Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mt-8">
          {Object.keys(SIMULATIONS).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer flex items-center gap-2 border ${
                activeTab === tab
                  ? 'bg-indigo-600/30 text-white border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.4)]'
                  : 'bg-white/5 text-gray-400 border-white/10 hover:border-white/20 hover:text-white'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-indigo-400" />
              <span>&ldquo;{tab}&rdquo;</span>
            </button>
          ))}
        </div>
      </div>

      {/* Simulated Product Command Screen */}
      <AnimatePresence mode="wait">
        <motion.div
          key={sim.query}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] as const }}
          className="rounded-3xl border border-white/10 p-5 sm:p-8 relative overflow-hidden shadow-2xl"
          style={{
            background: 'linear-gradient(135deg, rgba(14, 18, 35, 0.94), rgba(8, 10, 20, 0.98))',
            backdropFilter: 'blur(30px)',
          }}
        >
          {/* Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <span className="text-xs font-mono text-gray-400 flex items-center gap-1.5 ml-2">
                <span className="text-indigo-400">tubiq://discovery?query=</span>
                <span className="text-white font-semibold">&ldquo;{sim.query}&rdquo;</span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {sim.badge}
              </span>
              <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hidden sm:inline">
                {sim.intent}
              </span>
            </div>
          </div>

          {/* Sub-taxonomy badges */}
          <div className="flex flex-wrap items-center gap-2 py-4">
            <span className="text-xs font-mono text-gray-400 mr-2 flex items-center gap-1">
              <Layers size={13} className="text-indigo-400" />
              Identified Concepts:
            </span>
            {sim.taxonomy.map((tag) => (
              <span
                key={tag}
                className="text-[11px] font-medium px-2.5 py-0.5 rounded-lg bg-white/5 text-gray-300 border border-white/10"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Grid Layout: Learning Path (Left) & Curated Media (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4">
            {/* Left 7 Columns: Grounded AI Learning Path */}
            <div className="lg:col-span-7 flex flex-col justify-between p-5 sm:p-6 rounded-2xl bg-white/[0.03] border border-white/10">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                      <GraduationCap size={16} />
                    </div>
                    <h3 className="font-bold text-white text-base" style={{ fontFamily: 'var(--font-display)' }}>
                      Synthesized Pedagogical Path
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    <CheckCircle2 size={11} /> 100% Grounded
                  </span>
                </div>

                <div className="space-y-4 mt-4">
                  {sim.learningPath.map((step) => (
                    <div
                      key={step.stage}
                      className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-indigo-500/30 transition-colors"
                    >
                      <div className="text-xs font-mono font-bold text-indigo-400 mb-1">
                        {step.stage}
                      </div>
                      <p className="text-xs text-gray-300 leading-relaxed mb-2.5">
                        {step.description}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {step.items.map((it) => (
                          <span
                            key={it}
                            className="text-[10px] font-mono text-gray-400 bg-white/5 px-2 py-0.5 rounded border border-white/5"
                          >
                            ✓ {it}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between">
                <span className="text-xs text-gray-400">
                  Authority Creator: <strong className="text-white">{sim.topCreator.name}</strong>
                </span>
                <span className="text-xs text-emerald-400 font-mono">
                  {sim.topCreator.signal}
                </span>
              </div>
            </div>

            {/* Right 5 Columns: Verified YouTube Curriculum Results */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              {/* Featured Course Card */}
              <div className="p-5 rounded-2xl bg-indigo-950/20 border border-indigo-500/30 relative group hover:border-indigo-400 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    TOP COURSE
                  </span>
                  <span className="text-[11px] font-mono text-amber-400 flex items-center gap-1">
                    ★ {sim.featuredCourse.rating}
                  </span>
                </div>

                <h4 className="font-bold text-sm text-white group-hover:text-indigo-300 transition-colors line-clamp-2 mb-2">
                  {sim.featuredCourse.title}
                </h4>

                <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                  <span className="flex items-center gap-1">
                    <Clock size={12} className="text-indigo-400" />
                    {sim.featuredCourse.duration}
                  </span>
                  <span>•</span>
                  <span>{sim.featuredCourse.modules} Modules</span>
                  <span>•</span>
                  <span className="text-gray-300 font-medium">{sim.featuredCourse.channel}</span>
                </div>

                <Link
                  href={`/search?q=${encodeURIComponent(sim.query)}`}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 text-xs font-semibold border border-indigo-500/40 transition-all"
                  style={{ textDecoration: 'none' }}
                >
                  <span>Explore Verified Course</span>
                  <ArrowRight size={13} />
                </Link>
              </div>

              {/* Verified Deep Dive Videos */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex-grow">
                <div className="flex items-center justify-between mb-3 text-xs font-semibold text-gray-300">
                  <span className="flex items-center gap-1.5">
                    <Video size={14} className="text-cyan-400" />
                    De-noised Video Walkthroughs
                  </span>
                  <span className="text-[10px] font-mono text-gray-400">Zero Clickbait</span>
                </div>

                <div className="space-y-2.5">
                  {sim.keyVideos.map((vid) => (
                    <div
                      key={vid.title}
                      className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-cyan-500/30 transition-colors"
                    >
                      <p className="text-xs font-medium text-white line-clamp-1 mb-1">
                        {vid.title}
                      </p>
                      <div className="flex items-center justify-between text-[11px] text-gray-400">
                        <span>{vid.channel}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-cyan-400">{vid.duration}</span>
                          <span>{vid.views} views</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Direct Link to Live App Discovery */}
              <Link
                href={`/search?q=${encodeURIComponent(sim.query)}`}
                className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-200 text-xs font-medium border border-white/10 transition-colors"
                style={{ textDecoration: 'none' }}
              >
                <span>Launch live query for &ldquo;{sim.query}&rdquo;</span>
                <ExternalLink size={14} className="text-indigo-400" />
              </Link>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
