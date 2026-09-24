import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SearchResults } from '@/features/search/SearchResults';
import { SearchBar } from '@/components/ui/SearchBar';

export const dynamic = 'force-dynamic';

interface SearchPageProps {
  searchParams: Promise<{ q?: string; limit?: string }>;
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const { q } = await searchParams;
  const query = q?.trim();
  return {
    title: query ? `${query} — Tubiq` : 'Search — Tubiq',
    description: query
      ? `Discover the best YouTube courses, videos, podcasts, and creators for "${query}". AI-organized learning content.`
      : 'Search Tubiq for any topic and discover curated YouTube learning content.',
  };
}

export default function SearchPage(props: SearchPageProps) {
  return (
    <Suspense fallback={<SearchPageSkeleton />}>
      <SearchPageContent {...props} />
    </Suspense>
  );
}

async function SearchPageContent({ searchParams }: SearchPageProps) {
  const { q, limit } = await searchParams;
  const query = q?.trim() ?? '';

  return (
    <div style={{ minHeight: '100dvh' }}>
      {/* Search bar header */}
      <div
        className="sticky top-[57px] z-40 px-4 py-3"
        style={{
          background: 'rgba(8,11,20,0.9)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <SearchBar
            initialValue={query}
            placeholder="Search any topic to learn…"
            size="default"
          />
        </div>
      </div>

      {/* Results */}
      <div className="px-4 py-8" style={{ maxWidth: 1280, margin: '0 auto' }}>
        {query ? (
          <Suspense fallback={<SearchResultsSkeleton />}>
            <SearchResults query={query} limit={parseInt(limit ?? '12', 10)} />
          </Suspense>
        ) : (
          <EmptyQueryState />
        )}
      </div>
    </div>
  );
}

function EmptyQueryState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-up">
      <div
        className="flex items-center justify-center rounded-2xl mb-6"
        style={{
          width: 72,
          height: 72,
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-default)',
        }}
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--text-muted)' }}>
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
      </div>
      <h1 className="font-bold text-2xl mb-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
        What do you want to learn?
      </h1>
      <p style={{ color: 'var(--text-secondary)', maxWidth: 400 }}>
        Type a topic above — &ldquo;Full Stack Dev&rdquo;, &ldquo;Data Science&rdquo;, &ldquo;Stock Market Basics&rdquo; — and we&apos;ll show you the best YouTube content for it.
      </p>
    </div>
  );
}

function SearchPageSkeleton() {
  return (
    <div className="px-4 py-12" style={{ maxWidth: 1280, margin: '0 auto' }}>
      <div className="skeleton h-10 w-full max-w-md mb-8 rounded-xl" />
      <SearchResultsSkeleton />
    </div>
  );
}

function SearchResultsSkeleton() {
  return (
    <div className="space-y-12">
      {[1, 2, 3].map((i) => (
        <div key={i}>
          <div className="flex items-center gap-3 mb-5">
            <div className="skeleton rounded-xl" style={{ width: 36, height: 36 }} />
            <div className="space-y-1">
              <div className="skeleton h-5 rounded" style={{ width: 160 }} />
              <div className="skeleton h-3 rounded" style={{ width: 80 }} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((j) => (
              <div key={j} className="glass-card overflow-hidden">
                <div className="skeleton" style={{ aspectRatio: '16/9' }} />
                <div className="p-3 space-y-2">
                  <div className="skeleton h-4 rounded" style={{ width: '90%' }} />
                  <div className="skeleton h-4 rounded" style={{ width: '70%' }} />
                  <div className="skeleton h-3 rounded" style={{ width: '40%' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
