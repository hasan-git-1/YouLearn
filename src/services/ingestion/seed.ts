/**
 * YouLearn — Seed Script (Phase 1A)
 *
 * Runs the full ingestion pipeline for all 25 seed topics.
 * Run OFFLINE before public launch:
 *
 *   npx tsx src/services/ingestion/seed.ts
 *
 * Or to ingest a single topic:
 *
 *   npx tsx src/services/ingestion/seed.ts "Full Stack Web Development"
 *
 * Quota budget: 25 topics × ~600 units = ~15,000 units
 * This will EXCEED a single day's quota (10,000 units).
 * The script automatically pauses when quota is low and resumes next day.
 *
 * Typical run time: ~2-3 days for all 25 topics at safe quota usage.
 * Run with --fast flag to do 5 topics per day:
 *
 *   npx tsx src/services/ingestion/seed.ts --fast
 */

import { loadEnvConfig } from '@next/env';

loadEnvConfig(process.cwd());

// All 25 seed topics (must match the slugs in 0001_initial.sql)
const SEED_TOPICS = [
  'Full Stack Web Development',
  'AI Engineering',
  'Data Science',
  'Machine Learning',
  'Python Programming',
  'JavaScript TypeScript',
  'System Design',
  'DevOps Cloud Engineering',
  'Cybersecurity',
  'Digital Marketing',
  'Product Management',
  'UX Design',
  'Stock Market Basics',
  'Personal Finance',
  'Entrepreneurship',
  'UPSC Preparation',
  'Physics JEE NEET',
  'Mathematics',
  'English Communication',
  'Graphic Design',
  'Video Editing',
  'React Development',
  'Next.js',
  'Node.js',
  'Database Engineering',
];

const UNITS_PER_TOPIC = 600; // conservative estimate
const SAFE_REMAINING_UNITS = 1000; // always keep 1000 units in reserve
const DELAY_BETWEEN_TOPICS_MS = 5000; // 5 seconds between jobs

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  // These modules create database clients, so import them after .env.local loads.
  const [{ ingestTopic }, { getQuotaState }] = await Promise.all([
    import('./worker'),
    import('@/services/youtube/quota'),
  ]);
  const args = process.argv.slice(2);

  // Single topic mode
  if (args.length > 0 && !args[0].startsWith('--')) {
    const topic = args.join(' ');
    console.log(`\n[seed] Ingesting single topic: "${topic}"`);
    try {
      const result = await ingestTopic({ topic, maxSearchCalls: 5, skipIfRecent: true });
      console.log(`[seed] Done:`, result);
    } catch (error) {
      console.error(`[seed] Failed:`, error);
      process.exit(1);
    }
    process.exit(0);
  }

  // Batch mode
  const fastMode = args.includes('--fast');
  const maxPerRun = fastMode ? 5 : 25;

  console.log(`\n[seed] Starting batch ingestion for ${Math.min(SEED_TOPICS.length, maxPerRun)} topics`);
  console.log(`[seed] Fast mode: ${fastMode}`);

  let ingested = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < SEED_TOPICS.length && ingested + skipped < maxPerRun; i++) {
    const topic = SEED_TOPICS[i];

    // Check quota before each topic
    const quotaState = await getQuotaState();
    const remaining = quotaState.dailyLimit - quotaState.unitsUsed;

    if (remaining < SAFE_REMAINING_UNITS + UNITS_PER_TOPIC) {
      console.warn(
        `\n[seed] ⚠️  Quota low (${remaining} units remaining). Pausing.`
      );
      console.warn(`[seed] Ingested ${ingested} topics. Resume tomorrow with remaining topics.`);
      console.warn(`[seed] Remaining topics: ${SEED_TOPICS.slice(i).join(', ')}`);
      break;
    }

    console.log(`\n[seed] [${i + 1}/${SEED_TOPICS.length}] Ingesting: "${topic}"`);
    console.log(`[seed] Quota status: ${quotaState.unitsUsed}/${quotaState.dailyLimit} units used`);

    try {
      const result = await ingestTopic({
        topic,
        maxSearchCalls: 5,
        skipIfRecent: true,
      });

      if (result.videosIngested === 0) {
        skipped++;
        console.log(`[seed] Skipped (already ingested recently)`);
      } else {
        ingested++;
        console.log(`[seed] ✓ ${result.videosIngested} videos, ${result.channelsIngested} channels, ${result.playlistsIngested} playlists`);
      }
    } catch (error) {
      failed++;
      const isQuota = (error as Error)?.name === 'QuotaExceededError';
      if (isQuota) {
        console.error(`[seed] Quota exceeded. Stopping.`);
        break;
      }
      console.error(`[seed] ✗ Failed for "${topic}":`, (error as Error).message);
    }

    // Pause between topics to avoid rate limiting
    if (i < SEED_TOPICS.length - 1) {
      await sleep(DELAY_BETWEEN_TOPICS_MS);
    }
  }

  console.log(`\n[seed] ─────────────────────────────────`);
  console.log(`[seed] Summary:`);
  console.log(`[seed]   Ingested: ${ingested}`);
  console.log(`[seed]   Skipped:  ${skipped}`);
  console.log(`[seed]   Failed:   ${failed}`);

  const finalQuota = await getQuotaState();
  console.log(`[seed]   Quota used today: ${finalQuota.unitsUsed}/${finalQuota.dailyLimit}`);
  console.log(`[seed] ─────────────────────────────────\n`);

  process.exit(failed > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error('[seed] Fatal error:', error);
  process.exit(1);
});
