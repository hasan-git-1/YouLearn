import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { GraduationCap, Video, Mic, Zap, Users, Hash, Wifi } from 'lucide-react';
import { db } from '@/db';
import { topics } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { keywordSearch } from '@/services/search/keyword';
import { fastSearch } from '@/services/search/fast';
import { classifyIntent } from '@/services/search/intent';
import { generateTopicOverview, generateLearningPath } from '@/services/ai';
import { CategorySection } from '@/components/ui/CategorySection';
import { AIOverviewCard } from '@/components/ui/AIOverviewCard';
import { AILearningPathView } from '@/components/ui/AILearningPathView';
import { VideoCard } from '@/components/cards/VideoCard';
import { CourseCard } from '@/components/cards/CourseCard';
import { CreatorCard } from '@/components/cards/CreatorCard';
import type { Video as VideoType, Playlist, Channel } from '@/types';

// Live results indicator for fast search
function LiveResultsIndicator({ query }: { query: string }) {
  return (
    <div className="mb-8 animate-fade-up flex items-center justify-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
      <Wifi size={16} className="text-emerald-400 animate-pulse" />
      <span>Showing live YouTube results for <strong style={{ color: 'var(--text-primary)' }}>&ldquo;{query}&rdquo;</strong></span>
      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
        Live
      </span>
      <p className="text-xs max-w-md text-center" style={{ color: 'var(--text-muted)' }}>
        These are real-time results from YouTube. Full indexing with AI summaries takes ~3-5 minutes.
      </p>
    </div>
  );
}

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
  const topic = await db.query.topics.findFirst({ where: eq(topics.slug, slug) });
  if (!topic) return { title: 'Topic Not Found — Tubiq' };
  return {
    title: `${topic.name} — Tubiq`,
    description: topic.description ?? `Discover the best YouTube content to learn ${topic.name}. Courses, videos, podcasts and top creators — curated by Tubiq.`,
  };
}

export default async function TopicPage({ params }: TopicPageProps) {
  const { slug } = await params;

  const topic = await db.query.topics.findFirst({ where: eq(topics.slug, slug) });
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

  const searchData = await keywordSearch({ q: topic.name, limit: 12 });
  const { categoryOrder } = classifyIntent(topic.name);
  const { courses, videos, podcasts, shorts, creators, totalResults } = searchData;

  // Cold start: no results in DB yet — use fast direct YouTube search
  let isLiveResults = false;
  let liveSearchData: typeof searchData | null = null;

  if (totalResults === 0) {
    // Fetch live results from YouTube API directly
    try {
      liveSearchData = await fastSearch({ q: topic.name, limit: 12 });
      isLiveResults = true;
    } catch (e) {
      console.error('[TopicPage] Fast search error:', e);
    }
  }

  // Use live data if available, otherwise DB data
  const displayData = isLiveResults && liveSearchData ? liveSearchData : searchData;
  const { courses: displayCourses, videos: displayVideos, podcasts: displayPodcasts, shorts: displayShorts, creators: displayCreators } = displayData;

  // Generate AI overview and learning path if content exists (only for DB results)
  let aiOverview = null;
  let aiLearningPath = null;

  if (!isLiveResults && totalResults > 0) {
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
          {totalResults > 0 && (
            <div className="flex flex-wrap gap-2 mt-6">
              {categoryOrder.map((cat) => {
                const counts: Record<string, number> = { courses: courses.length, videos: videos.length, podcasts: podcasts.length, shorts: shorts.length, creators: creators.length };
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
        {isLiveResults && <LiveResultsIndicator query={topic.name} />}
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

          {/* Content Categories */}
          <div className="space-y-14">
            {categoryOrder.map((cat) => {
              if (cat === 'courses' && displayCourses.length > 0) return (
                <CategorySection key="courses" id="courses" title="Courses" icon={<GraduationCap size={18} color="white" />} count={displayCourses.length}>
                  {displayCourses.map((c) => <CourseCard key={c.id} course={c as Playlist} />)}
                </CategorySection>
              );
            if (cat === 'videos' && displayVideos.length > 0) return (
              <CategorySection key="videos" id="videos" title="Videos" icon={<Video size={18} color="white" />} count={displayVideos.length}>
                {displayVideos.map((v) => <VideoCard key={v.id} video={v as VideoType} />)}
              </CategorySection>
            );
            if (cat === 'podcasts' && displayPodcasts.length > 0) return (
              <CategorySection key="podcasts" id="podcasts" title="Podcasts" icon={<Mic size={18} color="white" />} count={displayPodcasts.length}>
                {displayPodcasts.map((v) => <VideoCard key={v.id} video={v as VideoType} />)}
              </CategorySection>
            );
            if (cat === 'shorts' && displayShorts.length > 0) return (
              <CategorySection key="shorts" id="shorts" title="Shorts" icon={<Zap size={18} color="white" />} count={displayShorts.length}>
                {displayShorts.map((v) => <VideoCard key={v.id} video={v as VideoType} />)}
              </CategorySection>
            );
            if (cat === 'creators' && displayCreators.length > 0) return (
              <CategorySection key="creators" id="creators" title="Creators" icon={<Users size={18} color="white" />} count={displayCreators.length} twoColumn>
                {displayCreators.map((c) => <CreatorCard key={c.id} channel={c as Channel} />)}
              </CategorySection>
            );
            return null;
          })}
          </div>
        </div>
      </div>
    </div>
  );
}
