/**
 * Tubiq — Core Ingestion Worker
 *
 * Given a topic string, this module:
 *   1. Checks quota headroom before starting
 *   2. Searches YouTube for videos, playlists related to the topic
 *   3. Fetches full details (videos.list, channels.list, playlistItems.list)
 *   4. Dedupes by youtube_video_id / youtube_channel_id (never re-inserts)
 *   5. Classifies content_type using the rule engine
 *   6. Writes normalized data to: channels → playlists → videos → playlist_items → video_topics
 *   7. Updates the ingestion_jobs row with status + units_spent
 *
 * Quota budget per job:
 *   - Default: 5 × search.list = 500 units
 *   - + ~1 unit per 50 videos (videos.list batches)
 *   - + 1 unit per batch of channel IDs
 *   - + 1 unit per playlist page
 *   Total: typically 520–600 units per topic
 *
 * The quota tracker deducts units atomically and throws QuotaExceededError
 * if the 90% threshold is hit mid-job. The job is then marked 'quota_exceeded'.
 */

import { db, query } from '@/db';
import {
  channels,
  videos,
  playlists,
  playlistItems,
  videoTopics,
  ingestionJobs,
  topics,
} from '@/db/schema';
import {
  searchContent,
  getVideoDetails,
  getChannelDetails,
  getPlaylistDetails,
  getPlaylistItems,
  parseDurationToSeconds,
} from '@/services/youtube/client';
import { hasQuotaFor } from '@/services/youtube/quota';
import {
  classifyVideo,
  classifyCoursePlaylist,
  inferDifficulty,
  validateContentType,
  validateDifficulty,
} from '@/services/classification/rules';
import type {
  IngestionJobInput,
  RawYouTubeVideo,
  RawYouTubePlaylist,
  QuotaExceededError,
} from '@/types';
import { eq, and } from 'drizzle-orm';

// ─── Cost estimate for quota headroom check ───────────────────────────────────

function estimateQuotaCost(maxSearchCalls: number): number {
  // search.list: 100 each
  // + videos.list: ~2 units (2 batches of 50)
  // + channels.list: ~1 unit
  // + playlistItems.list: ~5 units (5 playlists × 1 unit each)
  return maxSearchCalls * 100 + 8;
}

// ─── Main ingestion function ──────────────────────────────────────────────────

