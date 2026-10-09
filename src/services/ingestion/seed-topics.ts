import { getTopicBySlug, matchTopic, TOPICS, type TopicDefinition } from '@/config/topics';

export type SeedTopic = TopicDefinition;
export const SEED_TOPICS = TOPICS;

export const SEED_SEARCH_VARIANTS = (topic: string): readonly string[] => [
  topic,
  `${topic} course`,
  `${topic} tutorial`,
  `${topic} podcast`,
  `${topic} interview`,
  `${topic} for beginners`,
];

export function getSeedTopicBySlug(slug: string): SeedTopic | undefined {
  return getTopicBySlug(slug);
}

export function resolveSeedTopic(query: string): SeedTopic | undefined {
  const result = matchTopic(query);
  return result.matched ? result.topic : undefined;
}
