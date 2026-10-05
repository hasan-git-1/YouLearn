import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { GraduationCap, Video, Mic, Zap, Users, Hash } from 'lucide-react';
import { db } from '@/db';
import { topics } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { keywordSearch } from '@/services/search/keyword';
import { classifyIntent } from '@/services/search/intent';
import { generateTopicOverview, generateLearningPath } from '@/services/ai';
import { getSeedTopicBySlug } from '@/services/ingestion/seed-topics';
import { CategorySection } from '@/components/ui/CategorySection';
import { AIOverviewCard } from '@/components/ui/AIOverviewCard';
import { AILearningPathView } from '@/components/ui/AILearningPathView';
import { VideoCard } from '@/components/cards/VideoCard';
import { CourseCard } from '@/components/cards/CourseCard';
import { CreatorCard } from '@/components/cards/CreatorCard';
import { SectionErrorBoundary } from '@/components/ui/SectionErrorBoundary';
import type { Video as VideoType, Playlist, Channel, SearchResultCategories } from '@/types';

type TopicSearchData = SearchResultCategories & { totalResults: number };

const emptySearchData = (): TopicSearchData => ({
  courses: [],
  videos: [],
  podcasts: [],
  shorts: [],
  creators: [],
  totalResults: 0,
});

// Skeleton fallback for Suspense
function TopicPageSkeleton() {
  return (
    <div style={{ minHeight: '100dvh' }}>
      <section className="px-4 py-16 bg-grid bg-radial-glow" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div className="skeleton h-6 w-32 mb-4 rounded" />
          <div className="skeleton h-10 w-3/4 mb-4 rounded" />
          <div className="skeleton h-4 w-1/2 mb-6 rounded" />
          <div className="flex gap-2">
            <div className="skeleton h-6 w-24 rounded" />
            <div className="skeleton h-6 w-24 rounded" />
            <div className="skeleton h-6 w-24 rounded" />
          </div>
        </div>
      </section>
      <div className="px-4 py-10" style={{ maxWidth: 1280, margin: '0 auto' }}>
        <p className="mb-6 text-sm" style={{ color: 'var(--text-secondary)' }}>
          Finding and organizing content for this topic...
        </p>
        <div className="space-y-14">
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
      </div>
    </div>
  );
}

interface TopicPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: TopicPageProps): Promise<Metadata> {
  const { slug } = await params;
  let topic: { name: string; description: string | null } | undefined;
  try {
    topic = await db.query.topics.findFirst({ where: eq(topics.slug, slug) });
  } catch (error) {
    console.error('[TopicPage] Metadata topic lookup failed:', { slug, error });
  }
  if (!topic) return { title: 'Topic Not Found — Tubiq' };
  return {
    title: `${topic.name} — Tubiq`,
    description: topic.description ?? `Discover the best YouTube content to learn ${topic.name}. Courses, videos, podcasts and top creators — curated by Tubiq.`,
  };
}

export default async function TopicPage({ params }: TopicPageProps) {
  const { slug } = await params;

  let topic: { name: string; slug: string; description: string | null } | undefined;
  try {
    topic = await db.query.topics.findFirst({ where: eq(topics.slug, slug) });
  } catch (error) {
    // A transient database failure is not a missing topic. Avoid turning it
    // into a misleading 404 while preserving the server-side diagnostic.
    console.error('[TopicPage] Topic lookup failed:', { slug, error });
    return <TopicUnavailable />;
  }

  if (!topic) notFound();

  return (
    <div style={{ minHeight: '100dvh' }}>
      <Suspense fallback={<TopicPageSkeleton />}>
        <TopicPageContent topic={topic} />
      </Suspense>
    </div>
  );
}

