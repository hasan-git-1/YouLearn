import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';
import { db } from '@/db';
import { users, savedContent, videos, playlists } from '@/db/schema';
import { eq, and, desc, inArray } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      const requestedIds = new URL(request.url).searchParams.get('ids');
      const ids = requestedIds
        ? [...new Set(requestedIds.split(',').map((id) => id.trim()).filter(Boolean))]
        : [];
      const isUuid = (id: string) =>
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

      if (ids.length > 100 || ids.some((id) => !isUuid(id))) {
        return NextResponse.json({ error: 'Invalid saved item IDs' }, { status: 400 });
      }

      const [savedVideos, savedCourses] = ids.length > 0
        ? await Promise.all([
            db.query.videos.findMany({
              where: inArray(videos.id, ids),
              with: { channel: true },
            }),
            db.query.playlists.findMany({
              where: inArray(playlists.id, ids),
              with: { channel: true },
            }),
          ])
        : [[], []];

      return NextResponse.json({
        savedIds: ids,
        videos: savedVideos,
        courses: savedCourses,
      });
    }

    // Ensure user in Postgres
    await db.insert(users).values({ id: user.id, email: user.email ?? '' }).onConflictDoNothing();

    const rows = await db
      .select()
      .from(savedContent)
      .where(eq(savedContent.userId, user.id))
      .orderBy(desc(savedContent.savedAt));

    const savedIds = rows.map((r) => r.contentId);

    // Fetch video details
    const videoIds = rows.filter((r) => r.contentType === 'video').map((r) => r.contentId);
    const playlistIds = rows.filter((r) => r.contentType === 'playlist').map((r) => r.contentId);

    const savedVideos = videoIds.length > 0
      ? await db.query.videos.findMany({
          where: (videos, { inArray }) => inArray(videos.id, videoIds),
          with: { channel: true },
        })
      : [];

    const savedCourses = playlistIds.length > 0
      ? await db.query.playlists.findMany({
          where: (playlists, { inArray }) => inArray(playlists.id, playlistIds),
          with: { channel: true },
        })
      : [];

    return NextResponse.json({
      savedIds,
      videos: savedVideos,
      courses: savedCourses,
    });
  } catch (error) {
    console.error('[API user/saved GET] Error:', error);
    return NextResponse.json({ error: 'Failed to load saved content' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { contentId, contentType = 'video' } = await request.json();
    if (!contentId || typeof contentId !== 'string') {
      return NextResponse.json({ error: 'contentId is required' }, { status: 400 });
    }
    if (contentType !== 'video' && contentType !== 'playlist') {
      return NextResponse.json({ error: 'Unsupported contentType' }, { status: 400 });
    }

    // Do not allow stale or fabricated IDs to become saved_content orphans.
    const contentExists = contentType === 'video'
      ? await db.query.videos.findFirst({ where: eq(videos.id, contentId), columns: { id: true } })
      : await db.query.playlists.findFirst({ where: eq(playlists.id, contentId), columns: { id: true } });
    if (!contentExists) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 });
    }

    await db.insert(users).values({ id: user.id, email: user.email ?? '' }).onConflictDoNothing();

    const existing = await db
      .select()
      .from(savedContent)
      .where(
        and(
          eq(savedContent.userId, user.id),
          eq(savedContent.contentType, contentType),
          eq(savedContent.contentId, contentId)
        )
      );

    if (existing.length > 0) {
      // Remove bookmark
      await db
        .delete(savedContent)
        .where(
          and(
            eq(savedContent.userId, user.id),
            eq(savedContent.contentType, contentType),
            eq(savedContent.contentId, contentId)
          )
        );
      return NextResponse.json({ saved: false });
    } else {
      // Add bookmark
      await db.insert(savedContent).values({
        userId: user.id,
        contentType,
        contentId,
      });
      return NextResponse.json({ saved: true });
    }
  } catch (error) {
    console.error('[API user/saved POST] Error:', error);
    return NextResponse.json({ error: 'Failed to toggle bookmark' }, { status: 500 });
  }
}
