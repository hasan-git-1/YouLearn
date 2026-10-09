/**
 * SearchResults — async Server Component
 *
 * Fetches search data server-side via the internal search service
 * (never via a fetch to /api/search — direct service call is faster).
 * Renders categorized results in intent-ranked order.
 *
 * Search pipeline:
 *   1. Resolve seeded topic (instant, no DB/API)
 *   2. Keyword search against Postgres
 *   3. If 0 results → live fallback via fastSearch (direct YouTube API)
 *   4. If 0 results from both → cold-start state + background ingestion
 */

import type React from 'react';
import { GraduationCap, Video, Mic, Zap, Users, Clock3 } from 'lucide-react';
import { CategorySection } from '@/components/ui/CategorySection';
import { AIOverviewCard } from '@/components/ui/AIOverviewCard';
import { VideoCard } from '@/components/cards/VideoCard';
import { CourseCard } from '@/components/cards/CourseCard';
import { CreatorCard } from '@/components/cards/CreatorCard';
import { keywordSearch } from '@/services/search/keyword';
import { classifyIntent } from '@/services/search/intent';
import { generateTopicOverview } from '@/services/ai';
import { resolveSeedTopic } from '@/services/ingestion/seed-topics';
import { checkDbConnection, DatabaseConnectionError } from '@/db';
import type { Video as VideoType, Playlist, Channel, SearchResultCategories } from '@/types';

// Fire-and-forget ingestion trigger for cold-start — server-side
async function triggerIngestion(query: string) {
  try {
    const { inngest } = await import('@/jobs/ingestion');
    await inngest.send({
      name: 'app/topic.ingest',
      data: { topic: query, maxSearchCalls: 5, skipIfRecent: false },
    });
  } catch (e) {
    console.error('[SearchResults] Could not trigger ingestion:', e);
  }
}

// Live results indicator for fast search
function ColdStartState({ query }: { query: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-up">
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background: 'var(--bg-elevated)', color: 'var(--brand-primary)' }}>
        <Clock3 size={26} />
      </div>
      <h2 className="mb-2 text-xl font-bold" style={{ color: 'var(--text-primary)' }}>We&apos;re preparing this topic</h2>
      <p className="max-w-md text-sm" style={{ color: 'var(--text-secondary)' }}>
        We don&apos;t have indexed learning resources for &ldquo;{query}&rdquo; yet. It has been queued for indexing; please check back shortly.
      </p>
    </div>
  );
}

const CATEGORY_META: Record<
  keyof SearchResultCategories,
  { label: string; icon: () => React.ReactNode; twoColumn?: boolean }
> = {
  courses: { label: 'Courses', icon: () => <GraduationCap size={18} color="white" /> },
  // CANONICAL ORDER: Podcasts renders BEFORE Videos per spec (Issue 3)
  podcasts: { label: 'Podcasts', icon: () => <Mic size={18} color="white" /> },
  videos: { label: 'Videos', icon: () => <Video size={18} color="white" /> },
  shorts: { label: 'Shorts', icon: () => <Zap size={18} color="white" /> },
  creators: { label: 'Creators', icon: () => <Users size={18} color="white" />, twoColumn: true },
};

interface SearchResultsProps {
  query: string;
}