async function TopicPageContent({ topic }: { topic: { name: string; slug: string; description: string | null } }) {
  const seededTopic = getSeedTopicBySlug(topic.slug);
  let searchData = emptySearchData();
  try {
    searchData = await keywordSearch({
      q: topic.name,
      pool: 50,
      topicSlug: seededTopic?.slug,
    });
  } catch (error) {
    // Search failures are expected operational failures, not an RSC crash.
    // The live path below still gives the visitor a chance to see content.
    console.error('[TopicPage] Seeded search failed:', { topic: topic.slug, error });
  }
  const { categoryOrder } = classifyIntent(topic.name);
  const { courses, videos, podcasts, totalResults } = searchData;

  let isLiveResults = false;
  let liveSearchData: TopicSearchData | null = null;

  // Empty data is a cold start whether the topic is seeded or not. The live
  // search uses the same multi-query, relevance-filtered pipeline as ingestion.
  if (totalResults === 0) {
    try {
      const { fastSearch } = await import('@/services/search/fast');
      liveSearchData = await fastSearch({ q: topic.name, limit: 12 });
      isLiveResults = liveSearchData.totalResults > 0;
    } catch (e) {
      console.error('[TopicPage] Live fallback failed:', { topic: topic.slug, error: e });
    }

    // Inngest enforces a per-topic concurrency and rate limit, preventing a
    // burst of empty-page requests from starting duplicate ingestion work.
    try {
      const { inngest } = await import('@/jobs/ingestion');
      await inngest.send({
        name: 'app/topic.ingest',
        data: { topic: topic.name, maxSearchCalls: 6, skipIfRecent: false },
      });
    } catch (error) {
      console.error('[TopicPage] Could not queue background ingestion:', { topic: topic.slug, error });
    }
  }

  // Use live data if available, otherwise DB data
  const displayData = isLiveResults && liveSearchData ? liveSearchData : searchData;
  const { courses: displayCourses, videos: displayVideos, podcasts: displayPodcasts, shorts: displayShorts, creators: displayCreators } = displayData;
  const displayTotalResults = displayData.totalResults;

  // Generate AI overview and learning path if content exists (only for DB results)
  let aiOverview = null;
  let aiLearningPath = null;

  if (!isLiveResults && totalResults > 0 && !seededTopic) {
    const allContent = [
      ...courses.map((c) => ({
        id: c.id,
        title: c.title,
        description: null,
        contentType: 'course',
        durationSeconds: c.estimatedDurationSeconds,
        difficulty: c.difficulty,
      })),
      ...videos.map((v) => ({
        id: v.id,
        title: v.title,
        description: v.description,
        contentType: v.contentType,
        durationSeconds: v.durationSeconds,
        difficulty: v.difficulty,
      })),
      ...podcasts.map((p) => ({
        id: p.id,
        title: p.title,
        description: p.description,
        contentType: p.contentType,
        durationSeconds: p.durationSeconds,
        difficulty: p.difficulty,
      })),
    ];

    try {
      const [overviewRes, pathRes] = await Promise.allSettled([
        generateTopicOverview(topic.name, allContent),
        generateLearningPath(topic.name, allContent),
      ]);

      if (overviewRes.status === 'fulfilled') {
        aiOverview = overviewRes.value;
      }
      if (pathRes.status === 'fulfilled') {
        aiLearningPath = pathRes.value;
      }
    } catch (e) {
      console.error('[TopicPage] AI generation error:', e);
    }
  }

  // Create fast lookup maps for learning path (only for DB results)
  const videosById: Record<string, VideoType> = {};
  [...displayVideos, ...displayPodcasts, ...displayShorts].forEach((v) => {
    videosById[v.id] = v as VideoType;
  });

  const coursesById: Record<string, Playlist> = {};
  displayCourses.forEach((c) => {
    coursesById[c.id] = c as Playlist;
  });


  return (
    <div style={{ minHeight: '100dvh' }}>
      {/* Topic hero */}
      <section
        className="px-4 py-16 bg-grid bg-radial-glow"
        style={{ borderBottom: '1px solid var(--border-subtle)' }}
      >
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div className="flex items-center gap-2 mb-4">
            <Hash size={14} style={{ color: 'var(--text-muted)' }} />
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Topic</span>
          </div>
          <h1
            className="font-black mb-3"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              letterSpacing: '-0.03em',
              color: 'var(--text-primary)',
            }}
          >
            <span className="gradient-text">{topic.name}</span>
          </h1>
          {topic.description && (
            <p style={{ color: 'var(--text-secondary)', maxWidth: 600, fontSize: 16 }}>
              {topic.description}
            </p>
          )}

          {/* Category quick-nav */}
          {displayTotalResults > 0 && (
            <div className="flex flex-wrap gap-2 mt-6">
              {categoryOrder.map((cat) => {
                const counts: Record<string, number> = { courses: displayCourses.length, videos: displayVideos.length, podcasts: displayPodcasts.length, shorts: displayShorts.length, creators: displayCreators.length };
                if (!counts[cat]) return null;
                const labels: Record<string, string> = { courses: 'Courses', videos: 'Videos', podcasts: 'Podcasts', shorts: 'Shorts', creators: 'Creators' };
                return (
                  <a key={cat} href={`#${cat}`} className="tag tag-brand text-xs" style={{ textDecoration: 'none' }}>
                    {labels[cat]} ({counts[cat]})
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Content */}
      <div className="px-4 py-10" style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div>
          {/* AI Topic Overview (only for DB results) */}
          {aiOverview && (
            <AIOverviewCard topicName={topic.name} overview={aiOverview} />
          )}

          {/* AI Learning Path (only for DB results) */}
          {aiLearningPath && (
            <AILearningPathView
              learningPath={aiLearningPath}
              videosById={videosById}
              coursesById={coursesById}
            />
          )}

          {/* Content Categories — canonical spec order: Courses → Podcasts → Videos → Shorts → Creators
           * Implemented as a filtered array so order is structurally enforced (Issue 3). */}
          {displayTotalResults === 0 && (
            <div className="glass-card p-8 text-center" role="status">
              <h2 className="font-bold text-xl mb-2" style={{ color: 'var(--text-primary)' }}>Content is being prepared</h2>
              <p style={{ color: 'var(--text-secondary)' }}>
                We could not find content for this topic yet. It has been queued for ingestion and will be available soon.
              </p>
            </div>
          )}

          <SectionErrorBoundary>
            <div className="space-y-14">
              {[
              {
                key: 'courses',
                items: displayCourses,
                render: (items: typeof displayCourses) =>
                  items.length > 0 ? (
                    <CategorySection key="courses" id="courses" title="Courses" icon={<GraduationCap size={18} color="white" />} count={items.length}>
                      {items.map((c) => <CourseCard key={c.id} course={c as Playlist} />)}
                    </CategorySection>
                  ) : null,
              },
              {
                key: 'podcasts',
                items: displayPodcasts,
                render: (items: typeof displayPodcasts) =>
                  items.length > 0 ? (
                    <CategorySection key="podcasts" id="podcasts" title="Podcasts" icon={<Mic size={18} color="white" />} count={items.length}>
                      {items.map((v) => <VideoCard key={v.id} video={v as VideoType} />)}
                    </CategorySection>
                  ) : null,
              },
              {
                key: 'videos',
                items: displayVideos,
                render: (items: typeof displayVideos) =>
                  items.length > 0 ? (
                    <CategorySection key="videos" id="videos" title="Videos" icon={<Video size={18} color="white" />} count={items.length}>
                      {items.map((v) => <VideoCard key={v.id} video={v as VideoType} />)}
                    </CategorySection>
                  ) : null,
              },
              {
                key: 'shorts',
                items: displayShorts,
                render: (items: typeof displayShorts) =>
                  items.length > 0 ? (
                    <CategorySection key="shorts" id="shorts" title="Shorts" icon={<Zap size={18} color="white" />} count={items.length}>
                      {items.map((v) => <VideoCard key={v.id} video={v as VideoType} />)}
                    </CategorySection>
                  ) : null,
              },
              {
                key: 'creators',
                items: displayCreators,
                render: (items: typeof displayCreators) =>
                  items.length > 0 ? (
                    <CategorySection key="creators" id="creators" title="Creators" icon={<Users size={18} color="white" />} count={items.length} twoColumn>
                      {items.map((c) => <CreatorCard key={c.id} channel={c as Channel} />)}
                    </CategorySection>
                  ) : null,
              },
              ]
                .filter((section) => section.items.length > 0)
                .map((section) => section.render(section.items as never))}
            </div>
          </SectionErrorBoundary>
        </div>
      </div>
    </div>
  );
}

function TopicUnavailable() {
  return (
    <div className="flex min-h-dvh items-center justify-center px-4 text-center">
      <div>
        <h1 className="font-bold text-2xl mb-3" style={{ color: 'var(--text-primary)' }}>Topic temporarily unavailable</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Please try again in a moment.</p>
      </div>
    </div>
  );
}
