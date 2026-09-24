import type { Metadata } from 'next';
import Link from 'next/link';
import { Hash, Search } from 'lucide-react';
import { db } from '@/db';
import { topics } from '@/db/schema';
import { asc } from 'drizzle-orm';

export const metadata: Metadata = {
  title: 'All Topics — YouLearn',
  description: 'Browse all indexed learning topics on YouLearn. Courses, videos, podcasts and creators — curated from YouTube.',
};

export default async function TopicsPage() {
  let allTopics: { id: string; name: string; slug: string; description: string | null }[] = [];
  try {
    allTopics = await db
      .select({ id: topics.id, name: topics.name, slug: topics.slug, description: topics.description })
      .from(topics)
      .orderBy(asc(topics.name));
  } catch {
    allTopics = [];
  }

  // Group by first letter
  const grouped = allTopics.reduce<Record<string, typeof allTopics>>((acc, topic) => {
    const letter = topic.name[0]?.toUpperCase() ?? '#';
    if (!acc[letter]) acc[letter] = [];
    acc[letter].push(topic);
    return acc;
  }, {});

  const letters = Object.keys(grouped).sort();

  return (
    <div style={{ minHeight: '100dvh' }}>
      {/* Header */}
      <section
        className="px-4 py-16 text-center bg-grid bg-radial-glow"
        style={{ borderBottom: '1px solid var(--border-subtle)' }}
      >
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <h1
            className="font-black mb-3"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2rem, 5vw, 3rem)',
              letterSpacing: '-0.03em',
              color: 'var(--text-primary)',
            }}
          >
            Browse <span className="gradient-text">All Topics</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
            {allTopics.length} topics indexed · Thousands of hours of curated YouTube content
          </p>
          <Link href="/search" className="btn-primary inline-flex">
            <Search size={15} />
            Search instead
          </Link>
        </div>
      </section>

      {/* Alphabetical listing */}
      <div className="px-4 py-12" style={{ maxWidth: 1280, margin: '0 auto' }}>
        {allTopics.length === 0 ? (
          <div className="text-center py-16">
            <p style={{ color: 'var(--text-muted)' }}>
              No topics indexed yet. Run the seed script to get started.
            </p>
            <pre
              className="mt-4 text-xs px-4 py-3 rounded-xl inline-block"
              style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}
            >
              npm run db:seed
            </pre>
          </div>
        ) : (
          <div className="space-y-10">
            {letters.map((letter) => (
              <div key={letter} id={`letter-${letter}`}>
                {/* Letter anchor */}
                <div className="flex items-center gap-3 mb-4">
                  <span
                    className="font-black text-4xl gradient-text"
                    style={{ fontFamily: 'var(--font-display)', lineHeight: 1 }}
                  >
                    {letter}
                  </span>
                  <div className="flex-1 h-px" style={{ background: 'var(--border-subtle)' }} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {grouped[letter].map((topic) => (
                    <Link
                      key={topic.id}
                      href={`/topics/${topic.slug}`}
                      className="glass-card group flex items-center gap-3 p-4"
                      style={{ textDecoration: 'none' }}
                    >
                      <div
                        className="flex-shrink-0 flex items-center justify-center rounded-lg"
                        style={{
                          width: 36,
                          height: 36,
                          background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))',
                        }}
                      >
                        <Hash size={16} color="white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className="font-semibold text-sm truncate group-hover:text-indigo-300 transition-colors"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          {topic.name}
                        </p>
                        {topic.description && (
                          <p className="text-xs line-clamp-1 mt-0.5" style={{ color: 'var(--text-muted)' }}>
                            {topic.description}
                          </p>
                        )}
                      </div>
                      <svg
                        width="14" height="14" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2.5"
                        className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ color: 'var(--brand-primary)' }}
                      >
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
