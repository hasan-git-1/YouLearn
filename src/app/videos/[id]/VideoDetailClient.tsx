'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  Play, Clock, Eye, ThumbsUp, Calendar, ExternalLink,
  ChevronLeft, Users, Sparkles, CheckCircle2, Bookmark
} from 'lucide-react';
import { useProgress } from '@/context/ProgressContext';
import {
  formatDuration, formatCount, formatRelativeDate,
  getDifficultyColor, getContentTypeLabel, getYouTubeWatchUrl,
  getYouTubeEmbedUrl, cn
} from '@/lib/utils';
import type { Video, Playlist } from '@/types';

interface VideoDetailClientProps {
  video: Video;
  playlist: Playlist | null;
}

export function VideoDetailClient({ video, playlist }: VideoDetailClientProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const { isCompleted, isSaved, toggleCompleted, toggleSaved } = useProgress();

  const completed = isCompleted(video.id);
  const saved = isSaved(video.id);

  const duration = formatDuration(video.durationSeconds ?? undefined);
  const views = formatCount(video.viewCount ?? undefined);
  const likes = formatCount(video.likeCount ?? undefined);
  const date = formatRelativeDate(video.publishedAt ?? undefined);
  const difficultyClass = getDifficultyColor(video.difficulty);
  const typeLabel = getContentTypeLabel(video.contentType);
  const ytUrl = getYouTubeWatchUrl(video.youtubeVideoId);
  const embedUrl = getYouTubeEmbedUrl(video.youtubeVideoId);

  return (
    <div style={{ minHeight: '100dvh' }}>
      {/* Back navigation */}
      <div className="px-4 pt-6 pb-2" style={{ maxWidth: 1100, margin: '0 auto' }}>
        <button
          onClick={() => history.back()}
          className="flex items-center gap-2 text-sm btn-ghost py-2 px-3"
          style={{ width: 'fit-content' }}
        >
          <ChevronLeft size={16} />
          Back
        </button>
      </div>

      <div className="px-4 pb-16" style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Main content — left/full */}
          <div className="lg:col-span-2 space-y-6">

            {/* Video embed or thumbnail */}
            <div
              className="relative overflow-hidden rounded-2xl"
              style={{
                aspectRatio: '16/9',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              {isPlaying ? (
                <iframe
                  src={`${embedUrl}&autoplay=1`}
                  title={video.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                  style={{ border: 'none' }}
                />
              ) : (
                <>
                  {video.thumbnailUrl && (
                    <Image
                      src={video.thumbnailUrl}
                      alt={video.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 66vw"
                      unoptimized
                      priority
                    />
                  )}
                  {/* Play overlay */}
                  <button
                    onClick={() => setIsPlaying(true)}
                    className="absolute inset-0 flex flex-col items-center justify-center gap-4 transition-colors"
                    style={{ background: 'rgba(0,0,0,0.45)' }}
                    aria-label={`Play ${video.title}`}
                  >
                    <div
                      className="flex items-center justify-center rounded-full transition-transform hover:scale-110"
                      style={{
                        width: 80,
                        height: 80,
                        background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))',
                        boxShadow: '0 8px 32px rgba(99,102,241,0.6)',
                      }}
                    >
                      <Play size={32} fill="white" color="white" />
                    </div>
                    <span className="text-sm font-medium text-white opacity-90">
                      Play on Tubiq
                    </span>
                  </button>

                  {/* Duration badge */}
                  {duration && (
                    <div
                      className="absolute bottom-3 right-3 flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium"
                      style={{ background: 'rgba(0,0,0,0.8)', color: '#e2e8f0' }}
                    >
                      <Clock size={11} />
                      {duration}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Title & meta */}
            <div>
              {/* Tags row */}
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span className="tag tag-brand text-xs">{typeLabel}</span>
                {video.difficulty !== 'unknown' && (
                  <span className={cn('tag text-xs', difficultyClass)}>
                    {video.difficulty}
                  </span>
                )}
                {playlist && (
                  <Link href={`/courses/${playlist.id}`} className="tag tag-course text-xs" style={{ textDecoration: 'none' }}>
                    Part of: {playlist.title}
                  </Link>
                )}
              </div>

              <h1
                className="font-bold mb-4"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(1.2rem, 2.5vw, 1.6rem)',
                  color: 'var(--text-primary)',
                  lineHeight: 1.3,
                }}
              >
                {video.title}
              </h1>

              {/* Stats & actions row */}
              <div className="flex items-center justify-between flex-wrap gap-3 py-3"
                style={{ borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
                <div className="flex items-center gap-4 text-sm" style={{ color: 'var(--text-muted)' }}>
                  {views && (
                    <span className="flex items-center gap-1.5">
                      <Eye size={14} />
                      {views} views
                    </span>
                  )}
                  {likes && (
                    <span className="flex items-center gap-1.5">
                      <ThumbsUp size={14} />
                      {likes}
                    </span>
                  )}
                  {date && (
                    <span className="flex items-center gap-1.5">
                      <Calendar size={14} />
                      {date}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Mark as Completed */}
                  <button
                    onClick={() => toggleCompleted(video.id)}
                    className={cn(
                      'py-2 px-3 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer',
                      completed
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                        : 'btn-ghost text-gray-300'
                    )}
                  >
                    <CheckCircle2 size={14} className={completed ? 'text-emerald-400' : 'text-gray-400'} />
                    <span>{completed ? 'Completed' : 'Mark Watched'}</span>
                  </button>

                  {/* Bookmark / Save */}
                  <button
                    onClick={() => toggleSaved(video.id, 'video')}
                    className={cn(
                      'py-2 px-3 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer',
                      saved
                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                        : 'btn-ghost text-gray-300'
                    )}
                  >
                    <Bookmark size={14} className={saved ? 'text-indigo-400 fill-indigo-400' : 'text-gray-400'} />
                    <span>{saved ? 'Saved' : 'Save'}</span>
                  </button>

                  <a
                    href={ytUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-ghost py-2 px-3 text-xs flex items-center gap-1.5"
                  >
                    <ExternalLink size={13} />
                    YouTube
                  </a>
                </div>
              </div>

              {/* AI Key Takeaways / Summary */}
              {video.aiSummary && (
                <div
                  className="mt-5 p-4 sm:p-5 rounded-2xl relative overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.05) 100%)',
                    border: '1px solid rgba(99, 102, 241, 0.25)',
                  }}
                >
                  <div className="flex items-center gap-2 mb-2 text-indigo-400 font-semibold text-xs uppercase tracking-wider">
                    <Sparkles size={14} className="animate-pulse" />
                    <span>AI Key Takeaways</span>
                  </div>
                  <p className="text-sm leading-relaxed text-gray-200">
                    {video.aiSummary}
                  </p>
                </div>
              )}

              {/* Description */}
              {video.description && (
                <div
                  className="mt-4 p-4 rounded-xl text-sm leading-relaxed"
                  style={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-secondary)',
                    whiteSpace: 'pre-line',
                  }}
                >
                  {video.description.slice(0, 600)}
                  {video.description.length > 600 && '…'}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar — right */}
          <div className="space-y-6">
            {/* Channel card */}
            {video.channel && (
              <Link
                href={`/channels/${video.channel.id}`}
                className="glass-card flex items-center gap-4 p-4 group"
                style={{ textDecoration: 'none' }}
              >
                <div
                  className="relative flex-shrink-0 rounded-full overflow-hidden"
                  style={{
                    width: 52,
                    height: 52,
                    background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))',
                  }}
                >
                  {video.channel.thumbnailUrl && (
                    <Image
                      src={video.channel.thumbnailUrl}
                      alt={video.channel.name}
                      fill
                      className="object-cover"
                      sizes="52px"
                      unoptimized
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate group-hover:text-indigo-300 transition-colors"
                    style={{ color: 'var(--text-primary)' }}>
                    {video.channel.name}
                  </p>
                  {video.channel.subscriberCount && (
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      <Users size={11} className="inline mr-1" />
                      {formatCount(video.channel.subscriberCount)} subscribers
                    </p>
                  )}
                  <p className="text-xs mt-1" style={{ color: 'var(--brand-primary)' }}>
                    View channel →
                  </p>
                </div>
              </Link>
            )}

            {/* Playlist context */}
            {playlist && (
              <div
                className="p-4 rounded-2xl"
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
              >
                <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
                  Part of Course
                </p>
                <Link href={`/courses/${playlist.id}`} className="block group" style={{ textDecoration: 'none' }}>
                  <p className="font-semibold text-sm mb-2 group-hover:text-indigo-300 transition-colors"
                    style={{ color: 'var(--text-primary)' }}>
                    {playlist.title}
                  </p>
                  <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                    {playlist.videoCount && (
                      <span>{playlist.videoCount} videos</span>
                    )}
                    {playlist.difficulty !== 'unknown' && (
                      <span className={cn('tag', getDifficultyColor(playlist.difficulty))}>
                        {playlist.difficulty}
                      </span>
                    )}
                  </div>
                </Link>
              </div>
            )}

            {/* Topics */}
            {video.aiTopics && video.aiTopics.length > 0 && (
              <div
                className="p-4 rounded-2xl"
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
              >
                <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
                  Topics
                </p>
                <div className="flex flex-wrap gap-2">
                  {video.aiTopics.map((t) => (
                    <Link key={t} href={`/search?q=${encodeURIComponent(t)}`}
                      className="tag tag-brand text-xs" style={{ textDecoration: 'none' }}>
                      {t}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
