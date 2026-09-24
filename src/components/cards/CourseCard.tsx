'use client';

import Link from 'next/link';
import Image from 'next/image';
import { GraduationCap, Clock, Video, ChevronRight } from 'lucide-react';
import { cn, formatDuration, getDifficultyColor, formatCount } from '@/lib/utils';
import type { Playlist } from '@/types';

interface CourseCardProps {
  course: Playlist;
  className?: string;
}

export function CourseCard({ course, className }: CourseCardProps) {
  const duration = formatDuration(course.estimatedDurationSeconds ?? undefined);
  const difficultyClass = getDifficultyColor(course.difficulty);
  const subscriberCount = formatCount(course.channel?.subscriberCount ?? undefined);

  // Generate a deterministic gradient for courses without a thumbnail
  const gradientIndex = (course.id.charCodeAt(0) ?? 0) % 6;
  const gradients = [
    'linear-gradient(135deg, #667eea, #764ba2)',
    'linear-gradient(135deg, #f093fb, #f5576c)',
    'linear-gradient(135deg, #4facfe, #00f2fe)',
    'linear-gradient(135deg, #43e97b, #38f9d7)',
    'linear-gradient(135deg, #fa709a, #fee140)',
    'linear-gradient(135deg, #a18cd1, #fbc2eb)',
  ];

  return (
    <Link
      href={`/courses/${course.id}`}
      className={cn('glass-card group flex flex-col overflow-hidden', className)}
      style={{ textDecoration: 'none' }}
    >
      {/* Header banner */}
      <div
        className="relative flex items-center justify-center"
        style={{ height: 100, background: gradients[gradientIndex] }}
      >
        <div
          className="flex items-center justify-center rounded-xl"
          style={{
            width: 52,
            height: 52,
            background: 'rgba(255,255,255,0.2)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <GraduationCap size={28} color="white" strokeWidth={2} />
        </div>

        {/* Course confidence badge */}
        {course.courseConfidence && course.courseConfidence >= 0.8 && (
          <div
            className="absolute top-2 right-2 tag"
            style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}
          >
            ✓ Verified Course
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        {/* Title */}
        <h3
          className="line-clamp-2 font-semibold text-sm leading-snug group-hover:text-indigo-300 transition-colors"
          style={{ color: 'var(--text-primary)' }}
        >
          {course.title}
        </h3>

        {/* Channel */}
        {course.channel && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium truncate" style={{ color: 'var(--text-secondary)' }}>
              {course.channel.name}
            </span>
            {subscriberCount && (
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                · {subscriberCount} subs
              </span>
            )}
          </div>
        )}

        {/* Stats row */}
        <div className="flex items-center gap-3 flex-wrap mt-auto pt-2" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          {course.videoCount && (
            <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
              <Video size={11} />
              {course.videoCount} videos
            </span>
          )}
          {duration && (
            <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
              <Clock size={11} />
              {duration}
            </span>
          )}
          {course.difficulty !== 'unknown' && (
            <span className={cn('tag text-xs ml-auto', difficultyClass)}>
              {course.difficulty}
            </span>
          )}
        </div>
      </div>

      {/* CTA row */}
      <div
        className="flex items-center justify-between px-4 py-2.5 text-xs font-medium transition-colors"
        style={{
          borderTop: '1px solid var(--border-subtle)',
          color: 'var(--brand-primary)',
        }}
      >
        <span>Start learning</span>
        <ChevronRight size={14} className="transition-transform group-hover:translate-x-1" />
      </div>
    </Link>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

export function CourseCardSkeleton() {
  return (
    <div className="glass-card overflow-hidden">
      <div className="skeleton" style={{ height: 100 }} />
      <div className="p-4 space-y-3">
        <div className="skeleton h-4 rounded" style={{ width: '85%' }} />
        <div className="skeleton h-4 rounded" style={{ width: '65%' }} />
        <div className="skeleton h-3 rounded" style={{ width: '50%' }} />
      </div>
    </div>
  );
}
