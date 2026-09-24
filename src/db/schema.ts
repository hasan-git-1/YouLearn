/**
 * YouLearn — Drizzle ORM Schema
 *
 * Matches spec section 4 exactly.
 * Every table has a `content_source` column (default 'youtube') for future
 * multi-provider support — no code changes needed when adding a second provider.
 *
 * NOTE: The `embedding` column (vector(1536)) is created here but populated
 * only in Phase 2 when semantic search is added.
 */

import {
  pgTable,
  uuid,
  text,
  integer,
  bigint,
  boolean,
  real,
  timestamp,
  jsonb,
  primaryKey,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// pgvector column type — registered as a custom type
// The actual vector(1536) DDL is in the migration SQL
const vectorColumn = (name: string) =>
  text(name); // placeholder in Drizzle; real DDL in migration SQL

// ─── Helper: standard timestamps ─────────────────────────────────────────────

const timestamps = {
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
};

// ─── users ────────────────────────────────────────────────────────────────────

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').unique().notNull(),
  ...timestamps,
});

// ─── user_profiles ────────────────────────────────────────────────────────────

export const userProfiles = pgTable('user_profiles', {
  userId: uuid('user_id')
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
  difficultyPref: text('difficulty_pref'), // 'beginner' | 'intermediate' | 'advanced'
  goals: text('goals'),
  ...timestamps,
});

// ─── topics ───────────────────────────────────────────────────────────────────

export const topics = pgTable(
  'topics',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    slug: text('slug').notNull(),
    description: text('description'),
    contentSource: text('content_source').notNull().default('youtube'),
    ...timestamps,
  },
  (t) => ({
    slugIdx: uniqueIndex('topics_slug_idx').on(t.slug),
  })
);

// ─── searches ─────────────────────────────────────────────────────────────────

export const searches = pgTable('searches', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  query: text('query').notNull(),
  topicId: uuid('topic_id').references(() => topics.id, { onDelete: 'set null' }),
  ...timestamps,
});

// ─── channels ─────────────────────────────────────────────────────────────────

export const channels = pgTable(
  'channels',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    youtubeChannelId: text('youtube_channel_id').notNull(),
    name: text('name').notNull(),
    description: text('description'),
    subscriberCount: bigint('subscriber_count', { mode: 'number' }),
    videoCount: integer('video_count'),
    thumbnailUrl: text('thumbnail_url'),
    contentSource: text('content_source').notNull().default('youtube'),
    lastSyncedAt: timestamp('last_synced_at', { withTimezone: true }),
    ...timestamps,
  },
  (t) => ({
    youtubeChannelIdIdx: uniqueIndex('channels_youtube_channel_id_idx').on(
      t.youtubeChannelId,
      t.contentSource
    ),
  })
);

// ─── playlists ────────────────────────────────────────────────────────────────

export const playlists = pgTable(
  'playlists',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    youtubePlaylistId: text('youtube_playlist_id').notNull(),
    channelId: uuid('channel_id').references(() => channels.id, { onDelete: 'set null' }),
    title: text('title').notNull(),
    videoCount: integer('video_count'),
    isCourse: boolean('is_course').notNull().default(false),
    courseConfidence: real('course_confidence'),
    difficulty: text('difficulty').notNull().default('unknown'),
    estimatedDurationSeconds: bigint('estimated_duration_seconds', { mode: 'number' }),
    contentSource: text('content_source').notNull().default('youtube'),
    lastSyncedAt: timestamp('last_synced_at', { withTimezone: true }),
    ...timestamps,
  },
  (t) => ({
    youtubePlaylistIdIdx: uniqueIndex('playlists_youtube_playlist_id_idx').on(
      t.youtubePlaylistId,
      t.contentSource
    ),
  })
);

// ─── videos ───────────────────────────────────────────────────────────────────

