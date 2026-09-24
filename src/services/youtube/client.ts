/**
 * Tubiq — YouTube Data API v3 Client
 *
 * ⚠️  HARD RULE (spec section 1):
 *     This is the ONLY file in the entire codebase that may import googleapis.
 *     No other file, route, component, or service may call YouTube directly.
 *     All YouTube API calls go through this module.
 *
 * Quota costs (as of YouTube Data API v3 defaults):
 *   search.list          = 100 units per call
 *   videos.list          = 1   unit  per call (up to 50 items)
 *   channels.list        = 1   unit  per call (up to 50 items)
 *   playlistItems.list   = 1   unit  per call (up to 50 items)
 *
 * Every exported function:
 *   1. Calls consumeQuota() BEFORE making the API request
 *   2. Parses ISO 8601 duration strings into seconds
 *   3. Returns normalized types — never raw API responses
 */

import { google, youtube_v3 } from 'googleapis';
import { consumeQuota, tryConsumeQuota } from './quota';
import type {
  RawYouTubeVideo,
  RawYouTubeChannel,
  RawYouTubePlaylist,
  RawYouTubePlaylistItem,
} from '@/types';

// ─── Singleton YouTube client ─────────────────────────────────────────────────

let _youtube: youtube_v3.Youtube | null = null;

function getYouTubeClient(): youtube_v3.Youtube {
  if (_youtube) return _youtube;

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    throw new Error('YOUTUBE_API_KEY environment variable is not set');
  }

  _youtube = google.youtube({ version: 'v3', auth: apiKey });
  return _youtube;
}

// ─── ISO 8601 duration parser ─────────────────────────────────────────────────

/**
 * Converts ISO 8601 duration (e.g. "PT1H23M45S") to total seconds.
 * Returns null if duration is missing or unparseable.
 */
export function parseDurationToSeconds(iso: string | null | undefined): number | null {
  if (!iso) return null;

  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return null;

  const hours   = parseInt(match[1] ?? '0', 10);
  const minutes = parseInt(match[2] ?? '0', 10);
  const seconds = parseInt(match[3] ?? '0', 10);

  return hours * 3600 + minutes * 60 + seconds;
}

// ─── search.list — 100 units per call ────────────────────────────────────────

export interface SearchVideosOptions {
  query: string;
  maxResults?: number;           // max 50 per call; default 25
  type?: 'video' | 'channel' | 'playlist';
  videoDuration?: 'short' | 'medium' | 'long';
  order?: 'relevance' | 'viewCount' | 'date';
}

export interface SearchResultItem {
  id: string;
  type: 'video' | 'channel' | 'playlist';
  title: string;
  description: string;
  channelId: string;
  channelTitle: string;
  publishedAt: string;
  thumbnailUrl: string;
}

/**
 * Calls search.list — costs 100 units per call.
 * Returns up to `maxResults` items.
 */
export async function searchContent(
  options: SearchVideosOptions
): Promise<SearchResultItem[]> {
  await consumeQuota(100);

  const yt = getYouTubeClient();
  const response = await yt.search.list({
    part: ['snippet'],
    q: options.query,
    maxResults: options.maxResults ?? 25,
    type: [options.type ?? 'video'],
    videoDuration: options.videoDuration,
    order: options.order ?? 'relevance',
    relevanceLanguage: 'en',
    safeSearch: 'moderate',
  });

  return (response.data.items ?? []).map((item) => ({
    id:
      item.id?.videoId ??
      item.id?.channelId ??
      item.id?.playlistId ??
      '',
    type: (item.id?.kind?.replace('youtube#', '') as 'video' | 'channel' | 'playlist') ?? 'video',
    title: item.snippet?.title ?? '',
    description: item.snippet?.description ?? '',
    channelId: item.snippet?.channelId ?? '',
    channelTitle: item.snippet?.channelTitle ?? '',
    publishedAt: item.snippet?.publishedAt ?? '',
    thumbnailUrl:
      item.snippet?.thumbnails?.high?.url ??
      item.snippet?.thumbnails?.default?.url ??
      '',
  }));
}

