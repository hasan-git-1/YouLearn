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

/** Max items to hold per bucket for View More (5 default + 10 reserve) */
const FAST_SEARCH_POOL = 15;

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
    // ── Step 1: Multi-query YouTube fetch (3 variants → wider candidate pool) ──
    const queryVariants = [
      q,
      `${q} tutorial`,
      `${q} course`,
    ];

    const allSearchResults = await Promise.all(
      queryVariants.map((variant) =>
        fastSearchContent({
          query: variant,
          maxResults: 25, // 25 per variant × 3 = up to 75 candidates
          type: 'video',
          order: 'relevance',
        })
      )
    );

    // Deduplicate by ID across all variant results
    const seenVideoIds = new Set<string>();
    const deduplicatedResults = allSearchResults.flat().filter((r) => {
      if (!r.id || r.type !== 'video' || seenVideoIds.has(r.id)) return false;
      seenVideoIds.add(r.id);
      return true;
    });

    const videoIds = deduplicatedResults.map((r) => r.id);

    if (videoIds.length === 0) {
      return { courses: [], videos: [], podcasts: [], shorts: [], creators: [], totalResults: 0 };
    }

    // ── Step 2: Get full video details ───────────────────────────────────────
    const rawVideosAll = await fastGetVideoDetails(videoIds);

    // ── Step 3: Relevance filter (BEFORE classification — fixes Defect 1) ────
    // This is the strict topical gate. A Python tutorial MUST NOT pass through
    // when the user searched "English Communication".
    const relevanceMap = await filterTopicallyRelevant(
      q,
      rawVideosAll.map((v) => ({
        id: v.id,
        title: v.title,
        description: v.description || null,
        channelName: v.channelTitle || null,
      }))
    );

    const rawVideos = rawVideosAll.filter(
      (v) => relevanceMap.get(v.id)?.isRelevant === true
    );

    console.log(
      `[fastSearch] Relevance gate: ${rawVideos.length}/${rawVideosAll.length} candidates kept for "${q}"`
    );

    // ── Step 4: Get unique channel IDs and fetch channel details ─────────────
    const channelIds = [...new Set(rawVideos.map((v) => v.channelId).filter(Boolean))];
    let rawChannels = await fastGetChannelDetails(channelIds);

    // ── Step 5: Search for playlists (courses) ───────────────────────────────
    const playlistSearchResults = await fastSearchContent({
      query: `${q} course playlist`,
      maxResults: 25,
      type: 'playlist',
      order: 'relevance',
    });

    const playlistIds = playlistSearchResults
      .filter((r) => r.type === 'playlist' && r.id)
      .map((r) => r.id);

    let rawPlaylistsAll: RawYouTubePlaylist[] = [];
    if (playlistIds.length > 0) {
      rawPlaylistsAll = await fastGetPlaylistDetails(playlistIds);
    }

    const playlistChannelIds = rawPlaylistsAll.map((playlist) => playlist.channelId).filter(Boolean);
    const missingPlaylistChannelIds = playlistChannelIds.filter((channelId) => !channelIds.includes(channelId));
    if (missingPlaylistChannelIds.length > 0) {
      rawChannels = await fastGetChannelDetails([...channelIds, ...missingPlaylistChannelIds]);
    }
    const channelMap = new Map(rawChannels.map((channel) => [channel.id, channel]));

    // Relevance filter for playlists too
    let rawPlaylists: RawYouTubePlaylist[] = rawPlaylistsAll;
    if (rawPlaylistsAll.length > 0) {
      const playlistRelevanceMap = await filterTopicallyRelevant(
        q,
        rawPlaylistsAll.map((p) => ({
          id: p.id,
          title: p.title,
          description: p.description || null,
          channelName: null,
        }))
      );
      rawPlaylists = rawPlaylistsAll.filter(
        (p) => playlistRelevanceMap.get(p.id)?.isRelevant === true
      );
    }

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
