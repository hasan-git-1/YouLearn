/**
 * Database migration runner
 * Usage: npx tsx src/db/migrate.ts
 *
 * Runs all SQL migrations in src/db/migrations in sequence.
 * Safe to run multiple times.
 */

import { loadEnvConfig } from '@next/env';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

loadEnvConfig(process.cwd());

async function main() {
  const { pool } = await import('./index');
  const migrationsDir = join(__dirname, 'migrations');
  const files = readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  console.log('[migrate] Connecting to database...');
  const client = await pool.connect();

  try {
    for (const file of files) {
      console.log(`[migrate] Running ${file}...`);
      const sql = readFileSync(join(migrationsDir, file), 'utf8');
      await client.query(sql);
      console.log(`[migrate] ✓ ${file} applied successfully.`);
    }
    console.log('[migrate] ✓ All migrations complete!');
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error('[migrate] ✗ Migration failed:', err.message);
  process.exit(1);
});
