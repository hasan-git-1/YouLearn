/**
 * YouLearn — Rule-based content classifier (Phase 1A)
 *
 * Implements the classification rules from spec section 6, Step 1.
 * This is a pure function — no DB calls, no AI, no side effects.
 * Takes normalized video/playlist data and returns classification results.
 *
 * Phase 2 will add an LLM fallback for low-confidence rows only.
 * The classifier outputs are validated against enums before any DB write.
 */

import type {
  ContentType,
  Difficulty,
  ClassificationResult,
  RawYouTubeVideo,
  RawYouTubePlaylist,
} from '@/types';
import { parseDurationToSeconds } from '@/services/youtube/client';

// ─── Known podcast channel name patterns ─────────────────────────────────────

const PODCAST_CHANNEL_PATTERNS = [
  /podcast/i,
  /show/i,
  /talk/i,
  /interview/i,
  /conversation/i,
  /episode/i,
];

const PODCAST_TITLE_PATTERNS = [
  /podcast/i,
  /interview/i,
  /conversation with/i,
  /episode \d+/i,
  /ep\.\s?\d+/i,
  /ep\d+/i,
  /\| ep /i,
  /we talk/i,
  /on the show/i,
];

// ─── Course / sequential playlist patterns ────────────────────────────────────

/** Patterns that indicate a video is part of a course sequence */
const COURSE_TITLE_PATTERNS = [
  /\bpart\s+\d+\b/i,            // "Part 1", "Part 12"
  /\bpart\s+[ivxlc]+\b/i,       // "Part IV"
  /\blesson\s+\d+\b/i,          // "Lesson 3"
  /\bchapter\s+\d+\b/i,         // "Chapter 5"
  /\bmodule\s+\d+\b/i,          // "Module 2"
  /\blecture\s+\d+\b/i,         // "Lecture 10"
  /\bsession\s+\d+\b/i,         // "Session 4"
  /^#\d+\s/,                    // "#1 Introduction"
  /\b\d+\.\s/,                  // "1. Getting Started"
  /\[?\d+\/\d+\]?/,             // "[3/12]" or "3/12"
  /tutorial\s+\d+/i,            // "Tutorial 2"
  /ep(isode)?\s*\d+/i,          // "Episode 3" but only in context
];

/** 
 * Check if a playlist title looks like a course/series
 * (as opposed to a random collection or shorts playlist)
 */
const COURSE_PLAYLIST_PATTERNS = [
  /course/i,
  /tutorial/i,
  /bootcamp/i,
  /full\s+series/i,
  /complete\s+guide/i,
  /learn\s+\w+/i,
  /\w+\s+fundamentals/i,
  /masterclass/i,
  /crash\s+course/i,
  /beginner\s+to\s+advanced/i,
  /from\s+zero\s+to/i,
  /from\s+scratch/i,
  /step\s+by\s+step/i,
];

// ─── Difficulty signals ───────────────────────────────────────────────────────

const BEGINNER_PATTERNS = [
  /beginner/i, /for\s+beginners/i, /getting\s+started/i,
  /introduction/i, /intro\s+to/i, /basics/i, /fundamentals/i,
  /from\s+scratch/i, /zero\s+to/i, /crash\s+course/i,
];

const ADVANCED_PATTERNS = [
  /advanced/i, /expert/i, /deep\s+dive/i, /deep\s+understanding/i,
  /internals/i, /architecture/i, /production/i, /at\s+scale/i,
  /under\s+the\s+hood/i, /optimization/i, /performance/i,
];

// ─── Shorts threshold ─────────────────────────────────────────────────────────

const SHORTS_MAX_SECONDS = 90; // YouTube Shorts are ≤ 60s but we use 90s to be safe

// ─── Main classifier ──────────────────────────────────────────────────────────

/**
 * Classifies a single video's content type using rule-based heuristics.
 *
 * @param video  - Raw YouTube video data
 * @param playlist - Optional: the playlist this video belongs to
 * @param playlistVideoCount - Total videos in the playlist (for course detection)
 * @param siblingTitles - Optional: other video titles in the same playlist
 *
 * @returns ClassificationResult with content_type, confidence, and difficulty
 */
