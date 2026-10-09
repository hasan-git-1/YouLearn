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

// ── Startup validation ─────────────────────────────────────────────────────
// In production, a missing DATABASE_URL is a fatal misconfiguration.
// In development, fall back to localhost for convenience.
if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
  console.error(
    '[DB] FATAL: DATABASE_URL environment variable is not set in production. '
    + 'The application cannot connect to the database. '
    + 'Set DATABASE_URL in your Render/Vercel environment variables.'
  );
}

function createPool(): Pool {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    if (process.env.NODE_ENV === 'production') {
      // Return a pool that will fail immediately with a clear message
      console.error('[DB] No DATABASE_URL — all queries will fail');
    }
    // Dev fallback
    return new Pool({
      connectionString: 'postgresql://postgres:postgres@localhost:5432/postgres',
      max: 10,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 10_000,
    });
  }

  // Strip sslmode from the URL so pg-connection-string does not force strict CA verification,
  // then explicitly configure ssl: { rejectUnauthorized: false } for managed Postgres (Supabase, Render, Neon, etc.)
  const cleanConnectionString = connectionString
    .replace(/[?&]sslmode=[^&]+/g, '')
    .replace(/\?$/, '');

  const isLocal = connectionString.includes('localhost') || connectionString.includes('127.0.0.1');

  return new Pool({
    connectionString: cleanConnectionString,
    // Pool sized for serverless-ish deployment: enough for concurrent requests
    // but not so many that we exhaust managed-DB connection limits
    max: 20,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
    ssl: isLocal ? false : { rejectUnauthorized: false },
  });
}

// Reuse existing pool in development to survive hot-reloads
const pool =
  process.env.NODE_ENV === 'production'
    ? createPool()
    : (global._pgPool ??= createPool());

export const db = drizzle(pool, { schema: { ...schema, ...relations } });

export { pool };

// ── Custom error class for DB connection failures ──────────────────────────

export class DatabaseConnectionError extends Error {
  readonly cause?: unknown;
  constructor(message: string, cause?: unknown) {
    super(message);
    this.cause = cause;
    this.name = 'DatabaseConnectionError';
  }
}

/**
 * Lightweight health check — runs `SELECT 1` to confirm the DB is reachable.
 * Returns true if reachable, throws DatabaseConnectionError otherwise.
 *
 * Use this to distinguish "DB unreachable" (ops issue) from
 * "DB reachable but query returned nothing" (expected cold-start case).
 */
export async function checkDbConnection(): Promise<boolean> {
  try {
    await pool.query('SELECT 1');
    return true;
  } catch (error) {
    console.error('[DB] Health check failed — database is unreachable:', error);
    throw new DatabaseConnectionError(
      'Database is unreachable. Check DATABASE_URL, network, and connection limits.',
      error
    );
  }
}

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
