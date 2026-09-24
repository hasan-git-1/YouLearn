/**
 * GET /api/ingest?topic=Python+Programming
 *
 * Admin-only route to manually trigger ingestion for a topic.
 * Protected by a shared secret in production.
 * Used for manual seeding without running seed.ts locally.
 */

import { NextRequest, NextResponse } from 'next/server';
import { inngest } from '@/jobs/ingestion';

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

  if (!topic) {
    return NextResponse.json(
      { error: 'topic query parameter is required' },
      { status: 400 }
    );
  }

  await inngest.send({
    name: 'app/topic.ingest',
    data: { topic, maxSearchCalls, skipIfRecent: false },
  });

  return NextResponse.json({
    ok: true,
    message: `Ingestion job queued for "${topic}"`,
    topic,
    maxSearchCalls,
  });
}