export function classifyVideo(
  video: RawYouTubeVideo,
  playlist?: RawYouTubePlaylist | null,
  playlistVideoCount?: number,
  siblingTitles?: string[]
): ClassificationResult {
  const durationSec = parseDurationToSeconds(video.duration);
  const title = video.title ?? '';
  const description = video.description ?? '';
  const channelTitle = video.channelTitle ?? '';

  // ── Rule 1: Short-form (YouTube Shorts) ──────────────────────────────────
  if (durationSec !== null && durationSec <= SHORTS_MAX_SECONDS) {
    return {
      contentType: 'short',
      confidence: 0.95,
      isCourse: false,
      courseConfidence: 0,
      difficulty: 'unknown',
    };
  }

  // ── Rule 2: Podcast/Interview ─────────────────────────────────────────────
  const isPodcastTitle = PODCAST_TITLE_PATTERNS.some((p) => p.test(title));
  const isPodcastChannel = PODCAST_CHANNEL_PATTERNS.some((p) =>
    p.test(channelTitle)
  );
  const isPodcastDescription =
    /podcast|episode|host|guest|interview/i.test(description);

  if (
    (durationSec === null || durationSec > 20 * 60) && // > 20 minutes
    (isPodcastTitle ||
      (isPodcastChannel && isPodcastDescription) ||
      (isPodcastTitle && isPodcastDescription))
  ) {
    return {
      contentType: 'podcast',
      confidence: isPodcastTitle && isPodcastChannel ? 0.9 : 0.7,
      isCourse: false,
      courseConfidence: 0,
      difficulty: inferDifficulty(title, description),
    };
  }

  // ── Rule 3: Part of a course playlist ────────────────────────────────────
  if (playlist && playlistVideoCount !== undefined) {
    const courseResult = classifyCoursePlaylist(
      playlist,
      playlistVideoCount,
      siblingTitles ?? []
    );

    if (courseResult.isCourse && courseResult.courseConfidence >= 0.7) {
      return {
        contentType: 'course',
        confidence: courseResult.courseConfidence,
        isCourse: true,
        courseConfidence: courseResult.courseConfidence,
        difficulty: inferDifficulty(title, description),
      };
    }
  }

  // ── Rule 4: Lecture (long standalone educational) ─────────────────────────
  const isLecture =
    (durationSec !== null && durationSec > 45 * 60) &&
    /lecture|class|university|professor|mit|stanford|course/i.test(
      title + ' ' + channelTitle
    );

  if (isLecture) {
    return {
      contentType: 'lecture',
      confidence: 0.75,
      isCourse: false,
      courseConfidence: 0,
      difficulty: inferDifficulty(title, description),
    };
  }

  // ── Default: video (low confidence — LLM fallback in Phase 2) ────────────
  return {
    contentType: 'video',
    confidence: 0.5,
    isCourse: false,
    courseConfidence: 0,
    difficulty: inferDifficulty(title, description),
  };
}

/**
 * Classifies a playlist as a course based on structure signals.
 * Spec rule: 10+ videos in sequence with consistent pattern = course.
 */
export function classifyCoursePlaylist(
  playlist: RawYouTubePlaylist,
  videoCount: number,
  siblingTitles: string[]
): { isCourse: boolean; courseConfidence: number } {
  if (videoCount < 5) {
    return { isCourse: false, courseConfidence: 0.1 };
  }

  let score = 0;

  // Playlist title looks like a course?
  if (COURSE_PLAYLIST_PATTERNS.some((p) => p.test(playlist.title))) {
    score += 0.4;
  }

  // 10+ videos is a strong signal
  if (videoCount >= 10) score += 0.2;
  if (videoCount >= 20) score += 0.1;

  // Videos in the playlist have sequential title patterns
  if (siblingTitles.length >= 3) {
    const sequentialCount = siblingTitles.filter((t) =>
      COURSE_TITLE_PATTERNS.some((p) => p.test(t))
    ).length;
    const sequentialRatio = sequentialCount / siblingTitles.length;
    score += sequentialRatio * 0.4; // up to 0.4 from title patterns
  }

  return {
    isCourse: score >= 0.5,
    courseConfidence: Math.min(score, 1.0),
  };
}

/**
 * Infers difficulty from title and description text.
 * Returns 'unknown' when no signal is found — do NOT guess.
 */
export function inferDifficulty(
  title: string,
  description: string
): Difficulty {
  const text = `${title} ${description}`;

  if (BEGINNER_PATTERNS.some((p) => p.test(text))) return 'beginner';
  if (ADVANCED_PATTERNS.some((p) => p.test(text))) return 'advanced';

  // Intermediate is implicit — only flag it if explicitly stated
  if (/intermediate|mid-level|mid level/i.test(text)) return 'intermediate';

  return 'unknown';
}

/**
 * Validates a content_type string against the allowed enum.
 * Always call this before writing AI-generated classification to DB.
 */
export const VALID_CONTENT_TYPES = new Set<ContentType>([
  'course', 'podcast', 'video', 'short', 'interview', 'lecture',
]);

export const VALID_DIFFICULTIES = new Set<Difficulty>([
  'beginner', 'intermediate', 'advanced', 'unknown',
]);

export function validateContentType(value: string): ContentType {
  if (VALID_CONTENT_TYPES.has(value as ContentType)) {
    return value as ContentType;
  }
  console.warn(`[classifier] Invalid content_type "${value}" — defaulting to 'video'`);
  return 'video';
}

export function validateDifficulty(value: string): Difficulty {
  if (VALID_DIFFICULTIES.has(value as Difficulty)) {
    return value as Difficulty;
  }
  console.warn(`[classifier] Invalid difficulty "${value}" — defaulting to 'unknown'`);
  return 'unknown';
}
