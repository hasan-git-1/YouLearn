import type { Metadata } from 'next';
import Link from 'next/link';
import { Search, BookOpen, Zap, TrendingUp, GraduationCap, Mic, Play } from 'lucide-react';
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
      <section className="px-4 py-16" style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div className="flex items-center justify-between mb-8">
          <h2
            className="font-bold text-2xl"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
          >
            Popular Topics
          </h2>
          {allTopics.length > 8 && (
            <Link href="/topics" className="btn-ghost py-1.5 px-3 text-xs">
              Browse all
            </Link>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {FEATURED_TOPICS.map((topic, i) => (
            <Link
              key={topic.slug}
              href={`/topics/${topic.slug}`}
              className="glass-card group flex flex-col items-center justify-center p-6 text-center"
              style={{
                textDecoration: 'none',
                animationDelay: `${i * 0.05}s`,
              }}
            >
              <div
                className={`flex items-center justify-center rounded-xl mb-3 text-2xl bg-gradient-to-br ${topic.color}`}
                style={{ width: 52, height: 52 }}
              >
                {topic.icon}
              </div>
              <span
                className="font-semibold text-sm text-center group-hover:text-indigo-300 transition-colors"
                style={{ color: 'var(--text-primary)' }}
              >
                {topic.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section
        className="px-4 py-16"
        style={{
          background: 'var(--bg-surface)',
          borderTop: '1px solid var(--border-subtle)',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <h2
            className="font-bold text-2xl text-center mb-12"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
          >
            How YouLearn works
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map((step, i) => (
              <div
                key={step.step}
                className="flex flex-col items-start p-6 rounded-2xl"
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
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
                  className="text-xs font-bold mb-2"
                  style={{ color: 'var(--text-muted)', letterSpacing: '0.1em' }}
                >
                  STEP {step.step}
                </span>
                <h3
                  className="font-bold text-lg mb-2"
                  style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}
                >
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
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
            className="font-bold text-3xl mb-4"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
          >
            Start learning today
          </h2>
          <p className="mb-8" style={{ color: 'var(--text-secondary)' }}>
            25 topics pre-indexed with thousands of hours of curated YouTube content.
          </p>
          <SearchBar
            placeholder="What do you want to learn?"
            size="default"
          />
        </div>
      </section>
    </div>
  );
}