// ─── videos.list — 1 unit per call (up to 50 items) ──────────────────────────

/**
 * Fetches full video details for up to 50 video IDs.
 * Costs 1 unit per call regardless of batch size (up to 50).
 * Automatically batches if videoIds.length > 50.
 */
export async function getVideoDetails(
  videoIds: string[]
): Promise<RawYouTubeVideo[]> {
  if (videoIds.length === 0) return [];

  const results: RawYouTubeVideo[] = [];
  const yt = getYouTubeClient();

  // Process in batches of 50
  for (let i = 0; i < videoIds.length; i += 50) {
    const batch = videoIds.slice(i, i + 50);
    await consumeQuota(1);

    const response = await yt.videos.list({
      part: ['snippet', 'contentDetails', 'statistics'],
      id: batch,
    });

    for (const item of response.data.items ?? []) {
      results.push({
        id: item.id ?? '',
        title: item.snippet?.title ?? '',
        description: item.snippet?.description ?? '',
        channelId: item.snippet?.channelId ?? '',
        channelTitle: item.snippet?.channelTitle ?? '',
        publishedAt: item.snippet?.publishedAt ?? '',
        thumbnailUrl:
          item.snippet?.thumbnails?.maxres?.url ??
          item.snippet?.thumbnails?.high?.url ??
          item.snippet?.thumbnails?.default?.url ??
          '',
        duration: item.contentDetails?.duration ?? '',
        viewCount: item.statistics?.viewCount ?? '0',
        likeCount: item.statistics?.likeCount ?? '0',
        tags: item.snippet?.tags ?? [],
        categoryId: item.snippet?.categoryId ?? '',
        liveBroadcastContent: item.snippet?.liveBroadcastContent ?? 'none',
      });
    }
  }

  return results;
}

// ─── channels.list — 1 unit per call (up to 50 items) ────────────────────────

/**
 * Fetches channel details for up to 50 channel IDs.
 * Costs 1 unit per call.
 */
export async function getChannelDetails(
  channelIds: string[]
): Promise<RawYouTubeChannel[]> {
  if (channelIds.length === 0) return [];

  const results: RawYouTubeChannel[] = [];
  const yt = getYouTubeClient();

  for (let i = 0; i < channelIds.length; i += 50) {
    const batch = channelIds.slice(i, i + 50);
    await consumeQuota(1);

    const response = await yt.channels.list({
      part: ['snippet', 'statistics'],
      id: batch,
    });

    for (const item of response.data.items ?? []) {
      results.push({
        id: item.id ?? '',
        title: item.snippet?.title ?? '',
        description: item.snippet?.description ?? '',
        subscriberCount: item.statistics?.subscriberCount ?? '0',
        videoCount: item.statistics?.videoCount ?? '0',
        thumbnailUrl:
          item.snippet?.thumbnails?.high?.url ??
          item.snippet?.thumbnails?.default?.url ??
          '',
      });
    }
  }

  return results;
}

// ─── playlists.list — 1 unit per call ────────────────────────────────────────

/**
 * Fetches playlist metadata for a batch of playlist IDs.
 * Costs 1 unit per call.
 */
export async function getPlaylistDetails(
  playlistIds: string[]
): Promise<RawYouTubePlaylist[]> {
  if (playlistIds.length === 0) return [];

  const results: RawYouTubePlaylist[] = [];
  const yt = getYouTubeClient();

  for (let i = 0; i < playlistIds.length; i += 50) {
    const batch = playlistIds.slice(i, i + 50);
    await consumeQuota(1);

    const response = await yt.playlists.list({
      part: ['snippet', 'contentDetails'],
      id: batch,
    });

    for (const item of response.data.items ?? []) {
      results.push({
        id: item.id ?? '',
        title: item.snippet?.title ?? '',
        channelId: item.snippet?.channelId ?? '',
        itemCount: item.contentDetails?.itemCount ?? 0,
      });
    }
  }

  return results;
}

