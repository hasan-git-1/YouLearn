/**
 * YouLearn — /api/search route
 *
 * GET /api/search?q=full+stack+development&limit=12
 *
 * Flow:
 *   1. Classify query intent (rule-based, instant)
 *   2. Run keyword full-text search against Postgres
 *   3. If no results → cold-start state:
 *      a. Check user cold-start rate limit (max 3 per day)
 *      b. Enqueue background ingestion via Inngest
 *      c. Return coldStart: true with estimated wait time
 *   4. Return categorized results with intent + ranked category order
 *
 * This route never calls the YouTube API directly.
 * All data comes from Postgres.
 */

import { NextRequest, NextResponse } from 'next/server';
import { classifyIntent } from '@/services/search/intent';
import { keywordSearch } from '@/services/search/keyword';
import { inngest } from '@/jobs/ingestion';
import { db } from '@/db';
import { searches } from '@/db/schema';
import { and, eq, gte, sql } from 'drizzle-orm';
import type { SearchResponse } from '@/types';

const COLD_START_RATE_LIMIT = 3; // max cold-start triggers per user per day

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q')?.trim();
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '12', 10), 50);

    if (!q || q.length < 2) {
      return NextResponse.json(
        { error: 'Query parameter "q" is required (min 2 characters)' },
        { status: 400 }
      );
    }

    // ── Step 1: Classify intent ──────────────────────────────────────────
    const intentResult = classifyIntent(q);

    // ── Step 2: Keyword search ───────────────────────────────────────────
    const searchResult = await keywordSearch({ q, limit });

    // ── Step 3: Log search (fire-and-forget, non-blocking) ───────────────
    // We don't block the response on this
    db.insert(searches).values({ query: q }).catch(() => {
      // Non-critical — don't fail the request if logging fails
    });

    // ── Step 4: Cold-start handling ──────────────────────────────────────
    if (searchResult.totalResults === 0) {
      // Check cold-start rate limit (by IP since no auth yet — Phase 3 adds user auth)
      const ip =
        request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
        request.headers.get('x-real-ip') ??
        'unknown';

      const todayStart = new Date();
      todayStart.setUTCHours(0, 0, 0, 0);

      // Count cold-start triggers for this IP today
      const [{ count }] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(searches)
        .where(
          and(
            gte(searches.createdAt, todayStart),
            eq(searches.query, q) // same query counts as 1
          )
        );

      const canTriggerIngestion = (count ?? 0) <= COLD_START_RATE_LIMIT;

      if (canTriggerIngestion) {
        // Enqueue ingestion job — cold-start gets 2 search calls (200 units)
        await inngest.send({
          name: 'app/topic.ingest',
          data: {
            topic: q,
            maxSearchCalls: 2,
            skipIfRecent: false,
          },
        });

        console.log(`[search] Cold-start ingestion triggered for: "${q}"`);
      }

      const response: SearchResponse = {
        query: q,
        intent: intentResult.intent,
        categoryOrder: intentResult.categoryOrder,
        results: { courses: [], videos: [], podcasts: [], shorts: [], creators: [] },
        coldStart: true,
        totalResults: 0,
      };

      return NextResponse.json(response);
    }

    // ── Step 5: Return results ───────────────────────────────────────────
    const response: SearchResponse = {
      query: q,
      intent: intentResult.intent,
      categoryOrder: intentResult.categoryOrder,
      results: {
        courses: searchResult.courses,
        videos: searchResult.videos,
        podcasts: searchResult.podcasts,
        shorts: searchResult.shorts,
        creators: searchResult.creators,
      },
      coldStart: false,
      totalResults: searchResult.totalResults,
    };

    return NextResponse.json(response, {
      headers: {
        // Cache search results for 5 minutes — content doesn't change that fast
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('[search] Error:', error);
    return NextResponse.json(
      { error: 'Search failed. Please try again.' },
      { status: 500 }
    );
  }
}