export async function SearchResults({ query }: SearchResultsProps) {
  const totalStart = performance.now();
  const seededTopic = resolveSeedTopic(query);
  const databaseQuery = seededTopic?.name ?? query;

  if (seededTopic) {
    console.log(`[SearchResults] Resolved seeded topic: "${query}" → "${seededTopic.slug}" (${seededTopic.name})`);
  }

  // ── Step 1: Try keyword search against DB ──────────────────────────────
  let searchData;
  let dbReachable = true;
  const dbStart = performance.now();
  try {
    searchData = await keywordSearch({
      q: databaseQuery,
      pool: 50,
      topicSlug: seededTopic?.slug,
    });
    console.log(`[SearchResults] DB search took ${Math.round(performance.now() - dbStart)}ms — ${searchData.totalResults} results for "${query}"`);
  } catch (error) {
    console.error('[SearchResults] DB error:', error);

    // Determine if this is a connection error vs query error
    try {
      await checkDbConnection();
    } catch (connError) {
      if (connError instanceof DatabaseConnectionError) {
        dbReachable = false;
        return <DBUnreachableState />;
      }
    }

    // DB is reachable but query failed (bad SQL, etc.)
    return <DBQueryErrorState />;
  }

  const { courses, videos, podcasts, shorts, creators, totalResults } = searchData;

  // ── Step 2: Live fallback if no DB results ─────────────────────────────
  let isLiveResults = false;
  let displayData = searchData;

  if (totalResults === 0) {
    console.log(`[SearchResults] No DB results for "${query}" — trying live fallback`);
    const liveStart = performance.now();

    try {
      const { fastSearch } = await import('@/services/search/fast');
      const liveSearchData = await fastSearch({ q: seededTopic?.name ?? query });

      if (liveSearchData.totalResults > 0) {
        displayData = liveSearchData;
        isLiveResults = true;
        console.log(`[SearchResults] Live fallback returned ${liveSearchData.totalResults} results in ${Math.round(performance.now() - liveStart)}ms`);
      } else {
        console.log(`[SearchResults] Live fallback also returned 0 results in ${Math.round(performance.now() - liveStart)}ms`);
      }
    } catch (e) {
      console.error('[SearchResults] Live fallback failed:', e);
    }

    // Trigger background ingestion regardless (non-blocking)
    void triggerIngestion(query);

    // If still no results after live fallback, show cold start
    if (!isLiveResults) {
      return <ColdStartState query={query} />;
    }
  }

  const { courses: displayCourses, videos: displayVideos, podcasts: displayPodcasts, shorts: displayShorts, creators: displayCreators } = displayData;
  const displayTotalResults = displayData.totalResults;

  // Classify intent to determine section order
  const { categoryOrder } = classifyIntent(query);

  // Generate AI overview (only for DB results, not live)
  let aiOverview = null;
  if (!isLiveResults && totalResults > 0 && !seededTopic) {
    try {
      const allContent = [
        ...courses.map((c) => ({ title: c.title, description: null, contentType: 'course' })),
        ...videos.map((v) => ({ title: v.title, description: v.description, contentType: v.contentType })),
        ...podcasts.map((p) => ({ title: p.title, description: p.description, contentType: p.contentType })),
      ];
      aiOverview = await generateTopicOverview(query, allContent);
    } catch (e) {
      console.error('[SearchResults] AI overview error:', e);
    }
  }

  console.log(`[SearchResults] Total render pipeline for "${query}": ${Math.round(performance.now() - totalStart)}ms (live=${isLiveResults})`);

  return (
    <div>
      {/* Results header */}
      <div className="mb-8 animate-fade-up">
        <h1
          className="font-bold text-2xl mb-1"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
        >
          Results for{' '}
          <span className="gradient-text">&ldquo;{query}&rdquo;</span>
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          {isLiveResults && (
            <span className="inline-flex items-center gap-1 mr-2 px-2 py-0.5 rounded-full text-xs"
              style={{ background: 'rgba(var(--brand-rgb), 0.1)', color: 'var(--brand-primary)' }}>
              ⚡ Live results
            </span>
          )}
          {`${displayTotalResults} items across ${categoryOrder.filter((cat) => {
            const map = { courses: displayCourses, videos: displayVideos, podcasts: displayPodcasts, shorts: displayShorts, creators: displayCreators };
            return (map[cat]?.length ?? 0) > 0;
          }).length} categories`}
        </p>
      </div>

      {/* AI Topic Overview (only for DB results) */}
      {aiOverview && (
        <AIOverviewCard topicName={query} overview={aiOverview} />
      )}

      {/*
       * Render categories in CANONICAL SPEC ORDER:
       *   1. Courses       — shown if 1+ exists
       *   2. Podcasts      — shown ONLY if 1+ exists; omitted entirely otherwise
       *   3. Videos        — shown if 1+ exists
       *   4. Shorts        — shown ONLY if 1+ exists; omitted entirely otherwise
       *   5. Creators      — shown if 1+ exists
       *
       * Implemented as a filtered array of section configs so this order
       * can never be accidentally broken by a future sequential-JSX edit.
       */}
      <div className="space-y-14">
        {[
          {
            key: 'courses' as const,
            items: displayCourses,
            alwaysShow: false,
            render: (items: typeof displayCourses, i: number) => (
              <div key="courses" style={{ animationDelay: `${i * 0.08}s` }}>
                <CategorySection
                  id="courses"
                  title={CATEGORY_META.courses.label}
                  icon={CATEGORY_META.courses.icon()}
                  count={items.length}
                  defaultVisible={5}
                >
                  {items.map((course) => (
                    <CourseCard key={course.id} course={course as Playlist} />
                  ))}
                </CategorySection>
              </div>
            ),
          },
          {
            key: 'podcasts' as const,
            items: displayPodcasts,
            alwaysShow: false,
            render: (items: typeof displayPodcasts, i: number) => (
              <div key="podcasts" style={{ animationDelay: `${i * 0.08}s` }}>
                <CategorySection
                  id="podcasts"
                  title={CATEGORY_META.podcasts.label}
                  icon={CATEGORY_META.podcasts.icon()}
                  count={items.length}
                  defaultVisible={5}
                >
                  {items.map((video) => (
                    <VideoCard key={video.id} video={video as VideoType} />
                  ))}
                </CategorySection>
              </div>
            ),
          },
          {
            key: 'videos' as const,
            items: displayVideos,
            alwaysShow: false,
            render: (items: typeof displayVideos, i: number) => (
              <div key="videos" style={{ animationDelay: `${i * 0.08}s` }}>
                <CategorySection
                  id="videos"
                  title={CATEGORY_META.videos.label}
                  icon={CATEGORY_META.videos.icon()}
                  count={items.length}
                  defaultVisible={5}
                >
                  {items.map((video) => (
                    <VideoCard key={video.id} video={video as VideoType} />
                  ))}
                </CategorySection>
              </div>
            ),
          },
          {
            key: 'shorts' as const,
            items: displayShorts,
            alwaysShow: false,
            render: (items: typeof displayShorts, i: number) => (
              <div key="shorts" style={{ animationDelay: `${i * 0.08}s` }}>
                <CategorySection
                  id="shorts"
                  title={CATEGORY_META.shorts.label}
                  icon={CATEGORY_META.shorts.icon()}
                  count={items.length}
                  defaultVisible={5}
                >
                  {items.map((video) => (
                    <VideoCard key={video.id} video={video as VideoType} />
                  ))}
                </CategorySection>
              </div>
            ),
          },
          {
            key: 'creators' as const,
            items: displayCreators,
            alwaysShow: false,
            render: (items: typeof displayCreators, i: number) => (
              <div key="creators" style={{ animationDelay: `${i * 0.08}s` }}>
                <CategorySection
                  id="creators"
                  title={CATEGORY_META.creators.label}
                  icon={CATEGORY_META.creators.icon()}
                  count={items.length}
                  twoColumn
                  defaultVisible={5}
                >
                  {items.map((ch) => (
                    <CreatorCard key={ch.id} channel={ch as Channel} />
                  ))}
                </CategorySection>
              </div>
            ),
          },
        ]
          // Filter: omit sections with 0 items (Podcasts and Shorts are omit-if-empty per spec)
          .filter((section) => section.items.length > 0)
          .map((section, i) => section.render(section.items as never, i))}
      </div>
    </div>
  );
}

