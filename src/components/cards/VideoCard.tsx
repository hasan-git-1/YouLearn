'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Play, Clock, Eye, Calendar } from 'lucide-react';
import { cn, formatCount, formatDuration, formatRelativeDate, getDifficultyColor, getContentTypeLabel } from '@/lib/utils';
import type { Video } from '@/types';

interface VideoCardProps {
  video: Video;
  className?: string;
}

export function VideoCard({ video, className }: VideoCardProps) {
  const duration = formatDuration(video.durationSeconds);
  const views = formatCount(video.viewCount);
  const date = formatRelativeDate(video.publishedAt);
  const difficultyClass = getDifficultyColor(video.difficulty);
  const typeLabel = getContentTypeLabel(video.contentType);

  return (
    <Link
      href={`/videos/${video.id}`}
      className={cn('glass-card group block overflow-hidden', className)}
      style={{ textDecoration: 'none' }}
    >
      {/* Thumbnail */}
      <div className="relative overflow-hidden" style={{ aspectRatio: '16/9', background: 'var(--bg-elevated)' }}>
        {video.thumbnailUrl ? (
          <Image
            src={video.thumbnailUrl}
            alt={video.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'var(--bg-card)' }}>
            <Play size={32} style={{ color: 'var(--text-muted)' }} />
          </div>
        )}

        {/* Play overlay on hover */}
        <div
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          style={{ background: 'rgba(0,0,0,0.4)' }}
        >
          <div
            className="flex items-center justify-center rounded-full"
            style={{
              width: 48,
              height: 48,
              background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))',
              boxShadow: '0 4px 20px rgba(99,102,241,0.5)',
            }}
          >
            <Play size={20} fill="white" color="white" />
          </div>
        </div>

        {/* Duration badge */}
        {duration && (
          <div
            className="absolute bottom-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium"
            style={{ background: 'rgba(0,0,0,0.8)', color: '#e2e8f0' }}
          >
            <Clock size={10} />
            {duration}
          </div>
        )}

        {/* Content type tag (non-default) */}
        {video.contentType !== 'video' && (
          <div className="absolute top-2 left-2">
            <span className={cn(
              'tag text-xs',
              video.contentType === 'podcast' ? 'tag-podcast' :
              video.contentType === 'short'   ? 'tag-short' :
              'tag-brand'
            )}>
              {typeLabel}
            </span>
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="p-3">
        {/* Title */}
        <h3
          className="line-clamp-2 font-semibold text-sm mb-2 transition-colors group-hover:text-indigo-300"
          style={{ color: 'var(--text-primary)', lineHeight: 1.4 }}
        >
          {video.title}
        </h3>

        {/* Channel name */}
        {video.channel && (
          <p className="text-xs mb-2 truncate" style={{ color: 'var(--text-secondary)' }}>
            {video.channel.name}
          </p>
        )}

        {/* Meta row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
            {views && (
              <span className="flex items-center gap-1">
                <Eye size={11} />
                {views}
              </span>
            )}
            {date && (
              <span className="flex items-center gap-1">
                <Calendar size={11} />
                {date}
              </span>
            )}
          </div>

          {/* Difficulty badge */}
          {video.difficulty !== 'unknown' && (
            <span className={cn('tag text-xs', difficultyClass)}>
              {video.difficulty}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

export function VideoCardSkeleton() {
  return (
    <div className="glass-card overflow-hidden" style={{ pointerEvents: 'none' }}>
      <div className="skeleton" style={{ aspectRatio: '16/9' }} />
      <div className="p-3 space-y-2">
        <div className="skeleton h-4 rounded" style={{ width: '90%' }} />
        <div className="skeleton h-4 rounded" style={{ width: '70%' }} />
        <div className="skeleton h-3 rounded" style={{ width: '40%' }} />
      </div>
    </div>
  );
}
