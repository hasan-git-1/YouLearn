/** Utility: merge Tailwind class names safely */
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format large numbers: 1200000 → "1.2M", 15000 → "15K" */
export function formatCount(n: number | null | undefined): string {
  if (n == null) return '';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return n.toString();
}

/** Format seconds to "1h 23m" or "45m" or "2h" */
export function formatDuration(seconds: number | null | undefined): string {
  if (seconds == null) return '';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  if (m > 0 && s > 0) return `${m}m ${s}s`;
  if (m > 0) return `${m}m`;
  return `${s}s`;
}

/** Format date to relative string: "2 days ago", "3 months ago" */
export function formatRelativeDate(date: Date | string | null | undefined): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 1) return 'today';
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
  return `${Math.floor(diffDays / 365)}y ago`;
}

/** Get YouTube video embed URL */
export function getYouTubeEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`;
}

/** Get YouTube watch URL */
export function getYouTubeWatchUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

/** Get YouTube channel URL */
export function getYouTubeChannelUrl(channelId: string): string {
  return `https://www.youtube.com/channel/${channelId}`;
}

/** Get YouTube playlist URL */
export function getYouTubePlaylistUrl(playlistId: string): string {
  return `https://www.youtube.com/playlist?list=${playlistId}`;
}

/** Difficulty badge color */
export function getDifficultyColor(difficulty: string): string {
  switch (difficulty) {
    case 'beginner': return 'text-emerald-400 bg-emerald-400/10';
    case 'intermediate': return 'text-amber-400 bg-amber-400/10';
    case 'advanced': return 'text-rose-400 bg-rose-400/10';
    default: return 'text-slate-400 bg-slate-400/10';
  }
}

/** Content type display name */
export function getContentTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    course: 'Course',
    podcast: 'Podcast',
    video: 'Video',
    short: 'Short',
    lecture: 'Lecture',
    interview: 'Interview',
  };
  return labels[type] ?? type;
}
