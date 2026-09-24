/**
 * SearchResults — async Server Component
 *
 * Fetches search data server-side via the internal search service
 * (never via a fetch to /api/search — direct service call is faster).
 * Renders categorized results in intent-ranked order.
 */

import { GraduationCap, Video, Mic, Zap, Users, Wifi, RefreshCw } from 'lucide-react';
import { CategorySection } from '@/components/ui/CategorySection';
import { AIOverviewCard } from '@/components/ui/AIOverviewCard';
import { VideoCard } from '@/components/cards/VideoCard';
import { CourseCard } from '@/components/cards/CourseCard';
import { CreatorCard } from '@/components/cards/CreatorCard';
import { keywordSearch } from '@/services/search/keyword';
import { fastSearch } from '@/services/search/fast';
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

  // Cold start: no results in DB yet — use fast direct YouTube search
  let isLiveResults = false;
  let liveSearchData: typeof searchData | null = null;

  if (totalResults === 0) {
    // Trigger background ingestion (non-blocking)
    void triggerIngestion(query);

    // Fetch live results from YouTube API directly
    try {
      liveSearchData = await fastSearch({ q: query, limit });
      isLiveResults = true;
    } catch (e) {
      console.error('[SearchResults] Fast search error:', e);
    }
  }

  // Use live data if available, otherwise DB data
  const displayData = isLiveResults && liveSearchData ? liveSearchData : searchData;
  const { courses: displayCourses, videos: displayVideos, podcasts: displayPodcasts, shorts: displayShorts, creators: displayCreators } = displayData;

  // Classify intent to determine section order
  const { categoryOrder } = classifyIntent(query);

  // Generate AI overview (only for DB results, not live)
  let aiOverview = null;
  if (!isLiveResults && totalResults > 0) {
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
          {isLiveResults
            ? `${displayData.totalResults} live results from YouTube`
            : `${totalResults} items across ${categoryOrder.filter((cat) => {
                const map = { courses, videos, podcasts, shorts, creators };
                return (map[cat]?.length ?? 0) > 0;
              }).length} categories`}
        </p>
      </div>

      {/* Live results indicator */}
      {isLiveResults && <LiveResultsIndicator query={query} />}

      {/* AI Topic Overview (only for DB results) */}
      {aiOverview && (
        <AIOverviewCard topicName={query} overview={aiOverview} />
      )}

      {/* Render categories in intent-ranked order */}
      <div className="space-y-14">
        {categoryOrder.map((categoryKey, i) => {
          const meta = CATEGORY_META[categoryKey];
          const animDelay = `${i * 0.08}s`;

          if (categoryKey === 'courses') {
            if (!displayCourses.length) return null;
            return (
              <div key="courses" style={{ animationDelay: animDelay }}>
                <CategorySection id="courses" title={meta.label} icon={meta.icon} count={displayCourses.length}>
                  {displayCourses.slice(0, limit).map((course) => (
                    <CourseCard key={course.id} course={course as Playlist} />
                  ))}
                </CategorySection>
              </div>
            );
          }

          if (categoryKey === 'videos') {
            if (!displayVideos.length) return null;
            return (
              <div key="videos" style={{ animationDelay: animDelay }}>
                <CategorySection id="videos" title={meta.label} icon={meta.icon} count={displayVideos.length}>
                  {displayVideos.slice(0, limit).map((video) => (
                    <VideoCard key={video.id} video={video as VideoType} />
                  ))}
                </CategorySection>
              </div>
            );
          }

          if (categoryKey === 'podcasts') {
            if (!displayPodcasts.length) return null;
            return (
              <div key="podcasts" style={{ animationDelay: animDelay }}>
                <CategorySection id="podcasts" title={meta.label} icon={meta.icon} count={displayPodcasts.length}>
                  {displayPodcasts.slice(0, limit).map((video) => (
                    <VideoCard key={video.id} video={video as VideoType} />
                  ))}
                </CategorySection>
              </div>
            );
          }

          if (categoryKey === 'shorts') {
            if (!displayShorts.length) return null;
            return (
              <div key="shorts" style={{ animationDelay: animDelay }}>
                <CategorySection id="shorts" title={meta.label} icon={meta.icon} count={displayShorts.length}>
                  {displayShorts.slice(0, limit).map((video) => (
                    <VideoCard key={video.id} video={video as VideoType} />
                  ))}
                </CategorySection>
              </div>
            );
          }

          if (categoryKey === 'creators') {
            if (!displayCreators.length) return null;
            return (
              <div key="creators" style={{ animationDelay: animDelay }}>
                <CategorySection
                  id="creators"
                  title={meta.label}
                  icon={meta.icon}
                  count={displayCreators.length}
                  twoColumn
                >
                  {displayCreators.slice(0, limit).map((ch) => (
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
