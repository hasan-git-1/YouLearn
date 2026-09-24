# Tubiq

AI-guided knowledge-discovery platform. Users type a learning goal; the app returns organized YouTube content (Courses, Videos, Podcasts, Shorts, Creators) from a pre-indexed database, plus an AI overview and learning path.

## Architecture

- **User-facing reads** → Postgres only (never live YouTube API)
- **YouTube API** → Background ingestion worker only, quota-tracked
- **Content classification** → Rule-based (Phase 1), LLM fallback (Phase 2)
- **Background jobs** → Inngest (ingestion + weekly resync)

## Getting Started

### 1. Setup environment

```bash
cp .env.local.example .env.local
# Fill in DATABASE_URL, YOUTUBE_API_KEY, Supabase keys, Inngest keys
```

### 2. Run the database migration

```bash
npx tsx src/db/migrate.ts
```

This creates all tables and inserts the 25 seed topics. Requires pgvector to be enabled on your Postgres instance (Supabase enables it by default).

### 3. Seed content (Phase 1A)

```bash
# Ingest a single topic (recommended for first test):
npx tsx src/services/ingestion/seed.ts "Full Stack Web Development"

# Ingest all 25 topics (runs across multiple days due to quota):
npm run db:seed
```

### 4. Start the dev server

```bash
npm run dev
```

### 5. Start Inngest dev server (for background jobs)

In a separate terminal:
```bash
npm run inngest:dev
```

## Project Structure

```
src/
  app/              Next.js App Router pages + API routes
  components/       Reusable UI components
  db/               Drizzle ORM schema, migrations, client
  features/         Feature-level components (search results)
  jobs/             Inngest background job definitions
  lib/              Shared utilities
  services/
    youtube/        YouTube API client (ONLY place googleapis is imported)
    ingestion/      Worker + seed script
    classification/ Rule-based content classifier
    search/         Full-text search + intent classifier
    ai/             AI service (Phase 1: stub, Phase 2: Gemini)
  types/            Shared TypeScript types
```

## Phase Status

- [x] **Phase 1A** — Ingestion + Data Foundation
- [x] **Phase 1B** — Search + Category Pages
- [ ] **Phase 2** — AI Layer (embeddings, overview, relevance blurbs)
- [ ] **Phase 3** — Learning Paths + Auth + Progress
- [ ] **Phase 4** — Personalization

## YouTube API Quota

Default quota: 10,000 units/day. The app enforces:
- **80% (8,000 units)** → Warning logged
- **90% (9,000 units)** → Ingestion blocked (`QuotaExceededError`)
- All tracking in `quota_tracking` Postgres table

Never call the YouTube API from frontend or API routes — only from `src/services/youtube/client.ts`.