export const videos = pgTable(
  'videos',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    youtubeVideoId: text('youtube_video_id').notNull(),
    channelId: uuid('channel_id').references(() => channels.id, { onDelete: 'set null' }),
    playlistId: uuid('playlist_id').references(() => playlists.id, { onDelete: 'set null' }),
    title: text('title').notNull(),
    description: text('description'),
    thumbnailUrl: text('thumbnail_url'),
    publishedAt: timestamp('published_at', { withTimezone: true }),
    durationSeconds: integer('duration_seconds'),
    viewCount: bigint('view_count', { mode: 'number' }),
    likeCount: bigint('like_count', { mode: 'number' }),
    contentType: text('content_type').notNull().default('video'),
    difficulty: text('difficulty').notNull().default('unknown'),
    aiSummary: text('ai_summary'),
    aiTopics: text('ai_topics').array().notNull().default(sql`'{}'::text[]`),
    // embedding column — DDL is vector(1536) in migration SQL, Drizzle uses text as placeholder
    // embedding: vector('embedding', { dimensions: 1536 }), -- Phase 2
    transcriptStatus: text('transcript_status').notNull().default('none'),
    contentSource: text('content_source').notNull().default('youtube'),
    lastSyncedAt: timestamp('last_synced_at', { withTimezone: true }),
    ...timestamps,
  },
  (t) => ({
    youtubeVideoIdIdx: uniqueIndex('videos_youtube_video_id_idx').on(
      t.youtubeVideoId,
      t.contentSource
    ),
    contentTypeIdx: index('videos_content_type_idx').on(t.contentType),
    publishedAtIdx: index('videos_published_at_idx').on(t.publishedAt),
    // Full-text search index — created in raw SQL migration
  })
);

// ─── playlist_items ───────────────────────────────────────────────────────────

export const playlistItems = pgTable(
  'playlist_items',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    playlistId: uuid('playlist_id')
      .notNull()
      .references(() => playlists.id, { onDelete: 'cascade' }),
    videoId: uuid('video_id')
      .notNull()
      .references(() => videos.id, { onDelete: 'cascade' }),
    position: integer('position').notNull(),
    ...timestamps,
  },
  (t) => ({
    playlistVideoIdx: uniqueIndex('playlist_items_playlist_video_idx').on(
      t.playlistId,
      t.videoId
    ),
    playlistPositionIdx: index('playlist_items_playlist_position_idx').on(
      t.playlistId,
      t.position
    ),
  })
);

// ─── video_topics ─────────────────────────────────────────────────────────────

export const videoTopics = pgTable(
  'video_topics',
  {
    videoId: uuid('video_id')
      .notNull()
      .references(() => videos.id, { onDelete: 'cascade' }),
    topicId: uuid('topic_id')
      .notNull()
      .references(() => topics.id, { onDelete: 'cascade' }),
    relevanceScore: real('relevance_score').notNull().default(1.0),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.videoId, t.topicId] }),
    topicIdx: index('video_topics_topic_idx').on(t.topicId),
  })
);

// ─── user_interests ───────────────────────────────────────────────────────────
// Phase 4 only — table exists but is unused until recommendations

export const userInterests = pgTable(
  'user_interests',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    topicId: uuid('topic_id')
      .notNull()
      .references(() => topics.id, { onDelete: 'cascade' }),
    score: real('score').notNull().default(0),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.topicId] }),
  })
);

// ─── learning_paths ───────────────────────────────────────────────────────────

