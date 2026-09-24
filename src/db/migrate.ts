/**
 * Database migration runner
 * Usage: npx tsx src/db/migrate.ts
 *
 * Runs 0001_initial.sql against the configured DATABASE_URL.
 * Safe to run multiple times — all statements use IF NOT EXISTS.
 */

import { loadEnvConfig } from '@next/env';
import { readFileSync } from 'fs';
import { join } from 'path';

loadEnvConfig(process.cwd());

async function main() {
  // Load the pool only after @next/env has read .env.local.
  const { pool } = await import('./index');
  const sqlPath = join(__dirname, 'migrations', '0001_initial.sql');
  const sql = readFileSync(sqlPath, 'utf8');

  console.log('[migrate] Connecting to database...');
  const client = await pool.connect();

  try {
    console.log('[migrate] Running 0001_initial.sql...');
    await client.query(sql);
    console.log('[migrate] ✓ Migration complete!');
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error('[migrate] ✗ Migration failed:', err.message);
  process.exit(1);
});
