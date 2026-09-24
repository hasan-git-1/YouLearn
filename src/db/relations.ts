/**
 * Drizzle ORM relations definition
 * Required for relational queries using `db.query.X.findFirst({ with: { ... } })`
 */

import { relations } from 'drizzle-orm';
import {
  users, userProfiles, topics, searches, channels, videos,
  playlists, playlistItems, videoTopics, userInterests,
  learningPaths, learningPathItems, userProgress,
  savedContent, watchHistory, userEvents, ingestionJobs,
} from './schema';

export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(userProfiles, { fields: [users.id], references: [userProfiles.userId] }),
  searches: many(searches),
  userInterests: many(userInterests),
  userProgress: many(userProgress),
  savedContent: many(savedContent),
  watchHistory: many(watchHistory),
  userEvents: many(userEvents),
}));

export const userProfilesRelations = relations(userProfiles, ({ one }) => ({
  user: one(users, { fields: [userProfiles.userId], references: [users.id] }),
}));

export const topicsRelations = relations(topics, ({ many }) => ({
  searches: many(searches),
  videoTopics: many(videoTopics),
  userInterests: many(userInterests),
  learningPaths: many(learningPaths),
}));

export const searchesRelations = relations(searches, ({ one }) => ({
  user: one(users, { fields: [searches.userId], references: [users.id] }),
  topic: one(topics, { fields: [searches.topicId], references: [topics.id] }),
}));

export const channelsRelations = relations(channels, ({ many }) => ({
  videos: many(videos),
  playlists: many(playlists),
}));

export const videosRelations = relations(videos, ({ one, many }) => ({
  channel: one(channels, { fields: [videos.channelId], references: [channels.id] }),
  playlist: one(playlists, { fields: [videos.playlistId], references: [playlists.id] }),
  playlistItems: many(playlistItems),
  videoTopics: many(videoTopics),
  watchHistory: many(watchHistory),
}));

export const playlistsRelations = relations(playlists, ({ one, many }) => ({
  channel: one(channels, { fields: [playlists.channelId], references: [channels.id] }),
  items: many(playlistItems),
}));

export const playlistItemsRelations = relations(playlistItems, ({ one }) => ({
  playlist: one(playlists, { fields: [playlistItems.playlistId], references: [playlists.id] }),
  video: one(videos, { fields: [playlistItems.videoId], references: [videos.id] }),
}));

export const videoTopicsRelations = relations(videoTopics, ({ one }) => ({
  video: one(videos, { fields: [videoTopics.videoId], references: [videos.id] }),
  topic: one(topics, { fields: [videoTopics.topicId], references: [topics.id] }),
}));

export const userInterestsRelations = relations(userInterests, ({ one }) => ({
  user: one(users, { fields: [userInterests.userId], references: [users.id] }),
  topic: one(topics, { fields: [userInterests.topicId], references: [topics.id] }),
}));

export const learningPathsRelations = relations(learningPaths, ({ one, many }) => ({
  topic: one(topics, { fields: [learningPaths.topicId], references: [topics.id] }),
  items: many(learningPathItems),
}));

export const learningPathItemsRelations = relations(learningPathItems, ({ one }) => ({
  path: one(learningPaths, { fields: [learningPathItems.pathId], references: [learningPaths.id] }),
  video: one(videos, { fields: [learningPathItems.videoId], references: [videos.id] }),
  playlist: one(playlists, { fields: [learningPathItems.playlistId], references: [playlists.id] }),
}));

export const userProgressRelations = relations(userProgress, ({ one }) => ({
  user: one(users, { fields: [userProgress.userId], references: [users.id] }),
  path: one(learningPaths, { fields: [userProgress.pathId], references: [learningPaths.id] }),
  item: one(learningPathItems, { fields: [userProgress.itemId], references: [learningPathItems.id] }),
}));

export const savedContentRelations = relations(savedContent, ({ one }) => ({
  user: one(users, { fields: [savedContent.userId], references: [users.id] }),
}));

export const watchHistoryRelations = relations(watchHistory, ({ one }) => ({
  user: one(users, { fields: [watchHistory.userId], references: [users.id] }),
  video: one(videos, { fields: [watchHistory.videoId], references: [videos.id] }),
}));

export const userEventsRelations = relations(userEvents, ({ one }) => ({
  user: one(users, { fields: [userEvents.userId], references: [users.id] }),
}));
