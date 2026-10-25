/**
 * Tubiq — /api/search route
 *
 * GET /api/search?q=full+stack+development&limit=12
 *
 * Flow:
 *   1. Classify query intent (rule-based, instant)
 *   2. Resolve seeded topic (if applicable)
 *   3. Run keyword full-text search against Postgres
 *   4. If no results → return a cold-start response and enqueue background ingestion
 *   5. Return categorized results with intent + ranked category order
 *
 * Error handling:
 *   - DB unreachable → 503 with "service_unavailable" error
 *   - DB query error → 500 with "query_error" error
 *   - These are DISTINCT errors, not the same generic message
 */

import { after, NextRequest, NextResponse } from 'next/server';
import { classifyIntent } from '@/services/search/intent';
import { keywordSearch } from '@/services/search/keyword';
import { inngest } from '@/jobs/client';
import { db, checkDbConnection, DatabaseConnectionError } from '@/db';
import { searches } from '@/db/schema';
import type { SearchResponse } from '@/types';
import { matchTopic, TOPICS } from '@/config/topics';

export async function GET(request: NextRequest) {
  const totalStart = performance.now();

  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q')?.trim();
    const requestedLimit = Number.parseInt(searchParams.get('limit') ?? '12', 10);
    const limit = Number.isFinite(requestedLimit) && requestedLimit > 0
      ? Math.min(requestedLimit, 50)
      : 12;

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
    void db.insert(searches).values({ query: searchQuery }).catch((error) => {
      console.error('[search] Failed to log search:', error);
    });

    // ── Step 5: Cold-start handling ──────────────────────────────────────
    if (searchResult.totalResults === 0) {
      after(() => triggerBackgroundIngestion(seededTopic.name));

      const response: SearchResponse = {
        query: searchQuery,
        intent: intentResult.intent,
        categoryOrder: intentResult.categoryOrder,
        results: { courses: [], videos: [], podcasts: [], shorts: [], creators: [] },
        coldStart: true,
        totalResults: 0,
      };

      return NextResponse.json(response, {
        headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' },
      });
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
 * Inngest applies a per-topic rate limit to deduplicate cold-start events.
 */
async function triggerBackgroundIngestion(q: string) {
  try {
    await inngest.send({
      name: 'app/topic.ingest',
      data: {
        topic: q,
        maxSearchCalls: 5,
        skipIfRecent: false,
      },
    });
    console.log(`[search] Cold-start ingestion queued for: "${q}"`);
  } catch (e) {
    console.error('[search] Failed to trigger background ingestion:', e);
  }
}
