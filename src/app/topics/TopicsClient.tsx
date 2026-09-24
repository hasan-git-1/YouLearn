'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, Sparkles, Terminal, Code2, Cpu, BarChart3, ShieldCheck, Compass, ArrowRight, Zap, Flame, Globe } from 'lucide-react';

export interface TopicItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

interface TopicsClientProps {
  topics: TopicItem[];
}

const CATEGORY_MAP: Record<string, string[]> = {
  Development: [
    'full-stack-web-development',
    'python-programming',
    'javascript-typescript',
    'react-development',
    'next-js',
    'node-js',
    'database-engineering',
    'system-design',
    'devops-cloud-engineering',
  ],
  'AI & Data': ['ai-engineering', 'data-science', 'machine-learning', 'cybersecurity'],
  'Business & Finance': ['product-management', 'digital-marketing', 'stock-market-basics', 'personal-finance', 'entrepreneurship'],
  'Design & Media': ['ux-design', 'graphic-design', 'video-editing'],
  Academics: ['upsc-preparation', 'physics-jee-neet', 'mathematics', 'english-communication'],
};

const TOPIC_ICONS: Record<string, { icon: React.ReactNode; color: string; badge: string }> = {
  'full-stack-web-development': { icon: <Code2 size={24} />, color: 'from-indigo-500 to-violet-600', badge: 'High Demand' },
  'ai-engineering': { icon: <Cpu size={24} />, color: 'from-violet-500 to-fuchsia-600', badge: 'Trending' },
  'data-science': { icon: <BarChart3 size={24} />, color: 'from-cyan-500 to-blue-600', badge: 'Core Field' },
  'python-programming': { icon: <Terminal size={24} />, color: 'from-emerald-500 to-teal-600', badge: 'Popular' },
  'system-design': { icon: <ShieldCheck size={24} />, color: 'from-amber-500 to-orange-600', badge: 'Advanced' },
  'devops-cloud-engineering': { icon: <Globe size={24} />, color: 'from-blue-500 to-indigo-600', badge: 'Cloud' },
  'react-development': { icon: <Zap size={24} />, color: 'from-sky-400 to-blue-600', badge: 'Frontend' },
  'next-js': { icon: <Flame size={24} />, color: 'from-neutral-200 to-neutral-400 text-black', badge: 'Full Stack' },
};

