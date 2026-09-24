/**
 * YouLearn — /api/inngest route handler
 *
 * Required for Inngest to work on Vercel.
 * Receives events from Inngest and dispatches to registered functions.
 */

import { serve } from 'inngest/next';
import { inngest, inngestFunctions } from '@/jobs/ingestion';

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: inngestFunctions,
});
