/**
 * Tubiq — Shared TypeScript types
 * Derived from the DB schema (section 4 of spec).
 * These are the application-level types used across frontend and backend.
 */

// ─── Enums ────────────────────────────────────────────────────────────────────

export type ContentType = 'course' | 'podcast' | 'video' | 'short' | 'interview' | 'lecture';

export type Difficulty = 'beginner' | 'intermediate' | 'advanced' | 'unknown';

export type TranscriptStatus = 'none' | 'pending' | 'available' | 'failed';

export type IngestionStatus = 'pending' | 'running' | 'completed' | 'failed' | 'quota_exceeded';

export type QueryIntent = 'CAREER' | 'QUICK_REFERENCE' | 'STRUCTURED_LEARNING';

export type ContentSource = 'youtube'; // expand in future phases

// ─── Domain entities (match DB tables) ────────────────────────────────────────

export interface Topic {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  contentSource: ContentSource;
  createdAt: Date;
}

export interface Channel {
  id: string;
  youtubeChannelId: string;
  name: string;
  description: string | null;
  subscriberCount: number | null;
  videoCount: number | null;
  thumbnailUrl: string | null;
  contentSource: ContentSource;
  lastSyncedAt: Date | null;
}

export interface Video {
  id: string;
  youtubeVideoId: string;
  channelId: string | null;
  playlistId: string | null;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  publishedAt: Date | null;
  durationSeconds: number | null;
  viewCount: number | null;
  likeCount: number | null;
  contentType: ContentType;
  difficulty: Difficulty;
  aiSummary: string | null;
  aiTopics: string[];
  transcriptStatus: TranscriptStatus;
  contentSource: ContentSource;
  lastSyncedAt: Date | null;
  // Joined fields
  channel?: Channel;
}

export interface Playlist {
  id: string;
  youtubePlaylistId: string;
  channelId: string | null;
  title: string;
  videoCount: number | null;
  isCourse: boolean;
  courseConfidence: number | null;
  difficulty: Difficulty;
  estimatedDurationSeconds: number | null;
  contentSource: ContentSource;
  lastSyncedAt: Date | null;
  // Joined fields
  channel?: Channel;
  items?: PlaylistItem[];
}

export interface PlaylistItem {
  id: string;
  playlistId: string;
  videoId: string;
  position: number;
  video?: Video;
}

export interface VideoTopic {
  videoId: string;
  topicId: string;
  relevanceScore: number;
}

export interface LearningPath {
  id: string;
  topicId: string;
  title: string;
  aiGenerated: boolean;
  createdAt: Date;
}

export interface LearningPathItem {
  id: string;
  pathId: string;
  videoId: string | null;
  playlistId: string | null;
  level: number;
  position: number;
}

export interface IngestionJob {
  id: string;
  topic: string;
  status: IngestionStatus;
  unitsSpent: number;
  startedAt: Date | null;
  completedAt: Date | null;
}

// ─── Search / API response types ──────────────────────────────────────────────

export interface SearchResultCategories {
  courses: Playlist[];
  videos: Video[];
  podcasts: Video[];
  shorts: Video[];
  creators: Channel[];
}

export interface SearchResponse {
  query: string;
  intent: QueryIntent;
  /** Ordered list of category keys to show, based on intent classification */
  categoryOrder: Array<keyof SearchResultCategories>;
  results: SearchResultCategories;
  coldStart: boolean;
  totalResults: number;
}

export interface IntentClassification {
  intent: QueryIntent;
  categoryOrder: Array<keyof SearchResultCategories>;
}

// ─── Content classification ────────────────────────────────────────────────────

export interface ClassificationResult {
  contentType: ContentType;
  confidence: number; // 0.0 – 1.0
  isCourse: boolean;
  courseConfidence: number; // 0.0 – 1.0
  difficulty: Difficulty;
}

/** Structured output schema for Phase 2 LLM fallback classifier */
export interface LLMClassificationOutput {
  content_type: ContentType;
  content_type_confidence: number;
  difficulty: Difficulty;
  topics: string[];
  is_likely_fabricated_or_low_quality: boolean;
}

// ─── AI output schemas (section 7 of spec) ────────────────────────────────────

/** 7.1 — AI Topic Overview */
export interface AITopicOverview {
  what_is_it: string;
  what_to_learn: string[];
  career_context: string | null;
  recommended_starting_point: string;
  confidence_note: string;
}

/** 7.2 — Per-item relevance blurb (1-2 sentences max) */
export type AIRelevanceBlurb = string;

/** 7.3 — Learning path (each level references real DB ids) */
export interface AILearningPathLevel {
  level: number;
  title: string;
  concepts: string[];
  recommended_video_ids: string[];
  recommended_course_id: string | null;
  estimated_hours: number;
}

export interface AILearningPath {
  levels: AILearningPathLevel[];
}

// ─── Ingestion worker types ────────────────────────────────────────────────────

export interface RawYouTubeVideo {
  id: string;
  title: string;
  description: string;
  channelId: string;
  channelTitle: string;
  publishedAt: string;
  thumbnailUrl: string;
  duration: string; // ISO 8601 duration e.g. "PT1H23M45S"
  viewCount: string;
  likeCount: string;
  tags: string[];
  categoryId: string;
  liveBroadcastContent: string;
}

export interface RawYouTubeChannel {
  id: string;
  title: string;
  description: string;
  subscriberCount: string;
  videoCount: string;
  thumbnailUrl: string;
}

export interface RawYouTubePlaylist {
  id: string;
  title: string;
  channelId: string;
  itemCount: number;
}

export interface RawYouTubePlaylistItem {
  playlistId: string;
  videoId: string;
  position: number;
  title: string;
}

export interface IngestionJobInput {
  topic: string;
  /** Max search.list calls for this job (each = 100 units). Default 5. */
  maxSearchCalls?: number;
  /** If true, skip if topic was ingested in last 7 days */
  skipIfRecent?: boolean;
}

// ─── Quota tracking ────────────────────────────────────────────────────────────

export interface QuotaState {
  date: string; // YYYY-MM-DD
  unitsUsed: number;
  dailyLimit: number;
}

export class QuotaExceededError extends Error {
  constructor(unitsUsed: number, limit: number) {
    super(`YouTube API quota exceeded: ${unitsUsed}/${limit} units used`);
    this.name = 'QuotaExceededError';
  }
}
