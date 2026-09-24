import type { Metadata } from 'next';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
import { Search, BookOpen, Zap, TrendingUp, GraduationCap, Mic, Play, ArrowRight } from 'lucide-react';
import { SearchBar } from '@/components/ui/SearchBar';
import { db } from '@/db';
import { topics } from '@/db/schema';

export const metadata: Metadata = {
  title: 'YouLearn — AI-Guided Knowledge Discovery',
  description:
    'Discover the best YouTube courses, podcasts, and creators for any learning goal. AI-organized, quota-safe, always grounded in real content.',
};

const FEATURED_TOPICS = [
  { slug: 'full-stack-web-development', name: 'Full Stack Dev', icon: '💻', color: 'from-indigo-500 to-violet-500' },
  { slug: 'ai-engineering', name: 'AI Engineering', icon: '🤖', color: 'from-violet-500 to-purple-500' },
  { slug: 'data-science', name: 'Data Science', icon: '📊', color: 'from-cyan-500 to-blue-500' },
  { slug: 'system-design', name: 'System Design', icon: '🏗️', color: 'from-amber-500 to-orange-500' },
  { slug: 'python-programming', name: 'Python', icon: '🐍', color: 'from-emerald-500 to-teal-500' },
  { slug: 'devops-cloud-engineering', name: 'DevOps', icon: '☁️', color: 'from-blue-500 to-cyan-500' },
  { slug: 'digital-marketing', name: 'Digital Marketing', icon: '📱', color: 'from-pink-500 to-rose-500' },
  { slug: 'stock-market-basics', name: 'Stock Market', icon: '📈', color: 'from-green-500 to-emerald-500' },
];

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Search any topic',
    description: 'Type a learning goal — "Full Stack Dev", "AI Engineering", anything.',
    icon: <Search size={22} />,
    color: 'from-indigo-500 to-violet-500',
  },
  {
    step: '02',
    title: 'Get organized content',
    description: 'Real YouTube content — Courses, Videos, Podcasts, Shorts, Creators — sorted by relevance.',
    icon: <GraduationCap size={22} />,
    color: 'from-violet-500 to-purple-500',
  },
  {
    step: '03',
    title: 'Follow a learning path',
    description: 'AI-generated paths built from real indexed content. Never invented, always grounded.',
    icon: <Zap size={22} />,
    color: 'from-cyan-500 to-blue-500',
  },
];

