import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';
import { db } from '@/db';
import { users, watchHistory } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ completedIds: [] });
    }

    // Ensure user exists in our Postgres users table
    await db.insert(users).values({ id: user.id, email: user.email ?? '' }).onConflictDoNothing();

    // Query watch history / progress
    const rows = await db
      .select({ videoId: watchHistory.videoId })
      .from(watchHistory)
      .where(and(eq(watchHistory.userId, user.id), eq(watchHistory.completed, true)));

    return NextResponse.json({ completedIds: rows.map((r) => r.videoId) });
  } catch (error) {
    console.error('[API user/progress GET] Error:', error);
    return NextResponse.json({ completedIds: [] }, { status: 500 });
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

    const { videoId } = await request.json();
    if (!videoId) {
      return NextResponse.json({ error: 'videoId is required' }, { status: 400 });
    }

    // Ensure user exists in Postgres
    await db.insert(users).values({ id: user.id, email: user.email ?? '' }).onConflictDoNothing();

    // Check if progress row already exists
    const existing = await db
      .select()
      .from(watchHistory)
      .where(and(eq(watchHistory.userId, user.id), eq(watchHistory.videoId, videoId)));

    if (existing.length > 0) {
      const isNowCompleted = !existing[0].completed;
      await db
        .update(watchHistory)
        .set({ completed: isNowCompleted, watchedAt: new Date() })
        .where(eq(watchHistory.id, existing[0].id));

      return NextResponse.json({ completed: isNowCompleted });
    } else {
      await db.insert(watchHistory).values({
        userId: user.id,
        videoId,
        completed: true,
        watchedAt: new Date(),
      });
      return NextResponse.json({ completed: true });
    }
  } catch (error) {
    console.error('[API user/progress POST] Error:', error);
    return NextResponse.json({ error: 'Failed to update progress' }, { status: 500 });
  }
}