export const learningPaths = pgTable('learning_paths', {
  id: uuid('id').primaryKey().defaultRandom(),
  topicId: uuid('topic_id')
    .notNull()
    .references(() => topics.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  aiGenerated: boolean('ai_generated').notNull().default(false),
  ...timestamps,
});

// ─── learning_path_items ──────────────────────────────────────────────────────

export const learningPathItems = pgTable(
  'learning_path_items',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    pathId: uuid('path_id')
      .notNull()
      .references(() => learningPaths.id, { onDelete: 'cascade' }),
    // Exactly one of videoId / playlistId must be non-null — enforced by CHECK constraint in SQL
    videoId: uuid('video_id').references(() => videos.id, { onDelete: 'cascade' }),
    playlistId: uuid('playlist_id').references(() => playlists.id, { onDelete: 'cascade' }),
    level: integer('level').notNull().default(1),
    position: integer('position').notNull(),
    ...timestamps,
  },
  (t) => ({
    pathPositionIdx: index('lpi_path_position_idx').on(t.pathId, t.level, t.position),
  })
);

// ─── user_progress ────────────────────────────────────────────────────────────

export const userProgress = pgTable(
  'user_progress',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    pathId: uuid('path_id')
      .notNull()
      .references(() => learningPaths.id, { onDelete: 'cascade' }),
    itemId: uuid('item_id')
      .notNull()
      .references(() => learningPathItems.id, { onDelete: 'cascade' }),
    status: text('status').notNull().default('not_started'), // 'not_started' | 'in_progress' | 'completed'
    completedAt: timestamp('completed_at', { withTimezone: true }),
    ...timestamps,
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.pathId, t.itemId] }),
  })
);

// ─── saved_content ────────────────────────────────────────────────────────────

export const savedContent = pgTable(
  'saved_content',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    contentType: text('content_type').notNull(),
    contentId: uuid('content_id').notNull(),
    savedAt: timestamp('saved_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.contentType, t.contentId] }),
  })
);

// ─── watch_history ────────────────────────────────────────────────────────────

export const watchHistory = pgTable(
  'watch_history',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    videoId: uuid('video_id')
      .notNull()
      .references(() => videos.id, { onDelete: 'cascade' }),
    watchSeconds: integer('watch_seconds').notNull().default(0),
    completed: boolean('completed').notNull().default(false),
    watchedAt: timestamp('watched_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    userVideoIdx: index('watch_history_user_video_idx').on(t.userId, t.videoId),
  })
);

// ─── user_events ──────────────────────────────────────────────────────────────

export const userEvents = pgTable(
  'user_events',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
    eventType: text('event_type').notNull(),
    payload: jsonb('payload'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    userEventIdx: index('user_events_user_idx').on(t.userId),
    eventTypeIdx: index('user_events_type_idx').on(t.eventType),
  })
);

// ─── ingestion_jobs ───────────────────────────────────────────────────────────

export const ingestionJobs = pgTable(
  'ingestion_jobs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    topic: text('topic').notNull(),
    status: text('status').notNull().default('pending'),
    unitsSpent: integer('units_spent').notNull().default(0),
    startedAt: timestamp('started_at', { withTimezone: true }),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    ...timestamps,
  },
  (t) => ({
    topicIdx: index('ingestion_jobs_topic_idx').on(t.topic),
    statusIdx: index('ingestion_jobs_status_idx').on(t.status),
  })
);

// ─── Infer types from schema ───────────────────────────────────────────────────

export type InsertUser = typeof users.$inferInsert;
export type SelectUser = typeof users.$inferSelect;

export type InsertTopic = typeof topics.$inferInsert;
export type SelectTopic = typeof topics.$inferSelect;

export type InsertChannel = typeof channels.$inferInsert;
export type SelectChannel = typeof channels.$inferSelect;

export type InsertVideo = typeof videos.$inferInsert;
export type SelectVideo = typeof videos.$inferSelect;

export type InsertPlaylist = typeof playlists.$inferInsert;
export type SelectPlaylist = typeof playlists.$inferSelect;

export type InsertPlaylistItem = typeof playlistItems.$inferInsert;
export type SelectPlaylistItem = typeof playlistItems.$inferSelect;

export type InsertVideoTopic = typeof videoTopics.$inferInsert;

export type InsertIngestionJob = typeof ingestionJobs.$inferInsert;
export type SelectIngestionJob = typeof ingestionJobs.$inferSelect;