export async function ingestTopic(input: IngestionJobInput): Promise<{
  jobId: string;
  videosIngested: number;
  channelsIngested: number;
  playlistsIngested: number;
  unitsSpent: number;
}> {
  const { topic, maxSearchCalls = 5, skipIfRecent = false } = input;

  // ── Create ingestion job record ───────────────────────────────────────────
  const [job] = await db
    .insert(ingestionJobs)
    .values({ topic, status: 'running', startedAt: new Date() })
    .returning();

  console.log(`[ingestion] Starting job ${job.id} for topic: "${topic}"`);

  try {
    // ── Check if we have enough quota headroom ────────────────────────────
    const estimatedCost = estimateQuotaCost(maxSearchCalls);
    const hasHeadroom = await hasQuotaFor(estimatedCost);

    if (!hasHeadroom) {
      await db
        .update(ingestionJobs)
        .set({ status: 'quota_exceeded', completedAt: new Date() })
        .where(eq(ingestionJobs.id, job.id));

      console.error(`[ingestion] Quota insufficient for job ${job.id}. Aborting.`);
      return { jobId: job.id, videosIngested: 0, channelsIngested: 0, playlistsIngested: 0, unitsSpent: 0 };
    }

    // ── Skip if recently ingested (optional) ─────────────────────────────
    if (skipIfRecent) {
      const recentJob = await db.query.ingestionJobs.findFirst({
        where: and(
          eq(ingestionJobs.topic, topic),
          eq(ingestionJobs.status, 'completed')
        ),
        orderBy: (j, { desc }) => [desc(j.completedAt)],
      });

      if (recentJob?.completedAt) {
        const daysSince =
          (Date.now() - recentJob.completedAt.getTime()) / (1000 * 60 * 60 * 24);
        if (daysSince < 7) {
          console.log(`[ingestion] Skipping "${topic}" — ingested ${Math.round(daysSince)} days ago`);
          await db
            .update(ingestionJobs)
            .set({ status: 'completed', completedAt: new Date(), unitsSpent: 0 })
            .where(eq(ingestionJobs.id, job.id));
          return { jobId: job.id, videosIngested: 0, channelsIngested: 0, playlistsIngested: 0, unitsSpent: 0 };
        }
      }
    }

    // ── Step 1: Search for videos ─────────────────────────────────────────
    console.log(`[ingestion] Searching YouTube for "${topic}" (${maxSearchCalls} calls)`);
    const searchResults: Awaited<ReturnType<typeof searchContent>> = [];

    for (let i = 0; i < maxSearchCalls; i++) {
      // Vary the search slightly to get broader coverage
      const searchQuery = i === 0
        ? topic
        : i === 1
        ? `${topic} tutorial`
        : i === 2
        ? `${topic} course`
        : i === 3
        ? `${topic} beginner`
        : `${topic} explained`;

      const results = await searchContent({
        query: searchQuery,
        maxResults: 50,
        type: 'video',
        order: i === 0 ? 'relevance' : 'viewCount',
      });

      searchResults.push(...results);
    }

    // Also search for playlists
    const playlistSearchResults = await searchContent({
      query: `${topic} course playlist`,
      maxResults: 25,
      type: 'playlist',
      order: 'relevance',
    });

    // ── Step 2: Deduplicate search result IDs ─────────────────────────────
    const videoIds = [...new Set(
      searchResults
        .filter((r) => r.type === 'video' && r.id)
        .map((r) => r.id)
    )];

    const playlistSearchIds = [...new Set(
      playlistSearchResults
        .filter((r) => r.type === 'playlist' && r.id)
        .map((r) => r.id)
    )];

    console.log(`[ingestion] Found ${videoIds.length} unique video IDs, ${playlistSearchIds.length} playlist IDs`);

    // ── Step 3: Fetch full video details ──────────────────────────────────
    const rawVideos = await getVideoDetails(videoIds);

    // ── Step 4: Collect unique channel IDs ───────────────────────────────
    const channelIds = [...new Set(rawVideos.map((v) => v.channelId).filter(Boolean))];

    // ── Step 5: Fetch channel details ─────────────────────────────────────
    const rawChannels = await getChannelDetails(channelIds);

    // ── Step 6: Fetch playlist details ────────────────────────────────────
    const rawPlaylists = await getPlaylistDetails(playlistSearchIds);

    // ── Step 7: Upsert channels ───────────────────────────────────────────
    const channelIdMap = new Map<string, string>(); // youtubeChannelId → internal uuid

    for (const ch of rawChannels) {
      if (!ch.id) continue;

      const [existing] = await db
        .select({ id: channels.id })
        .from(channels)
        .where(eq(channels.youtubeChannelId, ch.id))
        .limit(1);

      if (existing) {
        channelIdMap.set(ch.id, existing.id);
        // Update subscriber count if changed
        await db
          .update(channels)
          .set({
            subscriberCount: parseInt(ch.subscriberCount, 10) || null,
            videoCount: parseInt(ch.videoCount, 10) || null,
            lastSyncedAt: new Date(),
          })
          .where(eq(channels.id, existing.id));
      } else {
        const [inserted] = await db
          .insert(channels)
          .values({
            youtubeChannelId: ch.id,
            name: ch.title,
            description: ch.description || null,
            subscriberCount: parseInt(ch.subscriberCount, 10) || null,
            videoCount: parseInt(ch.videoCount, 10) || null,
            thumbnailUrl: ch.thumbnailUrl || null,
            lastSyncedAt: new Date(),
          })
          .returning({ id: channels.id });

        channelIdMap.set(ch.id, inserted.id);
      }
    }

    console.log(`[ingestion] Upserted ${channelIdMap.size} channels`);

    // ── Step 8: Upsert playlists ──────────────────────────────────────────
    const playlistIdMap = new Map<string, string>(); // youtubePlaylistId → internal uuid
    const playlistItemsData: Awaited<ReturnType<typeof getPlaylistItems>>[] = [];

    for (const pl of rawPlaylists) {
      if (!pl.id) continue;

      const channelUUID = channelIdMap.get(pl.channelId) || null;

      const [existing] = await db
        .select({ id: playlists.id })
        .from(playlists)
        .where(eq(playlists.youtubePlaylistId, pl.id))
        .limit(1);

      if (existing) {
        playlistIdMap.set(pl.id, existing.id);
      } else {
        // We'll classify after fetching playlist items
        const [inserted] = await db
          .insert(playlists)
          .values({
            youtubePlaylistId: pl.id,
            channelId: channelUUID,
            title: pl.title,
            videoCount: pl.itemCount,
            isCourse: false, // updated after classification
            courseConfidence: null,
            lastSyncedAt: new Date(),
          })
          .returning({ id: playlists.id });

        playlistIdMap.set(pl.id, inserted.id);
      }

      // Fetch playlist items (video order)
      try {
        const items = await getPlaylistItems(pl.id, 3);
        playlistItemsData.push(items);
      } catch (e) {
        console.warn(`[ingestion] Could not fetch items for playlist ${pl.id}:`, e);
        playlistItemsData.push([]);
      }
    }

    // ── Step 9: Classify playlists and update is_course ───────────────────
    for (let i = 0; i < rawPlaylists.length; i++) {
      const pl = rawPlaylists[i];
      const internalId = playlistIdMap.get(pl.id);
      if (!internalId) continue;

      const items = playlistItemsData[i] ?? [];
      const siblingTitles = items.map((item) => item.title);
      const classification = classifyCoursePlaylist(pl, pl.itemCount, siblingTitles);

      await db
        .update(playlists)
        .set({
          isCourse: classification.isCourse,
          courseConfidence: classification.courseConfidence,
        })
        .where(eq(playlists.id, internalId));
    }

    // ── Step 10: Upsert videos ────────────────────────────────────────────
    let videosIngested = 0;
    const videoIdMap = new Map<string, string>(); // youtubeVideoId → internal uuid

    for (const rawVideo of rawVideos) {
      if (!rawVideo.id || !rawVideo.title) continue;

      // Skip live broadcasts
      if (rawVideo.liveBroadcastContent === 'live') continue;

      const channelUUID = channelIdMap.get(rawVideo.channelId) || null;
      const durationSec = parseDurationToSeconds(rawVideo.duration);

      // Classify content type using rule engine
      const classification = classifyVideo(rawVideo);

      const [existing] = await db
        .select({ id: videos.id })
        .from(videos)
        .where(eq(videos.youtubeVideoId, rawVideo.id))
        .limit(1);

      if (existing) {
        videoIdMap.set(rawVideo.id, existing.id);
        // Update view/like counts
        await db
          .update(videos)
          .set({
            viewCount: parseInt(rawVideo.viewCount, 10) || null,
            likeCount: parseInt(rawVideo.likeCount, 10) || null,
            lastSyncedAt: new Date(),
          })
          .where(eq(videos.id, existing.id));
      } else {
        const [inserted] = await db
          .insert(videos)
          .values({
            youtubeVideoId: rawVideo.id,
            channelId: channelUUID,
            title: rawVideo.title,
            description: rawVideo.description || null,
            thumbnailUrl: rawVideo.thumbnailUrl || null,
            publishedAt: rawVideo.publishedAt ? new Date(rawVideo.publishedAt) : null,
            durationSeconds: durationSec,
            viewCount: parseInt(rawVideo.viewCount, 10) || null,
            likeCount: parseInt(rawVideo.likeCount, 10) || null,
            contentType: validateContentType(classification.contentType),
            difficulty: validateDifficulty(classification.difficulty),
            lastSyncedAt: new Date(),
          })
          .returning({ id: videos.id });

        videoIdMap.set(rawVideo.id, inserted.id);
        videosIngested++;
      }
    }

    console.log(`[ingestion] Upserted ${videosIngested} new videos (${rawVideos.length} total processed)`);

    // ── Step 11: Upsert playlist_items ────────────────────────────────────
    for (let i = 0; i < rawPlaylists.length; i++) {
      const pl = rawPlaylists[i];
      const playlistUUID = playlistIdMap.get(pl.id);
      if (!playlistUUID) continue;

      for (const item of playlistItemsData[i] ?? []) {
        const videoUUID = videoIdMap.get(item.videoId);
        if (!videoUUID) continue;

        // Upsert — ignore if already exists (unique constraint)
        await db
          .insert(playlistItems)
          .values({
            playlistId: playlistUUID,
            videoId: videoUUID,
            position: item.position,
          })
          .onConflictDoNothing();
      }
    }

    // ── Step 12: Link videos to topic ─────────────────────────────────────
    // Find or create the topic row
    const topicSlug = topic.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const [topicRow] = await db
      .insert(topics)
      .values({ name: topic, slug: topicSlug })
      .onConflictDoNothing()
      .returning({ id: topics.id });

    // Get existing topic id if not just inserted
    const topicRecord = topicRow ?? await db.query.topics.findFirst({
      where: eq(topics.slug, topicSlug),
    });

    if (topicRecord) {
      for (const [, videoUUID] of videoIdMap) {
        await db
          .insert(videoTopics)
          .values({ videoId: videoUUID, topicId: topicRecord.id, relevanceScore: 1.0 })
          .onConflictDoNothing();
      }
    }

    // ── Step 13: Mark job completed ───────────────────────────────────────
    // Read how many units were actually spent from quota_tracking
    const todayDate = new Date().toISOString().split('T')[0];
    const quotaRows = await query<{ units_used: number }>(
      'SELECT units_used FROM quota_tracking WHERE date = $1',
      [todayDate]
    );
    const totalUnitsToday = quotaRows[0]?.units_used ?? 0;

    await db
      .update(ingestionJobs)
      .set({
        status: 'completed',
        completedAt: new Date(),
        unitsSpent: totalUnitsToday, // approximate — actual spend tracked in quota_tracking
      })
      .where(eq(ingestionJobs.id, job.id));

    console.log(`[ingestion] Job ${job.id} completed. Videos: ${videosIngested}, Channels: ${channelIdMap.size}, Playlists: ${playlistIdMap.size}`);

    return {
      jobId: job.id,
      videosIngested,
      channelsIngested: channelIdMap.size,
      playlistsIngested: playlistIdMap.size,
      unitsSpent: totalUnitsToday,
    };
  } catch (error) {
    const isQuotaError = (error as Error)?.name === 'QuotaExceededError';

    await db
      .update(ingestionJobs)
      .set({
        status: isQuotaError ? 'quota_exceeded' : 'failed',
        completedAt: new Date(),
      })
      .where(eq(ingestionJobs.id, job.id));

    console.error(`[ingestion] Job ${job.id} failed:`, error);
    throw error;
  }
}
