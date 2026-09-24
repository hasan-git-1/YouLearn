/**
 * YouLearn — YouTube API Quota Tracker
 *
 * Enforces the hard rule from spec section 1:
 *   - Log/alert at 80% of daily quota (8,000 units)
 *   - Throw QuotaExceededError at 90% (9,000 units) — leaves 10% buffer
 *   - Daily limit: 10,000 units (YouTube default)
 *
 * Quota is stored in the `quota_tracking` table (one row per day).
 * This is intentionally simple — no Redis, no in-memory cache —
 * because ingestion jobs are not high-frequency and Postgres is fine here.
 */

import { query } from '@/db';
import { QuotaExceededError, QuotaState } from '@/types';

const DAILY_LIMIT = 10_000;
const WARN_THRESHOLD = 8_000;  // 80%
const HARD_LIMIT = 9_000;      // 90%

function todayDate(): string {
  return new Date().toISOString().split('T')[0]; // YYYY-MM-DD
}

/**
 * Returns the current quota state for today.
 * Creates a row if one doesn't exist yet.
 */
export async function getQuotaState(): Promise<QuotaState> {
  const date = todayDate();
  const rows = await query<{ units_used: number; daily_limit: number }>(
    `INSERT INTO quota_tracking (date, units_used, daily_limit)
     VALUES ($1, 0, $2)
     ON CONFLICT (date) DO UPDATE SET updated_at = NOW()
     RETURNING units_used, daily_limit`,
    [date, DAILY_LIMIT]
  );

  return {
    date,
    unitsUsed: rows[0].units_used,
    dailyLimit: rows[0].daily_limit,
  };
}

/**
 * Adds `units` to today's count.
 * Throws QuotaExceededError if the new total would exceed HARD_LIMIT.
 * Logs a warning if the new total exceeds WARN_THRESHOLD.
 *
 * Returns updated QuotaState.
 */
export async function consumeQuota(units: number): Promise<QuotaState> {
  const date = todayDate();

  const rows = await query<{ units_used: number; daily_limit: number }>(
    `INSERT INTO quota_tracking (date, units_used, daily_limit)
     VALUES ($1, $2, $3)
     ON CONFLICT (date) DO UPDATE
       SET units_used = quota_tracking.units_used + $2,
           updated_at = NOW()
     RETURNING units_used, daily_limit`,
    [date, units, DAILY_LIMIT]
  );

  const state: QuotaState = {
    date,
    unitsUsed: rows[0].units_used,
    dailyLimit: rows[0].daily_limit,
  };

  if (state.unitsUsed >= HARD_LIMIT) {
    console.error(
      `[QUOTA] HARD LIMIT reached: ${state.unitsUsed}/${state.dailyLimit} units used today. No more YouTube API calls until midnight UTC.`
    );
    throw new QuotaExceededError(state.unitsUsed, state.dailyLimit);
  }

  if (state.unitsUsed >= WARN_THRESHOLD) {
    console.warn(
      `[QUOTA] WARNING: ${state.unitsUsed}/${state.dailyLimit} units used today (${Math.round((state.unitsUsed / state.dailyLimit) * 100)}%). Consider pausing ingestion.`
    );
  }

  return state;
}

/**
 * Check if we have enough headroom for an operation without consuming quota.
 * Use before starting a large ingestion job.
 */
export async function hasQuotaFor(units: number): Promise<boolean> {
  const state = await getQuotaState();
  return state.unitsUsed + units < HARD_LIMIT;
}
