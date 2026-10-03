/**
 * Tubiq — Inngest background job functions (Inngest v4.x)
 *
 * In Inngest v4, createFunction signature is 2-arg:
 *   inngest.createFunction(options_with_trigger_inside, handler)
 *
 * The trigger is part of the options object as `triggers` or via the
 * `trigger` property in the options. The handler receives { event, step }.
 */

import { Inngest } from 'inngest';
import { ingestTopic } from '@/services/ingestion/worker';
import { SEED_TOPICS } from '@/services/ingestion/seed-topics';

// ─── Inngest client ───────────────────────────────────────────────────────────

export const inngest = new Inngest({ id: 'tubiq' });

// ─── Ingestion job ────────────────────────────────────────────────────────────

export const ingestTopicJob = inngest.createFunction(
  {
    id: 'ingest-topic',
    name: 'Ingest Topic from YouTube',
    triggers: [{ event: 'app/topic.ingest' }],
    concurrency: {
      limit: 3,
      key: 'event.data.topic',
    },
    rateLimit: {
      limit: 1,
      period: '1h' as const,
      key: 'event.data.topic',
    },
    retries: 2,
  },
  async ({ event, step }) => {
    const { topic, maxSearchCalls = 6, skipIfRecent = false } = event.data;

    const result = await step.run('ingest-topic-from-youtube', async () => {
      return ingestTopic({ topic, maxSearchCalls, skipIfRecent });
    });

    return result;
  }
);

// ─── Weekly resync cron ──────────────────────────────────────────────────────

export const weeklyResyncJob = inngest.createFunction(
  {
    id: 'weekly-resync',
    name: 'Weekly YouTube Content Resync',
    triggers: [{ cron: '0 2 * * 0' }],
    retries: 1,
  },
  async ({ step }) => {
    await step.sendEvent(
      'trigger-topic-resync',
      SEED_TOPICS.map((topic) => ({
        name: 'app/topic.ingest' as const,
        data: { topic: topic.name, maxSearchCalls: 6, skipIfRecent: false },
      }))
    );

    return { topicsQueued: SEED_TOPICS.length };
  }
);

// Export all functions for the Inngest route handler
export const inngestFunctions = [ingestTopicJob, weeklyResyncJob];
