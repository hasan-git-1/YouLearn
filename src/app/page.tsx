import type { Metadata } from 'next';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
import { Search, Zap, GraduationCap, ArrowRight } from 'lucide-react';
import { SearchBar } from '@/components/ui/SearchBar';
import { db } from '@/db';
import { topics } from '@/db/schema';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

export const metadata: Metadata = {
  title: 'Tubiq — AI-Guided Knowledge Discovery',
  description:
    'Discover the best YouTube courses, podcasts, and creators for any learning goal. AI-organized, quota-safe, always grounded in real content.',
};

const FEATURED_TOPICS = [
  { slug: 'full-stack-web-development', name: 'Full Stack Dev', icon: '💻', description: 'HTML, CSS, React, Node, databases and beyond', color: 'from-indigo-500 to-violet-500' },
  { slug: 'ai-engineering', name: 'AI Engineering', icon: '🤖', description: 'LLMs, RAG pipelines, model fine-tuning, deployment', color: 'from-violet-500 to-purple-500' },
  { slug: 'data-science', name: 'Data Science', icon: '📊', description: 'Statistics, pandas, ML models, data visualization', color: 'from-cyan-500 to-blue-500' },
  { slug: 'system-design', name: 'System Design', icon: '🏗️', description: 'Scalable architectures, distributed systems, APIs', color: 'from-amber-500 to-orange-500' },
  { slug: 'python-programming', name: 'Python', icon: '🐍', description: 'Core Python, scripting, automation and frameworks', color: 'from-emerald-500 to-teal-500' },
  { slug: 'devops-cloud-engineering', name: 'DevOps', icon: '☁️', description: 'CI/CD, Docker, Kubernetes, cloud infrastructure', color: 'from-blue-500 to-cyan-500' },
  { slug: 'digital-marketing', name: 'Digital Marketing', icon: '📱', description: 'SEO, social media, growth strategies, analytics', color: 'from-pink-500 to-rose-500' },
  { slug: 'stock-market-basics', name: 'Stock Market', icon: '📈', description: 'Investing fundamentals, analysis, portfolio building', color: 'from-green-500 to-emerald-500' },
];

export default async function HomePage() {
  // Fetch seeded topics from DB — fast Postgres read, no API calls
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
        {/* Background glow */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20 blur-3xl pointer-events-none"
          style={{
            width: 600,
            height: 600,
            background: 'radial-gradient(circle, var(--brand-primary) 0%, transparent 70%)',
          }}
          aria-hidden="true"
        />

        {/* Badge — calm 400ms entrance, no bounce */}
        <div className="tag tag-brand mb-6 animate-fade-up">
          <Zap size={12} className="mr-1" />
          AI-Guided · Quota-Safe · Always Real Content
        </div>

        {/* ONE headline above the fold — clear type hierarchy */}
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

        {/* ONE subheadline */}
        <p
          className="mb-10 animate-fade-up animate-fade-up-delay-2"
          style={{
            color: 'var(--text-secondary)',
            fontSize: 'clamp(1rem, 2vw, 1.2rem)',
            maxWidth: 560,
            lineHeight: 1.6,
          }}
        >
          Discover Courses, Videos, Podcasts &amp; top Creators for any topic —
          AI-organized, never fabricated, sourced from real indexed content.
        </p>

        {/*
         * ONE search bar above the fold. Usable immediately — animation uses
         * fill-mode:both so it's visible from first paint. autofocus is deferred
         * 100ms inside SearchBar (non-blocking).
         */}
        <div className="w-full animate-fade-up animate-fade-up-delay-3" style={{ maxWidth: 640 }}>
          <SearchBar
            placeholder="What do you want to learn?"
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

      {/* ── Popular Topics grid ───────────────────────────────────────────── */}
      <section className="px-4 py-16 max-w-7xl mx-auto">
        <ScrollReveal>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2
                className="font-bold text-2xl sm:text-3xl text-white tracking-tight mb-1"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Popular Learning Topics
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
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

          {/*
           * Fixed CSS grid — all cards same height regardless of topic-name length.
           * flex-col on each card + line-clamp on text prevents overflow.
           * Hover: subtle 150ms lift + shadow, not a jarring scale.
           */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {FEATURED_TOPICS.map((topic) => (
              <Link
                key={topic.slug}
                href={`/topics/${topic.slug}`}
                className="topic-card group"
                style={{ textDecoration: 'none' }}
              >
                <div className="topic-card__glow" aria-hidden="true" />

                <div
                  className={`flex items-center justify-center rounded-2xl mb-3 text-2xl bg-gradient-to-br ${topic.color} text-white shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-200 flex-shrink-0`}
                  style={{ width: 52, height: 52 }}
                >
                  {topic.icon}
                </div>
                <span
                  className="font-bold text-sm text-white group-hover:text-indigo-300 transition-colors duration-150 line-clamp-1 w-full text-center"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {topic.name}
                </span>
                {/* One-line description — truncated with ellipsis, never overflows card */}
                <span className="text-[11px] mt-1 line-clamp-1 w-full text-center" style={{ color: 'var(--text-muted)' }}>
                  {topic.description}
                </span>
              </Link>
            ))}
          </div>
        </ScrollReveal>
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
          <ScrollReveal>
            <h2
              className="font-bold text-2xl sm:text-3xl text-center text-white mb-12"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              How Tubiq works
            </h2>

            {/*
             * align-items: stretch → all 3 cards grow to the same height.
             * description has flex-grow → fills remaining space consistently.
             * Icons are fixed 48×48 across all cards — no baseline drift.
             */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8" style={{ alignItems: 'stretch' }}>
              {[
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
              ].map((step) => (
                <div
                  key={step.step}
                  className="flex flex-col items-start p-6 rounded-2xl glass-card"
                >
                  <div
                    className={`flex items-center justify-center rounded-xl mb-4 bg-gradient-to-br ${step.color} flex-shrink-0`}
                    style={{ width: 48, height: 48, color: 'white' }}
                  >
                    {step.icon}
                  </div>
                  <span className="text-xs font-mono font-bold mb-2 text-indigo-400 tracking-wider">
                    STEP {step.step}
                  </span>
                  <h3
                    className="font-bold text-lg mb-2 text-white"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {step.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-gray-300 flex-grow">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── CTA footer ───────────────────────────────────────────────────── */}
      <section className="px-4 py-20 text-center">
        <ScrollReveal>
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
        </ScrollReveal>
      </section>
    </div>
  );
}
