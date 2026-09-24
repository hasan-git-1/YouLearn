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

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const topic = await db.query.topics.findFirst({
    where: eq(topics.slug, slug),
  });

  if (!topic) {
    return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
  }

  // Use the topic name as the search query for consistent results
  const searchResult = await keywordSearch({ q: topic.name, limit: 12 });
  const intentResult = classifyIntent(topic.name);

  return NextResponse.json({
    topic,
    intent: intentResult.intent,
    categoryOrder: intentResult.categoryOrder,
    results: searchResult,
    coldStart: searchResult.totalResults === 0,
  });
}