export default async function HomePage() {
  // Fetch seeded topics from DB for the "Browse all topics" section
  // This is a fast read from Postgres — no API calls
  let allTopics: { id: string; name: string; slug: string }[] = [];
  try {
    allTopics = await db.select({ id: topics.id, name: topics.name, slug: topics.slug }).from(topics);
  } catch {
    // DB not configured yet — show static featured topics only
    allTopics = [];
  }

  return (
    <div style={{ minHeight: '100dvh' }}>
      {/* ── Hero section ──────────────────────────────────────────────────── */}
      <section
        className="relative flex flex-col items-center justify-center px-4 pt-24 pb-20 text-center overflow-hidden bg-radial-glow bg-grid"
        style={{ minHeight: '70dvh' }}
      >
        {/* Background decorations */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20 blur-3xl pointer-events-none"
          style={{
            width: 600,
            height: 600,
            background: 'radial-gradient(circle, var(--brand-primary) 0%, transparent 70%)',
          }}
          aria-hidden="true"
        />

        {/* Badge */}
        <div className="tag tag-brand mb-6 animate-fade-up">
          <Zap size={12} className="mr-1" />
          AI-Guided · Quota-Safe · Always Real Content
        </div>

        {/* Headline */}
        <h1
          className="font-black mb-4 animate-fade-up animate-fade-up-delay-1"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
            lineHeight: 1.05,
            letterSpacing: '-0.03em',
            color: 'var(--text-primary)',
            maxWidth: 800,
          }}
        >
          Learn anything with the best
          <span className="gradient-text"> YouTube content</span>
        </h1>

        <p
          className="mb-10 animate-fade-up animate-fade-up-delay-2"
          style={{
            color: 'var(--text-secondary)',
            fontSize: 'clamp(1rem, 2vw, 1.2rem)',
            maxWidth: 560,
            lineHeight: 1.6,
          }}
        >
          Discover Courses, Videos, Podcasts & top Creators for any topic —
          AI-organized, never fabricated, sourced from real indexed content.
        </p>

        {/* Search bar */}
        <div className="w-full animate-fade-up animate-fade-up-delay-3" style={{ maxWidth: 640 }}>
          <SearchBar
            placeholder={'Try "Full Stack Development" or "AI Engineering"…'}
            size="hero"
            autofocus
          />
        </div>

        {/* Quick topic chips */}
        <div className="flex flex-wrap justify-center gap-2 mt-6 animate-fade-up animate-fade-up-delay-3">
          {['Full Stack Dev', 'Python', 'AI Engineering', 'System Design', 'Stock Market'].map((t) => (
            <Link
              key={t}
              href={`/search?q=${encodeURIComponent(t)}`}
              className="tag tag-brand text-xs hover:opacity-80 transition-opacity"
              style={{ textDecoration: 'none' }}
            >
              {t}
            </Link>
          ))}
        </div>
      </section>

      {/* ── Featured topics grid ──────────────────────────────────────────── */}
      <section className="px-4 py-16 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2
              className="font-bold text-2xl sm:text-3xl text-white tracking-tight mb-1"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Popular Learning Topics
            </h2>
            <p className="text-xs text-gray-400">
              Pre-indexed curriculum ready for immediate exploration
            </p>
          </div>
          <Link
            href="/topics"
            className="btn-ghost py-2 px-4 text-xs font-semibold flex items-center gap-1.5"
            style={{ textDecoration: 'none' }}
          >
            <span>Explore All {allTopics.length || 25} Topics</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {FEATURED_TOPICS.map((topic, i) => (
            <Link
              key={topic.slug}
              href={`/topics/${topic.slug}`}
              className="group relative flex flex-col items-center justify-center p-6 text-center rounded-2xl transition-all duration-300 hover:-translate-y-1"
              style={{
                background: 'linear-gradient(145deg, rgba(20, 24, 45, 0.85) 0%, rgba(12, 15, 30, 0.95) 100%)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                backdropFilter: 'blur(16px)',
                textDecoration: 'none',
                animationDelay: `${i * 0.05}s`,
              }}
            >
              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{
                  border: '1px solid rgba(99, 102, 241, 0.4)',
                  boxShadow: 'inset 0 0 20px rgba(99, 102, 241, 0.15)',
                }}
              />

              <div
                className={`flex items-center justify-center rounded-2xl mb-3 text-2xl bg-gradient-to-br ${topic.color} text-white shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform`}
                style={{ width: 56, height: 56 }}
              >
                {topic.icon}
              </div>
              <span
                className="font-bold text-sm text-white group-hover:text-indigo-300 transition-colors"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {topic.name}
              </span>
              <span className="text-[11px] text-gray-400 mt-1 opacity-80 group-hover:opacity-100">
                View Curriculum →
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section
        className="px-4 py-16"
        style={{
          background: 'rgba(10, 13, 26, 0.6)',
          borderTop: '1px solid var(--border-subtle)',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <h2
            className="font-bold text-2xl sm:text-3xl text-center text-white mb-12"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            How YouLearn works
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map((step, i) => (
              <div
                key={step.step}
                className="flex flex-col items-start p-6 rounded-2xl glass-card"
                style={{
                  animationDelay: `${i * 0.1}s`,
                }}
              >
                <div
                  className={`flex items-center justify-center rounded-xl mb-4 bg-gradient-to-br ${step.color}`}
                  style={{ width: 48, height: 48, color: 'white' }}
                >
                  {step.icon}
                </div>
                <span
                  className="text-xs font-mono font-bold mb-2 text-indigo-400 tracking-wider"
                >
                  STEP {step.step}
                </span>
                <h3
                  className="font-bold text-lg mb-2 text-white"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed text-gray-300">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA footer ───────────────────────────────────────────────────── */}
      <section className="px-4 py-20 text-center">
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <h2
            className="font-bold text-3xl text-white mb-3"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Ready to master your next skill?
          </h2>
          <p className="text-sm text-gray-300 mb-8">
            Browse 25+ pre-indexed topic curriculums or search for any learning goal.
          </p>
          <Link
            href="/topics"
            className="btn-primary inline-flex items-center gap-2 text-sm font-semibold py-3 px-8 text-white rounded-xl shadow-lg shadow-indigo-600/40"
            style={{ textDecoration: 'none' }}
          >
            <span>Explore All Learning Topics</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}