export function TopicsClient({ topics }: TopicsClientProps) {
  const [filterQuery, setFilterQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedLetter, setSelectedLetter] = useState<string>('All');

  const filteredTopics = useMemo(() => {
    return topics.filter((topic) => {
      // Query filter
      const matchesQuery =
        !filterQuery.trim() ||
        topic.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
        (topic.description && topic.description.toLowerCase().includes(filterQuery.toLowerCase()));

      // Category filter
      const matchesCategory =
        selectedCategory === 'All' ||
        (CATEGORY_MAP[selectedCategory] && CATEGORY_MAP[selectedCategory].includes(topic.slug));

      // Letter filter
      const matchesLetter =
        selectedLetter === 'All' || topic.name[0]?.toUpperCase() === selectedLetter;

      return matchesQuery && matchesCategory && matchesLetter;
    });
  }, [topics, filterQuery, selectedCategory, selectedLetter]);

  // Alphabet list
  const availableLetters = useMemo(() => {
    const set = new Set(topics.map((t) => t.name[0]?.toUpperCase()).filter(Boolean));
    return Array.from(set).sort();
  }, [topics]);

  return (
    <div style={{ minHeight: '100dvh' }}>
      {/* ── Hyper-Techy Hero Header ────────────────────────────────────────── */}
      <section
        className="relative px-4 pt-16 pb-14 text-center overflow-hidden bg-radial-glow"
        style={{
          background: 'linear-gradient(180deg, rgba(12, 16, 32, 0.95) 0%, rgba(8, 11, 20, 0.98) 100%)',
          borderBottom: '1px solid rgba(99, 102, 241, 0.15)',
        }}
      >
        {/* Glow backdrop */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 opacity-20 blur-3xl pointer-events-none"
          style={{
            background: 'radial-gradient(circle, #6366f1 0%, #a855f7 50%, transparent 100%)',
          }}
          aria-hidden="true"
        />

        <div className="relative z-10 max-w-4xl mx-auto">
          {/* Tech Status Pill */}
          <div
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono mb-6"
            style={{
              background: 'rgba(99, 102, 241, 0.12)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              color: '#a5b4fc',
              boxShadow: '0 0 16px rgba(99, 102, 241, 0.2)',
            }}
          >
            <Sparkles size={13} className="animate-pulse text-indigo-400" />
            <span>SYSTEM INDEX // {topics.length} CURATED KNOWLEDGE DIRECTORIES</span>
          </div>

          <h1
            className="font-black mb-4 tracking-tight"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2.2rem, 5.5vw, 4rem)',
              lineHeight: 1.08,
              letterSpacing: '-0.03em',
              color: '#ffffff',
            }}
          >
            Explore <span className="gradient-text">Learning Topics</span>
          </h1>

          <p className="text-base text-gray-300 max-w-2xl mx-auto leading-relaxed mb-8">
            AI-organized YouTube courses, playlists, and creators across web development, AI, cloud engineering, and career skills.
          </p>

          {/* Search Filter Toolbar */}
          <div className="max-w-xl mx-auto relative mb-6">
            <div className="relative flex items-center">
              <Search size={18} className="absolute left-4 text-indigo-400 pointer-events-none" />
              <input
                type="text"
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                placeholder="Filter indexed topics (e.g., Full Stack, AI, Python)..."
                className="input-base pl-12 pr-4 py-3 text-sm w-full font-medium"
                style={{
                  borderRadius: 14,
                  background: 'rgba(20, 24, 45, 0.8)',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
                }}
              />
              {filterQuery && (
                <button
                  onClick={() => setFilterQuery('')}
                  className="absolute right-4 text-xs text-gray-400 hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {['All', ...Object.keys(CATEGORY_MAP)].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/40 border border-indigo-400/50'
                    : 'bg-white/5 text-gray-300 hover:text-white hover:bg-white/10 border border-white/5'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Topics Grid Section ───────────────────────────────────────────── */}
      <section className="px-4 py-12 max-w-7xl mx-auto">
        {/* Letter Jump Index */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 mb-10 pb-4 border-b border-white/10">
          <span className="text-xs font-mono text-gray-400 mr-2 uppercase">Jump to:</span>
          <button
            onClick={() => setSelectedLetter('All')}
            className={`px-2 py-0.5 rounded text-xs font-mono transition-colors cursor-pointer ${
              selectedLetter === 'All' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            All
          </button>
          {availableLetters.map((letter) => (
            <button
              key={letter}
              onClick={() => setSelectedLetter(letter)}
              className={`px-2 py-0.5 rounded text-xs font-mono transition-colors cursor-pointer ${
                selectedLetter === letter ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              {letter}
            </button>
          ))}
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-xs font-mono text-gray-400">
            SHOWING {filteredTopics.length} OF {topics.length} INDEXED TOPICS
          </p>
        </div>

        {/* Grid of Ultra-Techy Cards */}
        {filteredTopics.length === 0 ? (
          <div className="text-center py-20">
            <Compass size={32} className="mx-auto text-gray-500 mb-3" />
            <h3 className="text-lg font-bold text-white mb-1">No matching topics found</h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto mb-4">
              Try changing your filter query or category selection.
            </p>
            <button
              onClick={() => {
                setFilterQuery('');
                setSelectedCategory('All');
                setSelectedLetter('All');
              }}
              className="btn-ghost text-xs py-2 px-4"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredTopics.map((topic) => {
              const meta = TOPIC_ICONS[topic.slug] ?? {
                icon: <Code2 size={24} />,
                color: 'from-indigo-500 to-violet-600',
                badge: 'Curated',
              };

              return (
                <Link
                  key={topic.id}
                  href={`/topics/${topic.slug}`}
                  className="group relative flex flex-col rounded-2xl p-5 overflow-hidden transition-all duration-300 hover:-translate-y-1"
                  style={{
                    background: 'linear-gradient(145deg, rgba(20, 24, 45, 0.85) 0%, rgba(12, 15, 30, 0.95) 100%)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                    backdropFilter: 'blur(16px)',
                    textDecoration: 'none',
                  }}
                >
                  {/* Subtle hover glow border overlay */}
                  <div
                    className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    style={{
                      border: '1px solid rgba(99, 102, 241, 0.4)',
                      boxShadow: 'inset 0 0 20px rgba(99, 102, 241, 0.15)',
                    }}
                  />

                  {/* Header Row: Icon Pod & Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br ${meta.color} text-white shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform`}
                    >
                      {meta.icon}
                    </div>

                    <span
                      className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-indigo-300"
                      style={{
                        background: 'rgba(99, 102, 241, 0.15)',
                        border: '1px solid rgba(99, 102, 241, 0.3)',
                      }}
                    >
                      {meta.badge}
                    </span>
                  </div>

                  {/* Title */}
                  <h3
                    className="text-base font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors"
                    style={{ fontFamily: 'var(--font-display)', lineHeight: 1.3 }}
                  >
                    {topic.name}
                  </h3>

                  {/* Description */}
                  <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed mb-6 flex-1">
                    {topic.description ?? `Structured YouTube courses, videos, and playlists curated for learning ${topic.name}.`}
                  </p>

                  {/* Footer CTA */}
                  <div className="flex items-center justify-between pt-3 border-t border-white/5 text-xs font-semibold text-indigo-400 group-hover:text-indigo-300">
                    <span>Explore Syllabus</span>
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
