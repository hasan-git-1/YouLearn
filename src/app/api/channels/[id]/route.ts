/**
 * GET /api/channels/:id
 * Returns channel with top videos.
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { channels, videos } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const channel = await db.query.channels.findFirst({
    where: eq(channels.id, id),
  });

  if (!channel) {
    return NextResponse.json({ error: 'Channel not found' }, { status: 404 });
  }

  // Get top videos for this channel
  const topVideos = await db.query.videos.findMany({
    where: eq(videos.channelId, id),
    orderBy: [desc(videos.viewCount)],
    limit: 20,
  });

  return NextResponse.json({ channel, videos: topVideos });
}
