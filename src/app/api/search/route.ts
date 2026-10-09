/**
 * Tubiq — /api/search route
 *
 * GET /api/search?q=full+stack+development&limit=12
 *
 * Flow:
 *   1. Classify query intent (rule-based, instant)
 *   2. Resolve seeded topic (if applicable)
 *   3. Run keyword full-text search against Postgres
 *   4. If no results → live fallback via fastSearch (direct YouTube)
 *   5. If still nothing → cold-start: enqueue background ingestion
 *   6. Return categorized results with intent + ranked category order
 *
 * Error handling:
 *   - DB unreachable → 503 with "service_unavailable" error
 *   - DB query error → 500 with "query_error" error
 *   - These are DISTINCT errors, not the same generic message
 */

import { NextRequest, NextResponse } from 'next/server';
import { classifyIntent } from '@/services/search/intent';
import { keywordSearch } from '@/services/search/keyword';
import { inngest } from '@/jobs/ingestion';
import { db, checkDbConnection, DatabaseConnectionError } from '@/db';
import { searches } from '@/db/schema';
import { and, eq, gte, sql } from 'drizzle-orm';
import type { SearchResponse } from '@/types';
import { matchTopic, TOPICS } from '@/config/topics';

const COLD_START_RATE_LIMIT = 3; // max cold-start triggers per user per day

export async function GET(request: NextRequest) {
  const totalStart = performance.now();

  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q')?.trim();
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '12', 10), 50);

    const topicMatch = matchTopic(q ?? '');
    if (!topicMatch.matched) {
      return NextResponse.json({
        matched: false,
        message: "This topic is unavailable right now. We're expanding our learning universe.",
        topics: TOPICS,
      }, { headers: { 'X-Robots-Tag': 'noindex' } });
    }

    // ── Step 1: Classify intent ──────────────────────────────────────────
    const searchQuery = q ?? '';
    const intentResult = classifyIntent(searchQuery);

    // ── Step 2: Resolve seeded topic ─────────────────────────────────────
    const seededTopic = topicMatch.topic;
    if (seededTopic) {
      console.log(`[search] Resolved seeded topic: "${q}" → "${seededTopic.slug}"`);
    }

    // ── Step 3: Keyword search ───────────────────────────────────────────
    const dbStart = performance.now();
    let searchResult;
    try {
      searchResult = await keywordSearch({
        q: seededTopic.name,
        limit,
        pool: limit,
        topicSlug: seededTopic?.slug,
      });
      console.log(`[search] DB search took ${Math.round(performance.now() - dbStart)}ms — ${searchResult.totalResults} results`);
    } catch (dbError) {
      console.error('[search] DB query error:', dbError);

      // Distinguish connection error from query error
      try {
        await checkDbConnection();
      } catch (connError) {
        if (connError instanceof DatabaseConnectionError) {
          return NextResponse.json(
            {
              error: 'Service temporarily unavailable. Our database is unreachable.',
              errorType: 'service_unavailable',
            },
            { status: 503 }
          );
        }
      }

      return NextResponse.json(
        {
          error: 'Search query failed. Please try again.',
          errorType: 'query_error',
        },
        { status: 500 }
      );
    }

    // ── Step 4: Log search (fire-and-forget, non-blocking) ───────────────
    // We don't block the response on this
    db.insert(searches).values({ query: searchQuery }).catch(() => {
      // Non-critical — don't fail the request if logging fails
    });

    // ── Step 5: Live fallback + Cold-start handling ──────────────────────
    if (searchResult.totalResults === 0) {
      // Try live fallback first
      let liveResults = null;
      try {
        const liveStart = performance.now();
        const { fastSearch } = await import('@/services/search/fast');
        liveResults = await fastSearch({ q: seededTopic.name });
        console.log(`[search] Live fallback took ${Math.round(performance.now() - liveStart)}ms — ${liveResults.totalResults} results`);
      } catch (e) {
        console.error('[search] Live fallback failed:', e);
      }

      // If live fallback returned results, use them
      if (liveResults && liveResults.totalResults > 0) {
        const response: SearchResponse = {
          query: searchQuery,
          intent: intentResult.intent,
          categoryOrder: intentResult.categoryOrder,
          results: {
            courses: liveResults.courses,
            videos: liveResults.videos,
            podcasts: liveResults.podcasts,
            shorts: liveResults.shorts,
            creators: liveResults.creators,
          },
          coldStart: false,
          totalResults: liveResults.totalResults,
        };

        console.log(`[search] Total pipeline for "${q}": ${Math.round(performance.now() - totalStart)}ms (live fallback)`);

        // Also trigger background ingestion so next search is from DB
        void triggerBackgroundIngestion(seededTopic.name, request);

        return NextResponse.json(response, {
          headers: {
            // Shorter cache for live results
            'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
          },
        });
      }

      // True cold start — no results from either path
      await triggerBackgroundIngestion(seededTopic.name, request);

      const response: SearchResponse = {
        query: searchQuery,
        intent: intentResult.intent,
        categoryOrder: intentResult.categoryOrder,
        results: { courses: [], videos: [], podcasts: [], shorts: [], creators: [] },
        coldStart: true,
        totalResults: 0,
      };

      return NextResponse.json(response);
    }

    // ── Step 6: Return results ───────────────────────────────────────────
    const response: SearchResponse = {
      query: searchQuery,
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

    console.log(`[search] Total pipeline for "${q}": ${Math.round(performance.now() - totalStart)}ms (DB)`);

    return NextResponse.json(response, {
      headers: {
        // Cache search results for 5 minutes — content doesn't change that fast
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('[search] Unhandled error:', error);
    return NextResponse.json(
      {
        error: 'An unexpected error occurred. Please try again.',
        errorType: 'internal_error',
      },
      { status: 500 }
    );
  }
}

/**
 * Rate-limited background ingestion trigger. Checks if we've already
 * triggered ingestion for this query today before sending another job.
 */
async function triggerBackgroundIngestion(q: string, request: NextRequest) {
  try {
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
      await inngest.send({
        name: 'app/topic.ingest',
        data: {
          topic: q,
          maxSearchCalls: 5,
          skipIfRecent: false,
        },
      });

      console.log(`[search] Cold-start ingestion triggered for: "${q}"`);
    }
  } catch (e) {
    console.error('[search] Failed to trigger background ingestion:', e);
  }
}
