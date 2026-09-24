/**
 * GET /api/videos/:id
 * Returns a single video with joined channel data.
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { videos, channels, playlists } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const video = await db.query.videos.findFirst({
    where: eq(videos.id, id),
    with: {
      channel: true,
    },
  });

  if (!video) {
    return NextResponse.json({ error: 'Video not found' }, { status: 404 });
  }

  // Get playlist info if video belongs to one
  let playlist = null;
  if (video.playlistId) {
    playlist = await db.query.playlists.findFirst({
      where: eq(playlists.id, video.playlistId),
    });
  }

  return NextResponse.json({ video, playlist });
}
