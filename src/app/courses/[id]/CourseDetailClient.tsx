'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  GraduationCap,
  ChevronLeft,
  ExternalLink,
  Play,
  CheckCircle2,
  Bookmark,
} from 'lucide-react';
import { useProgress } from '@/context/ProgressContext';
import {
  formatDuration,
  getDifficultyColor,
  getYouTubePlaylistUrl,
  cn,
} from '@/lib/utils';
import type { Playlist, Channel } from '@/types';

interface PlaylistItemView {
  position: number;
  videoId: string;
  title: string;
  thumbnailUrl: string | null;
  durationSeconds: number | null;
  viewCount: number | null;
  youtubeVideoId: string;
  difficulty: string;
  contentType: string;
}

interface CourseDetailClientProps {
  playlist: Playlist;
  channel: Channel | null;
  items: PlaylistItemView[];
}

export function CourseDetailClient({ playlist, channel, items }: CourseDetailClientProps) {
  const { isCompleted, toggleCompleted, isSaved, toggleSaved } = useProgress();

  const saved = isSaved(playlist.id);
  const completedCount = items.filter((item) => isCompleted(item.videoId)).length;
  const progressPercent = items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0;

  const totalDuration = formatDuration(playlist.estimatedDurationSeconds ?? undefined);
  const difficultyClass = getDifficultyColor(playlist.difficulty);
  const ytUrl = getYouTubePlaylistUrl(playlist.youtubePlaylistId);

  // First uncompleted item to continue
  const firstUncompleted = items.find((item) => !isCompleted(item.videoId)) ?? items[0];

  const gradientIndex = (playlist.id.charCodeAt(0) ?? 0) % 6;
  const gradients = [
    'linear-gradient(135deg, #667eea, #764ba2)',
    'linear-gradient(135deg, #f093fb, #f5576c)',
    'linear-gradient(135deg, #4facfe, #00f2fe)',
    'linear-gradient(135deg, #43e97b, #38f9d7)',
    'linear-gradient(135deg, #fa709a, #fee140)',
    'linear-gradient(135deg, #a18cd1, #fbc2eb)',
  ];

  return (
    <div style={{ minHeight: '100dvh' }}>
      {/* Back navigation */}
      <div className="px-4 pt-6" style={{ maxWidth: 1100, margin: '0 auto' }}>
        <button
          onClick={() => history.back()}
          className="btn-ghost py-2 px-3 text-xs flex items-center gap-1.5 cursor-pointer"
          style={{ width: 'fit-content' }}
        >
          <ChevronLeft size={14} /> Back
        </button>
      </div>

      <div className="px-4 pb-16" style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-4">
          {/* Course Sidebar / Info */}
          <div className="lg:col-span-1 order-first lg:order-last">
            <div
              className="sticky top-24 overflow-hidden rounded-2xl"
              style={{
                background: 'rgba(15, 18, 35, 0.85)',
                border: '1px solid var(--border-subtle)',
                backdropFilter: 'blur(16px)',
              }}
            >
              {/* Banner */}
              <div
                className="flex items-center justify-center relative"
                style={{ height: 130, background: gradients[gradientIndex] }}
              >
                <div
                  className="flex items-center justify-center rounded-2xl"
                  style={{ width: 56, height: 56, background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)' }}
                >
                  <GraduationCap size={28} color="white" />
                </div>
              </div>

              <div className="p-5 space-y-4">
                {/* Progress Bar */}
                {items.length > 0 && (
                  <div
                    className="p-3.5 rounded-xl space-y-2"
                    style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                    }}
                  >
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-gray-300">Course Progress</span>
                      <span className="text-indigo-400">{progressPercent}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${progressPercent}%`,
                          background: 'linear-gradient(90deg, #6366f1, #10b981)',
                        }}
                      />
                    </div>
                    <p className="text-[11px] text-gray-400">
                      {completedCount} of {items.length} lessons completed
                    </p>
                  </div>
                )}

                {/* Tags */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="tag tag-brand text-xs">Course</span>
                  {playlist.difficulty !== 'unknown' && (
                    <span className={cn('tag text-xs', difficultyClass)}>
                      {playlist.difficulty}
                    </span>
                  )}
                </div>

                <h1
                  className="font-bold text-lg text-white"
                  style={{ fontFamily: 'var(--font-display)', lineHeight: 1.3 }}
                >
                  {playlist.title}
                </h1>

                {/* Channel */}
                {channel && (
                  <Link
                    href={`/channels/${channel.id}`}
                    className="flex items-center gap-2.5 p-2 rounded-xl text-xs text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    {channel.thumbnailUrl && (
                      <Image
                        src={channel.thumbnailUrl}
                        alt={channel.name}
                        width={24}
                        height={24}
                        className="rounded-full"
                        unoptimized
                      />
                    )}
                    <span className="font-medium truncate">{channel.name}</span>
                  </Link>
                )}

                {/* Actions */}
                <div className="space-y-2 pt-2">
                  {firstUncompleted && (
                    <Link
                      href={`/videos/${firstUncompleted.videoId}`}
                      className="btn-primary w-full py-2.5 text-xs font-semibold flex items-center justify-center gap-2"
                      style={{ boxShadow: '0 4px 16px rgba(99, 102, 241, 0.4)' }}
                    >
                      <Play size={13} fill="white" />
                      <span>{completedCount === 0 ? 'Start Course' : 'Continue Learning'}</span>
                    </Link>
                  )}

                  <button
                    onClick={() => toggleSaved(playlist.id, 'playlist')}
                    className={cn(
                      'w-full py-2 px-3 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer',
                      saved
                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                        : 'btn-ghost text-gray-300'
                    )}
                  >
                    <Bookmark size={14} className={saved ? 'text-indigo-400 fill-indigo-400' : 'text-gray-400'} />
                    <span>{saved ? 'Saved in Library' : 'Save Course'}</span>
                  </button>

                  <a
                    href={ytUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-ghost w-full py-2 text-xs flex items-center justify-center gap-1.5"
                  >
                    <ExternalLink size={13} />
                    View on YouTube
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Syllabus / Lessons List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2
                  className="text-xl font-bold text-white tracking-tight"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  Course Syllabus
                </h2>
                <p className="text-xs text-gray-400">
                  {items.length} lessons · {totalDuration ?? 'Self-paced'}
                </p>
              </div>
            </div>

            <div className="space-y-2.5">
              {items.map((item, index) => {
                const itemCompleted = isCompleted(item.videoId);
                const duration = formatDuration(item.durationSeconds ?? undefined);

                return (
                  <div
                    key={item.videoId}
                    className={cn(
                      'flex items-center gap-3 p-3.5 rounded-2xl transition-all glass-card',
                      itemCompleted
                        ? 'border-emerald-500/20 bg-emerald-950/10'
                        : 'hover:border-indigo-500/30'
                    )}
                  >
                    {/* Completion Checkbox Button */}
                    <button
                      onClick={() => toggleCompleted(item.videoId)}
                      className="shrink-0 p-1 text-gray-400 hover:text-emerald-400 transition-colors cursor-pointer"
                      aria-label={`Toggle lesson ${index + 1} completion`}
                    >
                      <CheckCircle2
                        size={20}
                        className={itemCompleted ? 'text-emerald-400 fill-emerald-400/20' : 'text-gray-500'}
                      />
                    </button>

                    {/* Lesson Index */}
                    <span className="text-xs font-mono text-gray-400 w-5 shrink-0 text-center">
                      {index + 1}
                    </span>

                    {/* Thumbnail preview */}
                    {item.thumbnailUrl && (
                      <div
                        className="relative w-16 h-10 rounded-lg overflow-hidden shrink-0 hidden sm:block"
                        style={{ background: 'var(--bg-elevated)' }}
                      >
                        <Image
                          src={item.thumbnailUrl}
                          alt={item.title}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    )}

                    {/* Title & Duration */}
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/videos/${item.videoId}`}
                        className="block text-xs sm:text-sm font-medium text-gray-200 hover:text-indigo-400 transition-colors truncate"
                      >
                        {item.title}
                      </Link>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-gray-400">
                        {duration && <span>{duration}</span>}
                        {item.difficulty && (
                          <span className="capitalize text-gray-400">· {item.difficulty}</span>
                        )}
                      </div>
                    </div>

                    {/* Watch Play Button */}
                    <Link
                      href={`/videos/${item.videoId}`}
                      className="shrink-0 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
                      aria-label="Play lesson"
                    >
                      <Play size={13} fill="currentColor" />
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
