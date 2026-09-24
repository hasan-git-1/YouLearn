/**
 * Tubiq — Drizzle DB client singleton
 *
 * Uses a connection pool via 'pg'. The singleton pattern prevents
 * exhausting connections during Next.js hot-reload in development.
 */

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';
import * as relations from './relations';

declare global {
  // Allow reuse of the pool across hot-reloads in development
  // eslint-disable-next-line no-var
  var _pgPool: Pool | undefined;
}

function createPool(): Pool {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  return new Pool({
    connectionString,
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
    ssl:
      process.env.NODE_ENV === 'production'
        ? { rejectUnauthorized: false }
        : false,
  });
}

// Reuse existing pool in development to survive hot-reloads
const pool =
  process.env.NODE_ENV === 'production'
    ? createPool()
    : (global._pgPool ??= createPool());

export const db = drizzle(pool, { schema: { ...schema, ...relations } });

export { pool };

/**
 * Run a raw SQL query. Used by the migration runner and quota tracker.
 */
export async function query<T = Record<string, unknown>>(
  sql: string,
  params?: unknown[]
): Promise<T[]> {
  const result = await pool.query(sql, params);
  return result.rows as T[];
}