// ─── Fast Search Variants (non-throwing quota) ─────────────────────────────────
// Used by fastSearch for instant results — gracefully degrades if quota exceeded

/**
 * Fast search.list — 100 units per call, non-throwing on quota exceeded.
 * Returns empty array if quota exceeded or any error occurs.
 */
export async function fastSearchContent(
  options: SearchVideosOptions
): Promise<SearchResultItem[]> {
  const quotaResult = await tryConsumeQuota(100);
  if (!quotaResult.success) {
    console.warn('[fastSearchContent] Quota exceeded, returning empty results');
    return [];
  }

  try {
    const yt = getYouTubeClient();
    const response = await yt.search.list({
      part: ['snippet'],
      q: options.query,
      maxResults: options.maxResults ?? 25,
      type: [options.type ?? 'video'],
      videoDuration: options.videoDuration,
      order: options.order ?? 'relevance',
      relevanceLanguage: 'en',
      safeSearch: 'moderate',
    });

    return (response.data.items ?? []).map((item) => ({
      id:
        item.id?.videoId ??
        item.id?.channelId ??
        item.id?.playlistId ??
        '',
      type: (item.id?.kind?.replace('youtube#', '') as 'video' | 'channel' | 'playlist') ?? 'video',
      title: item.snippet?.title ?? '',
      description: item.snippet?.description ?? '',
      channelId: item.snippet?.channelId ?? '',
      channelTitle: item.snippet?.channelTitle ?? '',
      publishedAt: item.snippet?.publishedAt ?? '',
      thumbnailUrl:
        item.snippet?.thumbnails?.high?.url ??
        item.snippet?.thumbnails?.default?.url ??
        '',
    }));
  } catch (error) {
    console.error('[fastSearchContent] Error:', error);
    return [];
  }
}

/**
 * Fast videos.list — 1 unit per call, non-throwing on quota exceeded.
 * Returns empty array if quota exceeded or any error occurs.
 */
export async function fastGetVideoDetails(
  videoIds: string[]
): Promise<RawYouTubeVideo[]> {
  if (videoIds.length === 0) return [];

  const quotaResult = await tryConsumeQuota(1);
  if (!quotaResult.success) {
    console.warn('[fastGetVideoDetails] Quota exceeded, returning empty results');
    return [];
  }

  try {
    const results: RawYouTubeVideo[] = [];
    const yt = getYouTubeClient();

    for (let i = 0; i < videoIds.length; i += 50) {
      const batch = videoIds.slice(i, i + 50);
      const batchQuota = await tryConsumeQuota(1);
      if (!batchQuota.success) {
        console.warn('[fastGetVideoDetails] Quota exceeded mid-batch, returning partial results');
        break;
      }

      const response = await yt.videos.list({
        part: ['snippet', 'contentDetails', 'statistics'],
        id: batch,
      });

      for (const item of response.data.items ?? []) {
        results.push({
          id: item.id ?? '',
          title: item.snippet?.title ?? '',
          description: item.snippet?.description ?? '',
          channelId: item.snippet?.channelId ?? '',
          channelTitle: item.snippet?.channelTitle ?? '',
          publishedAt: item.snippet?.publishedAt ?? '',
          thumbnailUrl:
            item.snippet?.thumbnails?.maxres?.url ??
            item.snippet?.thumbnails?.high?.url ??
            item.snippet?.thumbnails?.default?.url ??
            '',
          duration: item.contentDetails?.duration ?? '',
          viewCount: item.statistics?.viewCount ?? '0',
          likeCount: item.statistics?.likeCount ?? '0',
          tags: item.snippet?.tags ?? [],
          categoryId: item.snippet?.categoryId ?? '',
          liveBroadcastContent: item.snippet?.liveBroadcastContent ?? 'none',
        });
      }
    }

    return results;
  } catch (error) {
    console.error('[fastGetVideoDetails] Error:', error);
    return [];
  }
}

/**
 * Fast channels.list — 1 unit per call, non-throwing on quota exceeded.
 * Returns empty array if quota exceeded or any error occurs.
 */
