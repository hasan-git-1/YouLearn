/**
 * Tubiq — Fast Search Service (Direct YouTube API)
 *
 * Used when DB has no results for a query (cold start).
 * Calls YouTube API directly to return immediate results without waiting for ingestion.
 * Results are NOT saved to DB — purely for instant UI feedback.
 *
 * PIPELINE (per spec):
 *   1. Multi-query YouTube fetch (3 variants, maxResults=25 each → ~75 candidates)
 *   2. Fetch full video details
 *   3. Gemini relevance filter — BEFORE classification (fixes Defect 1)
 *   4. Classification of relevant candidates only
 *   5. Bucket into categories, return top 15 per bucket
 *
 * Quota cost: ~300-400 units per search (3 search.list + videos.list + channels.list)
 */

import {
  fastSearchContent,
  fastGetVideoDetails,
  fastGetChannelDetails,
  fastGetPlaylistDetails,
  parseDurationToSeconds,
} from '@/services/youtube/client';
import { classifyVideo, validateContentType, validateDifficulty } from '@/services/classification/rules';
import { filterTopicallyRelevant } from '@/services/ai';
import type {
  SearchResultCategories,
  Video,
  Channel,
  Playlist,
  RawYouTubeVideo,
  RawYouTubeChannel,
  RawYouTubePlaylist,
} from '@/types';

/** Delivered client-side pool; the first eight are visible and the rest reveal without a request. */
const FAST_SEARCH_POOL = 30;

interface FastSearchOptions {
  q: string;
  /** @deprecated — pool size is now fixed at FAST_SEARCH_POOL=15 */
  limit?: number;
}

/**
 * Performs direct YouTube search and returns categorized results immediately.
 * Used as fallback when DB has no indexed content for the query.
 */
