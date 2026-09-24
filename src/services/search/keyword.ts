/**
 * Tubiq — Keyword Search Service (Phase 1B)
 *
 * Full-text search against Postgres using the `search_vector` tsvector column
 * (GIN index) created in the migration. Covers title (weight A) + description (weight B).
 *
 * Returns results grouped into the 5 categories the frontend needs.
 * Phase 2 will add semantic (pgvector) search alongside this.
 *
 * Design decision: we search videos by full-text, then join channel/playlist data.
 * Courses are playlists marked is_course=true, linked via video_topics → topics.
 */

import { db } from '@/db';
import { videos, channels, playlists, videoTopics, topics } from '@/db/schema';
import { eq, and, sql, inArray, isNotNull } from 'drizzle-orm';
import type { SearchResultCategories, ContentType, Difficulty } from '@/types';
import { validateContentType, validateDifficulty } from '@/services/classification/rules';

export interface KeywordSearchOptions {
  q: string;
  limit?: number;          // results per category; default 12
  topicSlug?: string;      // filter to a specific topic
}

/**
 * Performs full-text keyword search against the indexed video content.
 * Returns { courses, videos, podcasts, shorts, creators } with real data.
 *
 * Returns empty arrays (not null) for each category — callers check .length
 * to detect a cold-start situation.
 */
export async function keywordSearch(
  options: KeywordSearchOptions
): Promise<SearchResultCategories & { totalResults: number }> {
  const { q, limit = 12 } = options;

  // Sanitize query for tsvector — replace special chars, trim whitespace
  const sanitizedQ = q.trim().replace(/[^\w\s]/g, ' ').trim();
  if (!sanitizedQ) {
    return { courses: [], videos: [], podcasts: [], shorts: [], creators: [], totalResults: 0 };
  }

  // Build tsquery: "full stack development" → 'full:* & stack:* & development:*'
  const tsQuery = sanitizedQ
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => `${word}:*`)
    .join(' & ');

  // ── Search videos by full-text ────────────────────────────────────────────
  const videoRows = await db.execute(sql`
    SELECT
      v.id,
      v.youtube_video_id,
      v.channel_id,
      v.playlist_id,
      v.title,
      v.description,
      v.thumbnail_url,
      v.published_at,
      v.duration_seconds,
      v.view_count,
      v.like_count,
      v.content_type,
      v.difficulty,
      v.ai_summary,
      v.ai_topics,
      c.id as c_id,
      c.youtube_channel_id,
      c.name as channel_name,
      c.thumbnail_url as channel_thumbnail,
      c.subscriber_count,
      ts_rank(v.search_vector, to_tsquery('english', ${tsQuery})) AS rank
    FROM videos v
    LEFT JOIN channels c ON c.id = v.channel_id
    WHERE v.search_vector @@ to_tsquery('english', ${tsQuery})
    ORDER BY rank DESC, v.view_count DESC NULLS LAST
    LIMIT ${limit * 5}
  `);

  const allVideoRows = (videoRows.rows ?? []) as Array<Record<string, unknown>>;

  // ── Separate by content_type ──────────────────────────────────────────────
  const videoResults = allVideoRows
    .filter((r) => r.content_type === 'video' || r.content_type === 'lecture' || r.content_type === 'interview')
    .slice(0, limit)
    .map(normalizeVideoRow);

  const podcastResults = allVideoRows
    .filter((r) => r.content_type === 'podcast')
    .slice(0, limit)
    .map(normalizeVideoRow);

  const shortResults = allVideoRows
    .filter((r) => r.content_type === 'short')
    .slice(0, limit)
    .map(normalizeVideoRow);

  // ── Search courses (playlists marked is_course=true) ─────────────────────
  const courseRows = await db.execute(sql`
    SELECT
      p.id,
      p.youtube_playlist_id,
      p.channel_id,
      p.title,
      p.video_count,
      p.is_course,
      p.course_confidence,
      p.difficulty,
      p.estimated_duration_seconds,
      c.id as c_id,
      c.name as channel_name,
      c.thumbnail_url as channel_thumbnail,
      c.subscriber_count,
      -- Use playlist title as the full-text target
      ts_rank(
        setweight(to_tsvector('english', coalesce(p.title, '')), 'A'),
        to_tsquery('english', ${tsQuery})
      ) AS rank
    FROM playlists p
    LEFT JOIN channels c ON c.id = p.channel_id
    WHERE
      p.is_course = true
      AND setweight(to_tsvector('english', coalesce(p.title, '')), 'A') @@ to_tsquery('english', ${tsQuery})
    ORDER BY rank DESC, p.video_count DESC NULLS LAST
    LIMIT ${limit}
  `);

  const courseResults = ((courseRows.rows ?? []) as Array<Record<string, unknown>>).map(normalizeCourseRow);

  // ── Search creators (channels) ────────────────────────────────────────────
  // Find channels that appear frequently in relevant videos
  const channelIdCounts = new Map<string, number>();
  for (const row of allVideoRows) {
    const chId = row.c_id as string;
    if (chId) {
      channelIdCounts.set(chId, (channelIdCounts.get(chId) ?? 0) + 1);
    }
  }

  // Sort channels by appearance frequency
  const topChannelIds = [...channelIdCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id]) => id);

  let creatorResults: SearchResultCategories['creators'] = [];

  if (topChannelIds.length > 0) {
    const channelRows = await db
      .select()
      .from(channels)
      .where(inArray(channels.id, topChannelIds))
      .limit(limit);

    // Sort back to frequency order
    const channelMap = new Map(channelRows.map((c) => [c.id, c]));
    creatorResults = topChannelIds
      .map((id) => channelMap.get(id))
      .filter(Boolean)
      .map((c) => ({
        id: c!.id,
        youtubeChannelId: c!.youtubeChannelId,
        name: c!.name,
        description: c!.description,
        subscriberCount: c!.subscriberCount,
        videoCount: c!.videoCount,
        thumbnailUrl: c!.thumbnailUrl,
        contentSource: 'youtube' as const,
        lastSyncedAt: c!.lastSyncedAt,
      }));
  }

  const totalResults =
    videoResults.length +
    podcastResults.length +
    shortResults.length +
    courseResults.length +
    creatorResults.length;

  return {
    courses: courseResults,
    videos: videoResults,
    podcasts: podcastResults,
    shorts: shortResults,
    creators: creatorResults,
    totalResults,
  };
}

