import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { GraduationCap, Video, Mic, Zap, Users, Hash } from 'lucide-react';
import { db } from '@/db';
import { topics } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { keywordSearch } from '@/services/search/keyword';
import { classifyIntent } from '@/services/search/intent';
import { generateTopicOverview, generateLearningPath } from '@/services/ai';
import { CategorySection } from '@/components/ui/CategorySection';
import { AIOverviewCard } from '@/components/ui/AIOverviewCard';
import { AILearningPathView } from '@/components/ui/AILearningPathView';
import { VideoCard } from '@/components/cards/VideoCard';
import { CourseCard } from '@/components/cards/CourseCard';
import { CreatorCard } from '@/components/cards/CreatorCard';
import { ColdStartState } from '@/components/ui/ColdStartState';
import type { Video as VideoType, Playlist, Channel } from '@/types';

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

  const searchData = await keywordSearch({ q: topic.name, limit: 12 });
  const { categoryOrder } = classifyIntent(topic.name);
  const { courses, videos, podcasts, shorts, creators, totalResults } = searchData;

  // Generate AI overview and learning path if content exists
  let aiOverview = null;
  let aiLearningPath = null;

  if (totalResults > 0) {
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

  // Create fast lookup maps for learning path
  const videosById: Record<string, VideoType> = {};
  [...videos, ...podcasts, ...shorts].forEach((v) => {
    videosById[v.id] = v as VideoType;
  });

  const coursesById: Record<string, Playlist> = {};
  courses.forEach((c) => {
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
        {totalResults === 0 ? (
          <ColdStartState query={topic.name} />
        ) : (
          <div>
            {/* AI Topic Overview */}
            {aiOverview && (
              <AIOverviewCard topicName={topic.name} overview={aiOverview} />
            )}

            {/* AI Learning Path */}
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
                if (cat === 'courses' && courses.length > 0) return (
                  <CategorySection key="courses" id="courses" title="Courses" icon={<GraduationCap size={18} color="white" />} count={courses.length}>
                    {courses.map((c) => <CourseCard key={c.id} course={c as Playlist} />)}
                  </CategorySection>
                );
              if (cat === 'videos' && videos.length > 0) return (
                <CategorySection key="videos" id="videos" title="Videos" icon={<Video size={18} color="white" />} count={videos.length}>
                  {videos.map((v) => <VideoCard key={v.id} video={v as VideoType} />)}
                </CategorySection>
              );
              if (cat === 'podcasts' && podcasts.length > 0) return (
                <CategorySection key="podcasts" id="podcasts" title="Podcasts" icon={<Mic size={18} color="white" />} count={podcasts.length}>
                  {podcasts.map((v) => <VideoCard key={v.id} video={v as VideoType} />)}
                </CategorySection>
              );
              if (cat === 'shorts' && shorts.length > 0) return (
                <CategorySection key="shorts" id="shorts" title="Shorts" icon={<Zap size={18} color="white" />} count={shorts.length}>
                  {shorts.map((v) => <VideoCard key={v.id} video={v as VideoType} />)}
                </CategorySection>
              );
              if (cat === 'creators' && creators.length > 0) return (
                <CategorySection key="creators" id="creators" title="Creators" icon={<Users size={18} color="white" />} count={creators.length} twoColumn>
                  {creators.map((c) => <CreatorCard key={c.id} channel={c as Channel} />)}
                </CategorySection>
              );
              return null;
            })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