/**
 * Shown when the database is completely unreachable (connection refused,
 * timeout, pool exhausted, etc.). This is an ops/infrastructure issue.
 */
function DBUnreachableState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div
        className="flex items-center justify-center rounded-2xl mb-6"
        style={{ width: 72, height: 72, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <h2 className="font-bold text-xl mb-2" style={{ color: 'var(--text-primary)' }}>
        Service temporarily unavailable
      </h2>
      <p style={{ color: 'var(--text-secondary)', maxWidth: 360 }}>
        We&apos;re having trouble connecting to our database. This is a temporary infrastructure issue — please try again in a few moments.
      </p>
    </div>
  );
}

/**
 * Shown when the database IS reachable but a specific query failed
 * (bad SQL, unexpected schema, etc.). Different from a connection issue.
 */
function DBQueryErrorState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div
        className="flex items-center justify-center rounded-2xl mb-6"
        style={{ width: 72, height: 72, background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)' }}
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.5">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      </div>
      <h2 className="font-bold text-xl mb-2" style={{ color: 'var(--text-primary)' }}>
        Something went wrong
      </h2>
      <p style={{ color: 'var(--text-secondary)', maxWidth: 360 }}>
        We encountered an error while searching. Our team has been notified. Please try a different search or come back shortly.
      </p>
    </div>
  );
}

