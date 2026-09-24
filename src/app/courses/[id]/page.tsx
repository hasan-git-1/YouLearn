import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { db } from '@/db';
import { playlists, playlistItems, videos, channels } from '@/db/schema';
import { eq, asc } from 'drizzle-orm';
import { CourseDetailClient } from './CourseDetailClient';
import { formatDuration } from '@/lib/utils';
import type { Playlist, Channel } from '@/types';

interface CoursePageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: CoursePageProps): Promise<Metadata> {
  const { id } = await params;
  const playlist = await db.query.playlists.findFirst({ where: eq(playlists.id, id) });
  if (!playlist) return { title: 'Course Not Found — Tubiq' };
  return {
    title: `${playlist.title} — Tubiq`,
    description: `Full course: ${playlist.title}. ${playlist.videoCount ?? 0} videos${
      playlist.estimatedDurationSeconds ? ` · ${formatDuration(playlist.estimatedDurationSeconds)}` : ''
    }.`,
  };
}

export default async function CoursePage({ params }: CoursePageProps) {
  const { id } = await params;

  const playlistRow = await db.query.playlists.findFirst({
    where: eq(playlists.id, id),
  });
  if (!playlistRow) notFound();

  // Get channel
  let channelData: Channel | null = null;
  if (playlistRow.channelId) {
    const ch = await db.query.channels.findFirst({ where: eq(channels.id, playlistRow.channelId) });
    if (ch) {
      channelData = {
        id: ch.id,
        youtubeChannelId: ch.youtubeChannelId,
        name: ch.name,
        description: ch.description,
        subscriberCount: ch.subscriberCount,
        videoCount: ch.videoCount,
        thumbnailUrl: ch.thumbnailUrl,
        contentSource: 'youtube',
        lastSyncedAt: ch.lastSyncedAt,
      };
    }
  }

  // Get ordered playlist items with video data
  const items = await db
    .select({
      position: playlistItems.position,
      videoId: playlistItems.videoId,
      title: videos.title,
      thumbnailUrl: videos.thumbnailUrl,
      durationSeconds: videos.durationSeconds,
      viewCount: videos.viewCount,
      youtubeVideoId: videos.youtubeVideoId,
      difficulty: videos.difficulty,
      contentType: videos.contentType,
    })
    .from(playlistItems)
    .innerJoin(videos, eq(playlistItems.videoId, videos.id))
    .where(eq(playlistItems.playlistId, id))
    .orderBy(asc(playlistItems.position))
    .limit(100);

  const playlist: Playlist = {
    id: playlistRow.id,
    youtubePlaylistId: playlistRow.youtubePlaylistId,
    channelId: playlistRow.channelId,
    title: playlistRow.title,
    videoCount: playlistRow.videoCount,
    isCourse: playlistRow.isCourse,
    courseConfidence: playlistRow.courseConfidence,
    difficulty: playlistRow.difficulty as Playlist['difficulty'],
    estimatedDurationSeconds: playlistRow.estimatedDurationSeconds,
    contentSource: 'youtube',
    lastSyncedAt: playlistRow.lastSyncedAt,
    channel: channelData ?? undefined,
  };

  return <CourseDetailClient playlist={playlist} channel={channelData} items={items} />;
}