export async function fastSearch(
  options: FastSearchOptions
): Promise<SearchResultCategories & { totalResults: number }> {
  const { q } = options;

  if (!q.trim()) {
    return { courses: [], videos: [], podcasts: [], shorts: [], creators: [], totalResults: 0 };
  }

  try {
    const tStart = performance.now();

    // ── Step 1: Multi-query video & playlist fetch in PARALLEL ───────────────
    const t1Start = performance.now();
    const queryVariants = [
      q,
      `${q} tutorial`,
      `${q} course`,
    ];

    const [allVideoResults, playlistSearchResults] = await Promise.all([
      Promise.all(
        queryVariants.map((variant) =>
          fastSearchContent({
            query: variant,
            maxResults: 25, // 25 per variant × 3 = up to 75 candidates
            type: 'video',
            order: 'relevance',
          })
        )
      ),
      fastSearchContent({
        query: `${q} course playlist`,
        maxResults: 25,
        type: 'playlist',
        order: 'relevance',
      }),
    ]);
    const t1 = Math.round(performance.now() - t1Start);
    console.log(`[fastSearch] Stage 1 (YouTube candidate search): ${t1}ms`);

    // Deduplicate video IDs across all variant results
    const seenVideoIds = new Set<string>();
    const deduplicatedResults = allVideoResults.flat().filter((r) => {
      if (!r.id || r.type !== 'video' || seenVideoIds.has(r.id)) return false;
      seenVideoIds.add(r.id);
      return true;
    });

    const videoIds = deduplicatedResults.map((r) => r.id);
    const playlistIds = playlistSearchResults
      .filter((r) => r.type === 'playlist' && r.id)
      .map((r) => r.id);

    if (videoIds.length === 0 && playlistIds.length === 0) {
      console.log(`[fastSearch] 0 video and 0 playlist candidates found for "${q}"`);
      return { courses: [], videos: [], podcasts: [], shorts: [], creators: [], totalResults: 0 };
    }

    // ── Step 2: Fetch video details & playlist details in PARALLEL ───────────
    const t2Start = performance.now();
    const [rawVideosAll, rawPlaylistsAll] = await Promise.all([
      videoIds.length > 0 ? fastGetVideoDetails(videoIds) : Promise.resolve([]),
      playlistIds.length > 0 ? fastGetPlaylistDetails(playlistIds) : Promise.resolve([]),
    ]);
    const t2 = Math.round(performance.now() - t2Start);
    console.log(`[fastSearch] Stage 2 (Candidate details fetch): ${t2}ms — ${rawVideosAll.length} videos, ${rawPlaylistsAll.length} playlists`);

    // ── Step 3: Topical relevance filters in PARALLEL ────────────────────────
    const t3Start = performance.now();
    const [relevanceMap, playlistRelevanceMap] = await Promise.all([
      filterTopicallyRelevant(
        q,
        rawVideosAll.map((v) => ({
          id: v.id,
          title: v.title,
          description: v.description || null,
          channelName: v.channelTitle || null,
        }))
      ),
      rawPlaylistsAll.length > 0
        ? filterTopicallyRelevant(
            q,
            rawPlaylistsAll.map((p) => ({
              id: p.id,
              title: p.title,
              description: p.description || null,
              channelName: null,
            }))
          )
        : Promise.resolve(new Map()),
    ]);

    const rawVideos = rawVideosAll.filter(
      (v) => relevanceMap.get(v.id)?.isRelevant === true
    );
    const rawPlaylists = rawPlaylistsAll.filter(
      (p) => playlistRelevanceMap.get(p.id)?.isRelevant === true
    );
    const t3 = Math.round(performance.now() - t3Start);
    console.log(
      `[fastSearch] Stage 3 (Topical relevance filter): ${t3}ms — ${rawVideos.length}/${rawVideosAll.length} videos, ${rawPlaylists.length}/${rawPlaylistsAll.length} playlists kept for "${q}"`
    );

    // ── Step 4: Fetch channel details & classify/normalize in PARALLEL ───────
    const t4Start = performance.now();
    const allChannelIds = [...new Set([
      ...rawVideos.map((v) => v.channelId),
      ...rawPlaylists.map((p) => p.channelId),
    ].filter(Boolean))];

    const rawChannels = await fastGetChannelDetails(allChannelIds);
    const channelMap = new Map(rawChannels.map((channel) => [channel.id, channel]));

    // ── Step 6: Classify and normalize videos ────────────────────────────────
    // Only process videos that passed the relevance gate (Step 3)
    const videos: Video[] = [];
    const podcasts: Video[] = [];
    const shorts: Video[] = [];

    for (const rawVideo of rawVideos) {
      if (!rawVideo.id || !rawVideo.title) continue;
      if (rawVideo.liveBroadcastContent === 'live') continue;

      const rawChannel = channelMap.get(rawVideo.channelId);
      const durationSec = parseDurationToSeconds(rawVideo.duration);
      const classification = classifyVideo(rawVideo, null, undefined, undefined);

      const video: Video = {
        id: `yt_${rawVideo.id}`, // Prefix to distinguish from DB IDs
        youtubeVideoId: rawVideo.id,
        channelId: rawChannel ? `yt_ch_${rawChannel.id}` : null,
        playlistId: null,
        title: rawVideo.title,
        description: rawVideo.description || null,
        thumbnailUrl: rawVideo.thumbnailUrl || null,
        publishedAt: rawVideo.publishedAt ? new Date(rawVideo.publishedAt) : null,
        durationSeconds: durationSec,
        viewCount: parseInt(rawVideo.viewCount, 10) || null,
        likeCount: parseInt(rawVideo.likeCount, 10) || null,
        contentType: validateContentType(classification.contentType),
        difficulty: validateDifficulty(classification.difficulty),
        aiSummary: null,
        aiTopics: [],
        transcriptStatus: 'none',
        contentSource: 'youtube',
        lastSyncedAt: new Date(),
        channel: rawChannel
          ? {
              id: `yt_ch_${rawChannel.id}`,
              youtubeChannelId: rawChannel.id,
              name: rawChannel.title,
              description: rawChannel.description || null,
              subscriberCount: parseInt(rawChannel.subscriberCount, 10) || null,
              videoCount: parseInt(rawChannel.videoCount, 10) || null,
              thumbnailUrl: rawChannel.thumbnailUrl || null,
              contentSource: 'youtube',
              lastSyncedAt: new Date(),
            }
          : undefined,
      };

      // Categorize by contentType
      if (video.contentType === 'short') {
        shorts.push(video);
      } else if (video.contentType === 'podcast') {
        podcasts.push(video);
      } else {
        videos.push(video);
      }
    }

    // ── Step 7: Normalize playlists (courses) ────────────────────────────────
    const courses: Playlist[] = [];
    for (const rawPlaylist of rawPlaylists) {
      if (!rawPlaylist.id || !rawPlaylist.title) continue;

      const rawChannel = channelMap.get(rawPlaylist.channelId);
      const channelUUID = rawChannel ? `yt_ch_${rawChannel.id}` : null;

      // Simple course detection: 5+ videos + course-like title
      const isCourse = rawPlaylist.itemCount >= 5 &&
        /course|tutorial|bootcamp|complete|full|learn|masterclass|crash|beginner/i.test(rawPlaylist.title);

      courses.push({
        id: `yt_pl_${rawPlaylist.id}`,
        youtubePlaylistId: rawPlaylist.id,
        channelId: channelUUID,
        title: rawPlaylist.title,
        videoCount: rawPlaylist.itemCount,
        isCourse,
        courseConfidence: isCourse ? 0.7 : 0.1,
        difficulty: 'unknown',
        estimatedDurationSeconds: null,
        contentSource: 'youtube',
        lastSyncedAt: new Date(),
        channel: rawChannel
          ? {
              id: `yt_ch_${rawChannel.id}`,
              youtubeChannelId: rawChannel.id,
              name: rawChannel.title,
              description: rawChannel.description || null,
              subscriberCount: parseInt(rawChannel.subscriberCount, 10) || null,
              videoCount: parseInt(rawChannel.videoCount, 10) || null,
              thumbnailUrl: rawChannel.thumbnailUrl || null,
              contentSource: 'youtube',
              lastSyncedAt: new Date(),
            }
          : undefined,
      });
    }

    // ── Step 8: Normalize creators (channels) ────────────────────────────────
    // Only channels from relevant videos — sorted by subscriber count
    const creatorChannelIds = [...new Set(
      [...rawVideos.map((v) => v.channelId), ...rawPlaylists.map((p) => p.channelId)].filter(Boolean)
    )];

    const creators: Channel[] = creatorChannelIds
      .map((id) => channelMap.get(id))
      .filter(Boolean)
      .sort((a, b) => {
        const aSubs = parseInt(a!.subscriberCount, 10) || 0;
        const bSubs = parseInt(b!.subscriberCount, 10) || 0;
        return bSubs - aSubs; // descending subscriber count
      })
      .slice(0, 15) // up to 15 creators per spec
      .map((c) => ({
        id: `yt_ch_${c!.id}`,
        youtubeChannelId: c!.id,
        name: c!.title,
        description: c!.description || null,
        subscriberCount: parseInt(c!.subscriberCount, 10) || null,
        videoCount: parseInt(c!.videoCount, 10) || null,
        thumbnailUrl: c!.thumbnailUrl || null,
        contentSource: 'youtube',
        lastSyncedAt: new Date(),
      }));

    const totalResults = videos.length + podcasts.length + shorts.length + courses.length + creators.length;
    const t4 = Math.round(performance.now() - t4Start);
    console.log(`[fastSearch] Stage 4 (Channel details & classification): ${t4}ms`);
    console.log(`[fastSearch] Total pipeline for "${q}": ${Math.round(performance.now() - tStart)}ms — ${totalResults} results found`);

    // Return the full pool per bucket (up to FAST_SEARCH_POOL items).
    // CategorySection renders top 5 by default; View More reveals the rest
    // without triggering a new API call (the full pool is already in DOM).
    return {
      courses: courses.slice(0, FAST_SEARCH_POOL),
      videos: videos.slice(0, FAST_SEARCH_POOL),
      podcasts: podcasts.slice(0, FAST_SEARCH_POOL),
      shorts: shorts.slice(0, FAST_SEARCH_POOL),
      creators,
      totalResults,
    };
  } catch (error) {
    console.error('[fastSearch] Error:', error);
    return { courses: [], videos: [], podcasts: [], shorts: [], creators: [], totalResults: 0 };
  }
}
