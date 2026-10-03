import { NextRequest, NextResponse } from 'next/server';
import { db, query } from '@/db';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    const cleanEmail = email?.trim()?.toLowerCase();

    if (!cleanEmail) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Auto-confirm the user in Supabase auth.users
    await query(
      `UPDATE auth.users 
       SET email_confirmed_at = COALESCE(email_confirmed_at, now())
       WHERE LOWER(email) = $1`,
      [cleanEmail]
    );

    return NextResponse.json({ success: true, confirmed: true });
  } catch (error) {
    console.error('[API auth/confirm] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
