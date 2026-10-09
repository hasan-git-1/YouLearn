/**
 * GET /api/topics/:slug
 * Returns topic metadata with top content per category.
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { topics, videoTopics, videos, channels, playlists } from '@/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { keywordSearch } from '@/services/search/keyword';
import { classifyIntent } from '@/services/search/intent';
import { getTopicBySlug, TOPICS } from '@/config/topics';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const configuredTopic = getTopicBySlug(slug);
  if (!configuredTopic) {
    return NextResponse.json({
      error: "This topic is unavailable right now. We're expanding our learning universe.",
      topics: TOPICS,
    }, { headers: { 'X-Robots-Tag': 'noindex' } });
  }

  const topic = await db.query.topics.findFirst({
    where: eq(topics.slug, slug),
  });

  const activeTopic = topic ?? { ...configuredTopic, id: configuredTopic.slug };

  // Use the topic name as the search query for consistent results
  const searchResult = await keywordSearch({ q: configuredTopic.name, pool: 30, topicSlug: configuredTopic.slug });
  const intentResult = classifyIntent(configuredTopic.name);

  return NextResponse.json({
    topic: activeTopic,
    intent: intentResult.intent,
    categoryOrder: intentResult.categoryOrder,
    results: searchResult,
    coldStart: searchResult.totalResults === 0,
  });
}
