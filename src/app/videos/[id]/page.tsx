import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { db } from '@/db';
import { videos, playlists } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { VideoDetailClient } from './VideoDetailClient';
import type { Video, Playlist } from '@/types';

interface VideoPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: VideoPageProps): Promise<Metadata> {
  const { id } = await params;
  const video = await db.query.videos.findFirst({
    where: eq(videos.id, id),
    with: { channel: true },
  });
  if (!video) return { title: 'Video Not Found — YouLearn' };
  return {
    title: `${video.title} — YouLearn`,
    description: video.description?.slice(0, 160) ?? `Watch "${video.title}" on YouLearn.`,
  };
}

export default async function VideoPage({ params }: VideoPageProps) {
  const { id } = await params;

  const video = await db.query.videos.findFirst({
    where: eq(videos.id, id),
    with: { channel: true },
  });

  if (!video) notFound();

  let playlist: Playlist | null = null;
  if (video.playlistId) {
    const pl = await db.query.playlists.findFirst({
      where: eq(playlists.id, video.playlistId),
    });
    if (pl) {
      playlist = {
        id: pl.id,
        youtubePlaylistId: pl.youtubePlaylistId,
        channelId: pl.channelId,
        title: pl.title,
        videoCount: pl.videoCount,
        isCourse: pl.isCourse,
        courseConfidence: pl.courseConfidence,
        difficulty: pl.difficulty as 'beginner' | 'intermediate' | 'advanced' | 'unknown',
        estimatedDurationSeconds: pl.estimatedDurationSeconds,
        contentSource: 'youtube',
        lastSyncedAt: pl.lastSyncedAt,
      };
    }
  }

  // Map DB row to Video type
  const videoData: Video = {
    id: video.id,
    youtubeVideoId: video.youtubeVideoId,
    channelId: video.channelId,
    playlistId: video.playlistId,
    title: video.title,
    description: video.description,
    thumbnailUrl: video.thumbnailUrl,
    publishedAt: video.publishedAt,
    durationSeconds: video.durationSeconds,
    viewCount: video.viewCount,
    likeCount: video.likeCount,
    contentType: video.contentType as Video['contentType'],
    difficulty: video.difficulty as Video['difficulty'],
    aiSummary: video.aiSummary,
    aiTopics: video.aiTopics ?? [],
    transcriptStatus: video.transcriptStatus as Video['transcriptStatus'],
    contentSource: 'youtube',
    lastSyncedAt: video.lastSyncedAt,
    channel: video.channel
      ? {
          id: video.channel.id,
          youtubeChannelId: video.channel.youtubeChannelId,
          name: video.channel.name,
          description: video.channel.description,
          subscriberCount: video.channel.subscriberCount,
          videoCount: video.channel.videoCount,
          thumbnailUrl: video.channel.thumbnailUrl,
          contentSource: 'youtube',
          lastSyncedAt: video.channel.lastSyncedAt,
        }
      : undefined,
  };

  // Generate AI Summary on-demand if not already cached in DB
  if (!videoData.aiSummary && video.description) {
    try {
      const { generateRelevanceBlurb } = await import('@/services/ai');
      const blurb = await generateRelevanceBlurb(video.title, {
        title: video.title,
        description: video.description,
        contentType: video.contentType,
      });

      if (blurb) {
        videoData.aiSummary = blurb;
        // Non-blocking background cache update
        db.update(videos)
          .set({ aiSummary: blurb })
          .where(eq(videos.id, video.id))
          .catch(() => {});
      }
    } catch (e) {
      console.error('[VideoPage] AI summary error:', e);
    }
  }

  return <VideoDetailClient video={videoData} playlist={playlist} />;
}