// ─── Row normalizers ──────────────────────────────────────────────────────────

function normalizeVideoRow(row: Record<string, unknown>) {
  return {
    id: row.id as string,
    youtubeVideoId: row.youtube_video_id as string,
    channelId: row.channel_id as string | null,
    playlistId: row.playlist_id as string | null,
    title: row.title as string,
    description: row.description as string | null,
    thumbnailUrl: row.thumbnail_url as string | null,
    publishedAt: row.published_at ? new Date(row.published_at as string) : null,
    durationSeconds: row.duration_seconds as number | null,
    viewCount: row.view_count as number | null,
    likeCount: row.like_count as number | null,
    contentType: validateContentType(row.content_type as string),
    difficulty: validateDifficulty(row.difficulty as string),
    aiSummary: row.ai_summary as string | null,
    aiTopics: (row.ai_topics as string[]) ?? [],
    transcriptStatus: 'none' as const,
    contentSource: 'youtube' as const,
    lastSyncedAt: null,
    channel: row.c_id
      ? {
          id: row.c_id as string,
          youtubeChannelId: row.youtube_channel_id as string,
          name: row.channel_name as string,
          description: null,
          subscriberCount: row.subscriber_count as number | null,
          videoCount: null,
          thumbnailUrl: row.channel_thumbnail as string | null,
          contentSource: 'youtube' as const,
          lastSyncedAt: null,
        }
      : undefined,
  };
}

function normalizeCourseRow(row: Record<string, unknown>) {
  return {
    id: row.id as string,
    youtubePlaylistId: row.youtube_playlist_id as string,
    channelId: row.channel_id as string | null,
    title: row.title as string,
    videoCount: row.video_count as number | null,
    isCourse: row.is_course as boolean,
    courseConfidence: row.course_confidence as number | null,
    difficulty: validateDifficulty(row.difficulty as string),
    estimatedDurationSeconds: row.estimated_duration_seconds as number | null,
    contentSource: 'youtube' as const,
    lastSyncedAt: null,
    channel: row.c_id
      ? {
          id: row.c_id as string,
          youtubeChannelId: '',
          name: row.channel_name as string,
          description: null,
          subscriberCount: row.subscriber_count as number | null,
          videoCount: null,
          thumbnailUrl: row.channel_thumbnail as string | null,
          contentSource: 'youtube' as const,
          lastSyncedAt: null,
        }
      : undefined,
  };
}
