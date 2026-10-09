/**
 * GET /api/ingest?topic=Python+Programming
 *
 * Admin-only route to manually trigger ingestion for a topic.
 * Protected by a shared secret in production.
 * Used for manual seeding without running seed.ts locally.
 */

import { NextRequest, NextResponse } from 'next/server';
import { inngest } from '@/jobs/ingestion';
import { matchTopic, TOPICS } from '@/config/topics';

export async function GET(request: NextRequest) {
  // Simple shared-secret guard — Phase 3 will use proper auth
  const secret = request.headers.get('x-ingest-secret');
  const expectedSecret = process.env.INGEST_SECRET;

  if (expectedSecret && secret !== expectedSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const topic = searchParams.get('topic')?.trim();
  const maxSearchCalls = parseInt(searchParams.get('max') ?? '5', 10);

  const topicMatch = matchTopic(topic ?? '');
  if (!topicMatch.matched) {
    return NextResponse.json({
      matched: false,
      message: "This topic is unavailable right now. We're expanding our learning universe.",
      topics: TOPICS,
    }, { headers: { 'X-Robots-Tag': 'noindex' } });
  }

  await inngest.send({
    name: 'app/topic.ingest',
    data: { topic: topicMatch.topic.name, maxSearchCalls, skipIfRecent: false },
  });

  return NextResponse.json({
    ok: true,
    message: `Ingestion job queued for "${topicMatch.topic.name}"`,
    topic: topicMatch.topic.name,
    maxSearchCalls,
  });
}
