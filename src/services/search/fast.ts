/**
 * Tubiq — Fast Search Service (Direct YouTube API)
 *
 * Used when DB has no results for a query (cold start).
 * Calls YouTube API directly to return immediate results without waiting for ingestion.
 * Results are NOT saved to DB — purely for instant UI feedback.
 *
 * Quota cost: ~200 units per search (1 search.list + 1 videos.list + 1 channels.list)
 */

import {
  searchContent,
  getVideoDetails,
  getChannelDetails,
  getPlaylistDetails,
  parseDurationToSeconds,
} from '@/services/youtube/client';
import { classifyVideo, validateContentType, validateDifficulty } from '@/services/classification/rules';
import type {
  SearchResultCategories,
  Video,
  Channel,
  Playlist,
  RawYouTubeVideo,
  RawYouTubeChannel,
  RawYouTubePlaylist,
} from '@/types';

const FAST_SEARCH_LIMIT = 12;

interface FastSearchOptions {
  q: string;
  limit?: number;
}

/**
 * Performs direct YouTube search and returns categorized results immediately.
 * Used as fallback when DB has no indexed content for the query.
 */
export async function fastSearch(
  options: FastSearchOptions
): Promise<SearchResultCategories & { totalResults: number }> {
  const { q, limit = FAST_SEARCH_LIMIT } = options;

  if (!q.trim()) {
    return { courses: [], videos: [], podcasts: [], shorts: [], creators: [], totalResults: 0 };
  }

  try {
    // ── Step 1: Search YouTube for videos ────────────────────────────────────
    const searchResults = await searchContent({
      query: q,
      maxResults: limit * 3, // Get more to filter by type
      type: 'video',
      order: 'relevance',
    });

    const videoIds = searchResults
      .filter((r) => r.type === 'video' && r.id)
      .map((r) => r.id);

    if (videoIds.length === 0) {
      return { courses: [], videos: [], podcasts: [], shorts: [], creators: [], totalResults: 0 };
    }

    // ── Step 2: Get full video details ───────────────────────────────────────
    const rawVideos = await getVideoDetails(videoIds);

    // ── Step 3: Get unique channel IDs and fetch channel details ─────────────
    const channelIds = [...new Set(rawVideos.map((v) => v.channelId).filter(Boolean))];
    const rawChannels = await getChannelDetails(channelIds);
    const channelMap = new Map(rawChannels.map((c) => [c.id, c]));

    // ── Step 4: Search for playlists (courses) ───────────────────────────────
    const playlistSearchResults = await searchContent({
      query: `${q} course playlist`,
      maxResults: limit,
      type: 'playlist',
      order: 'relevance',
    });

    const playlistIds = playlistSearchResults
      .filter((r) => r.type === 'playlist' && r.id)
      .map((r) => r.id);

    let rawPlaylists: RawYouTubePlaylist[] = [];
    if (playlistIds.length > 0) {
      rawPlaylists = await getPlaylistDetails(playlistIds);
    }

    // ── Step 5: Classify and normalize videos ────────────────────────────────
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

    // ── Step 6: Normalize playlists (courses) ────────────────────────────────
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

    // ── Step 7: Normalize creators (channels) ────────────────────────────────
    const creatorChannelIds = [...new Set(
      [...rawVideos.map((v) => v.channelId), ...rawPlaylists.map((p) => p.channelId)].filter(Boolean)
    )];

    const creators: Channel[] = creatorChannelIds
      .map((id) => channelMap.get(id))
      .filter(Boolean)
      .slice(0, limit)
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

    return {
      courses: courses.slice(0, limit),
      videos: videos.slice(0, limit),
      podcasts: podcasts.slice(0, limit),
      shorts: shorts.slice(0, limit),
      creators: creators.slice(0, limit),
      totalResults,
    };
  } catch (error) {
    console.error('[fastSearch] Error:', error);
    return { courses: [], videos: [], podcasts: [], shorts: [], creators: [], totalResults: 0 };
  }
}