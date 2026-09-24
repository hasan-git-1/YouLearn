import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { db } from '@/db';
import { channels, videos } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { VideoCard } from '@/components/cards/VideoCard';
import { Users, Video, ExternalLink, ChevronLeft } from 'lucide-react';
import { formatCount, getYouTubeChannelUrl } from '@/lib/utils';
import type { Video as VideoType } from '@/types';

interface ChannelPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ChannelPageProps): Promise<Metadata> {
  const { id } = await params;
  const channel = await db.query.channels.findFirst({ where: eq(channels.id, id) });
  if (!channel) return { title: 'Channel Not Found — Tubiq' };
  return {
    title: `${channel.name} — Tubiq`,
    description: channel.description?.slice(0, 160) ?? `Explore ${channel.name}'s videos on Tubiq.`,
  };
}

export default async function ChannelPage({ params }: ChannelPageProps) {
  const { id } = await params;

  const channel = await db.query.channels.findFirst({ where: eq(channels.id, id) });
  if (!channel) notFound();

  const topVideos = await db.query.videos.findMany({
    where: eq(videos.channelId, id),
    orderBy: [desc(videos.viewCount)],
    limit: 24,
  });

  const subscribers = formatCount(channel.subscriberCount ?? undefined);
  const videoCount = formatCount(channel.videoCount ?? undefined);

  const initials = channel.name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');

  return (
    <div style={{ minHeight: '100dvh' }}>
      {/* Back nav */}
      <div className="px-4 pt-6" style={{ maxWidth: 1280, margin: '0 auto' }}>
        <button onClick={() => history.back()} className="btn-ghost py-2 px-3 text-xs flex items-center gap-1.5" style={{ width: 'fit-content' }}>
          <ChevronLeft size={14} /> Back
        </button>
      </div>

      {/* Channel hero */}
      <section
        className="px-4 py-12"
        style={{
          background: 'linear-gradient(180deg, var(--bg-surface) 0%, transparent 100%)',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6" style={{ maxWidth: 1280, margin: '0 auto' }}>
          {/* Avatar */}
          <div
            className="relative flex-shrink-0 rounded-full overflow-hidden"
            style={{
              width: 96,
              height: 96,
              background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))',
              boxShadow: '0 0 0 4px var(--bg-surface), 0 0 0 6px var(--border-default)',
            }}
          >
            {channel.thumbnailUrl ? (
              <Image src={channel.thumbnailUrl} alt={channel.name} fill className="object-cover" sizes="96px" unoptimized />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center font-bold text-white text-2xl">{initials}</div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 text-center sm:text-left">
            <h1
              className="font-black mb-2"
              style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}
            >
              {channel.name}
            </h1>

            <div className="flex items-center justify-center sm:justify-start gap-4 mb-3 text-sm" style={{ color: 'var(--text-muted)' }}>
              {subscribers && (
                <span className="flex items-center gap-1.5">
                  <Users size={14} /> {subscribers} subscribers
                </span>
              )}
              {videoCount && (
                <span className="flex items-center gap-1.5">
                  <Video size={14} /> {videoCount} videos
                </span>
              )}
            </div>

            {channel.description && (
              <p className="text-sm line-clamp-2 mb-4" style={{ color: 'var(--text-secondary)', maxWidth: 560 }}>
                {channel.description}
              </p>
            )}

            <a
              href={getYouTubeChannelUrl(channel.youtubeChannelId)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost py-2 px-4 text-xs inline-flex items-center gap-1.5"
            >
              <ExternalLink size={13} /> View on YouTube
            </a>
          </div>
        </div>
      </section>

      {/* Videos grid */}
      <div className="px-4 py-10" style={{ maxWidth: 1280, margin: '0 auto' }}>
        <h2
          className="font-bold text-xl mb-6"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
        >
          Top Videos
          <span className="ml-2 text-sm font-normal" style={{ color: 'var(--text-muted)' }}>
            ({topVideos.length})
          </span>
        </h2>

        {topVideos.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No videos indexed yet for this channel.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {topVideos.map((v) => (
              <VideoCard
                key={v.id}
                video={{
                  id: v.id,
                  youtubeVideoId: v.youtubeVideoId,
                  channelId: v.channelId,
                  playlistId: v.playlistId,
                  title: v.title,
                  description: v.description,
                  thumbnailUrl: v.thumbnailUrl,
                  publishedAt: v.publishedAt,
                  durationSeconds: v.durationSeconds,
                  viewCount: v.viewCount,
                  likeCount: v.likeCount,
                  contentType: v.contentType as VideoType['contentType'],
                  difficulty: v.difficulty as VideoType['difficulty'],
                  aiSummary: v.aiSummary,
                  aiTopics: v.aiTopics ?? [],
                  transcriptStatus: v.transcriptStatus as VideoType['transcriptStatus'],
                  contentSource: 'youtube',
                  lastSyncedAt: v.lastSyncedAt,
                  channel: {
                    id: channel.id,
                    youtubeChannelId: channel.youtubeChannelId,
                    name: channel.name,
                    description: channel.description,
                    subscriberCount: channel.subscriberCount,
                    videoCount: channel.videoCount,
                    thumbnailUrl: channel.thumbnailUrl,
                    contentSource: 'youtube',
                    lastSyncedAt: channel.lastSyncedAt,
                  },
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
