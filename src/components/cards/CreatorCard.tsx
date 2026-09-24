'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Users, Video } from 'lucide-react';
import { cn, formatCount } from '@/lib/utils';
import type { Channel } from '@/types';

interface CreatorCardProps {
  channel: Channel;
  className?: string;
}

export function CreatorCard({ channel, className }: CreatorCardProps) {
  const subscribers = formatCount(channel.subscriberCount ?? undefined);
  const videoCount = formatCount(channel.videoCount ?? undefined);

  // Initials fallback
  const initials = channel.name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');

  return (
    <Link
      href={`/channels/${channel.id}`}
      className={cn('glass-card group flex items-center gap-4 p-4', className)}
      style={{ textDecoration: 'none' }}
    >
      {/* Avatar */}
      <div
        className="relative flex-shrink-0 rounded-full overflow-hidden"
        style={{
          width: 56,
          height: 56,
          background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))',
        }}
      >
        {channel.thumbnailUrl ? (
          <Image
            src={channel.thumbnailUrl}
            alt={channel.name}
            fill
            className="object-cover"
            sizes="56px"
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center font-bold text-white text-lg">
            {initials}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3
          className="font-semibold text-sm truncate mb-1 group-hover:text-indigo-300 transition-colors"
          style={{ color: 'var(--text-primary)' }}
        >
          {channel.name}
        </h3>

        <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
          {subscribers && (
            <span className="flex items-center gap-1">
              <Users size={11} />
              {subscribers} subs
            </span>
          )}
          {videoCount && (
            <span className="flex items-center gap-1">
              <Video size={11} />
              {videoCount} videos
            </span>
          )}
        </div>

        {/* Description snippet */}
        {channel.description && (
          <p className="line-clamp-1 text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            {channel.description}
          </p>
        )}
      </div>

      {/* Arrow */}
      <div
        className="flex-shrink-0 flex items-center justify-center rounded-lg transition-all group-hover:scale-110"
        style={{
          width: 32,
          height: 32,
          background: 'var(--bg-elevated)',
          color: 'var(--brand-primary)',
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M7 17L17 7M17 7H7M17 7v10" />
        </svg>
      </div>
    </Link>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

export function CreatorCardSkeleton() {
  return (
    <div className="glass-card flex items-center gap-4 p-4">
      <div className="skeleton rounded-full flex-shrink-0" style={{ width: 56, height: 56 }} />
      <div className="flex-1 space-y-2">
        <div className="skeleton h-4 rounded" style={{ width: '60%' }} />
        <div className="skeleton h-3 rounded" style={{ width: '40%' }} />
      </div>
    </div>
  );
}