export async function fastGetChannelDetails(
  channelIds: string[]
): Promise<RawYouTubeChannel[]> {
  if (channelIds.length === 0) return [];

  const quotaResult = await tryConsumeQuota(1);
  if (!quotaResult.success) {
    console.warn('[fastGetChannelDetails] Quota exceeded, returning empty results');
    return [];
  }

  try {
    const results: RawYouTubeChannel[] = [];
    const yt = getYouTubeClient();

    for (let i = 0; i < channelIds.length; i += 50) {
      const batch = channelIds.slice(i, i + 50);
      const batchQuota = await tryConsumeQuota(1);
      if (!batchQuota.success) {
        console.warn('[fastGetChannelDetails] Quota exceeded mid-batch, returning partial results');
        break;
      }

      const response = await yt.channels.list({
        part: ['snippet', 'statistics'],
        id: batch,
      });

      for (const item of response.data.items ?? []) {
        results.push({
          id: item.id ?? '',
          title: item.snippet?.title ?? '',
          description: item.snippet?.description ?? '',
          subscriberCount: item.statistics?.subscriberCount ?? '0',
          videoCount: item.statistics?.videoCount ?? '0',
          thumbnailUrl:
            item.snippet?.thumbnails?.high?.url ??
            item.snippet?.thumbnails?.default?.url ??
            '',
        });
      }
    }

    return results;
  } catch (error) {
    console.error('[fastGetChannelDetails] Error:', error);
    return [];
  }
}

/**
 * Fast playlists.list — 1 unit per call, non-throwing on quota exceeded.
 * Returns empty array if quota exceeded or any error occurs.
 */
export async function fastGetPlaylistDetails(
  playlistIds: string[]
): Promise<RawYouTubePlaylist[]> {
  if (playlistIds.length === 0) return [];

  const quotaResult = await tryConsumeQuota(1);
  if (!quotaResult.success) {
    console.warn('[fastGetPlaylistDetails] Quota exceeded, returning empty results');
    return [];
  }

  try {
    const results: RawYouTubePlaylist[] = [];
    const yt = getYouTubeClient();

    for (let i = 0; i < playlistIds.length; i += 50) {
      const batch = playlistIds.slice(i, i + 50);
      const batchQuota = await tryConsumeQuota(1);
      if (!batchQuota.success) {
        console.warn('[fastGetPlaylistDetails] Quota exceeded mid-batch, returning partial results');
        break;
      }

      const response = await yt.playlists.list({
        part: ['snippet', 'contentDetails'],
        id: batch,
      });

      for (const item of response.data.items ?? []) {
        results.push({
          id: item.id ?? '',
          title: item.snippet?.title ?? '',
          channelId: item.snippet?.channelId ?? '',
          itemCount: item.contentDetails?.itemCount ?? 0,
        });
      }
    }

    return results;
  } catch (error) {
    console.error('[fastGetPlaylistDetails] Error:', error);
    return [];
  }
}

/**
 * Fetches ALL items in a playlist, paginating as needed.
 * Each page = 1 unit. A 50-video playlist = 1 unit total.
 */
export async function getPlaylistItems(
  playlistId: string,
  maxPages = 5 // safety cap — 5 pages × 50 items = 250 items max
): Promise<RawYouTubePlaylistItem[]> {
  const results: RawYouTubePlaylistItem[] = [];
  const yt = getYouTubeClient();
  let pageToken: string | undefined;
  let pageCount = 0;

  do {
    await consumeQuota(1);

    const response = await yt.playlistItems.list({
      part: ['snippet'],
      playlistId,
      maxResults: 50,
      pageToken,
    });

    for (const item of response.data.items ?? []) {
      const videoId = item.snippet?.resourceId?.videoId;
      if (!videoId) continue;

      results.push({
        playlistId,
        videoId,
        position: item.snippet?.position ?? results.length,
        title: item.snippet?.title ?? '',
      });
    }

    pageToken = response.data.nextPageToken ?? undefined;
    pageCount++;
  } while (pageToken && pageCount < maxPages);

  return results;
}
