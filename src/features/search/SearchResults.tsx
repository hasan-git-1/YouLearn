/**
 * SearchResults — async Server Component
 *
 * Fetches search data server-side via the internal search service
 * (never via a fetch to /api/search — direct service call is faster).
 * Renders categorized results in intent-ranked order.
 */

import { GraduationCap, Video, Mic, Zap, Users } from 'lucide-react';
import { CategorySection } from '@/components/ui/CategorySection';
import { AIOverviewCard } from '@/components/ui/AIOverviewCard';
import { VideoCard } from '@/components/cards/VideoCard';
import { CourseCard } from '@/components/cards/CourseCard';
import { CreatorCard } from '@/components/cards/CreatorCard';
import { ColdStartState } from '@/components/ui/ColdStartState';
import { keywordSearch } from '@/services/search/keyword';
import { classifyIntent } from '@/services/search/intent';
import { generateTopicOverview } from '@/services/ai';
import type { Video as VideoType, Playlist, Channel, SearchResultCategories } from '@/types';

// Fire-and-forget ingestion trigger for cold-start — server-side
async function triggerIngestion(query: string) {
  try {
    const { inngest } = await import('@/jobs/ingestion');
    await inngest.send({
      name: 'app/topic.ingest',
      data: { topic: query, maxSearchCalls: 2, skipIfRecent: false },
    });
  } catch (e) {
    console.error('[SearchResults] Could not trigger ingestion:', e);
  }
}

const CATEGORY_META: Record<
  keyof SearchResultCategories,
  { label: string; icon: React.ReactNode; twoColumn?: boolean }
> = {
  courses: { label: 'Courses', icon: <GraduationCap size={18} color="white" /> },
  videos: { label: 'Videos', icon: <Video size={18} color="white" /> },
  podcasts: { label: 'Podcasts', icon: <Mic size={18} color="white" /> },
  shorts: { label: 'Shorts', icon: <Zap size={18} color="white" /> },
  creators: { label: 'Creators', icon: <Users size={18} color="white" />, twoColumn: true },
};

interface SearchResultsProps {
  query: string;
  limit?: number;
}

export async function SearchResults({ query, limit = 12 }: SearchResultsProps) {
  // Direct service call — no HTTP overhead
  let searchData;
  try {
    searchData = await keywordSearch({ q: query, limit });
  } catch (error) {
    console.error('[SearchResults] DB error:', error);
    return <DBErrorState />;
  }

  const { courses, videos, podcasts, shorts, creators, totalResults } = searchData;

  // Cold start: no results in DB yet
  if (totalResults === 0) {
    // Trigger background ingestion (non-blocking)
    void triggerIngestion(query);
    return <ColdStartState query={query} />;
  }

  // Classify intent to determine section order
  const { categoryOrder } = classifyIntent(query);

  // Generate AI overview
  let aiOverview = null;
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
          {totalResults} items across {categoryOrder.filter((cat) => {
            const map = { courses, videos, podcasts, shorts, creators };
            return (map[cat]?.length ?? 0) > 0;
          }).length} categories
        </p>
      </div>

      {/* AI Topic Overview */}
      {aiOverview && (
        <AIOverviewCard topicName={query} overview={aiOverview} />
      )}

      {/* Render categories in intent-ranked order */}
      <div className="space-y-14">
        {categoryOrder.map((categoryKey, i) => {
          const meta = CATEGORY_META[categoryKey];
          const animDelay = `${i * 0.08}s`;

          if (categoryKey === 'courses') {
            if (!courses.length) return null;
            return (
              <div key="courses" style={{ animationDelay: animDelay }}>
                <CategorySection id="courses" title={meta.label} icon={meta.icon} count={courses.length}>
                  {courses.slice(0, limit).map((course) => (
                    <CourseCard key={course.id} course={course as Playlist} />
                  ))}
                </CategorySection>
              </div>
            );
          }

          if (categoryKey === 'videos') {
            if (!videos.length) return null;
            return (
              <div key="videos" style={{ animationDelay: animDelay }}>
                <CategorySection id="videos" title={meta.label} icon={meta.icon} count={videos.length}>
                  {videos.slice(0, limit).map((video) => (
                    <VideoCard key={video.id} video={video as VideoType} />
                  ))}
                </CategorySection>
              </div>
            );
          }

          if (categoryKey === 'podcasts') {
            if (!podcasts.length) return null;
            return (
              <div key="podcasts" style={{ animationDelay: animDelay }}>
                <CategorySection id="podcasts" title={meta.label} icon={meta.icon} count={podcasts.length}>
                  {podcasts.slice(0, limit).map((video) => (
                    <VideoCard key={video.id} video={video as VideoType} />
                  ))}
                </CategorySection>
              </div>
            );
          }

          if (categoryKey === 'shorts') {
            if (!shorts.length) return null;
            return (
              <div key="shorts" style={{ animationDelay: animDelay }}>
                <CategorySection id="shorts" title={meta.label} icon={meta.icon} count={shorts.length}>
                  {shorts.slice(0, limit).map((video) => (
                    <VideoCard key={video.id} video={video as VideoType} />
                  ))}
                </CategorySection>
              </div>
            );
          }

          if (categoryKey === 'creators') {
            if (!creators.length) return null;
            return (
              <div key="creators" style={{ animationDelay: animDelay }}>
                <CategorySection
                  id="creators"
                  title={meta.label}
                  icon={meta.icon}
                  count={creators.length}
                  twoColumn
                >
                  {creators.slice(0, limit).map((ch) => (
                    <CreatorCard key={ch.id} channel={ch as Channel} />
                  ))}
                </CategorySection>
              </div>
            );
          }

          return null;
        })}
      </div>
    </div>
  );
}

function DBErrorState() {
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
        Something went wrong
      </h2>
      <p style={{ color: 'var(--text-secondary)', maxWidth: 360 }}>
        We couldn&apos;t fetch results right now. This might be a database configuration issue — please ensure your <code style={{ background: 'var(--bg-elevated)', padding: '1px 6px', borderRadius: 4 }}>DATABASE_URL</code> is set correctly.
      </p>
    </div>
  );
}
