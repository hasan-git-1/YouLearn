-- Tubiq — Initial Database Migration
-- Run against a Supabase Postgres instance (pgvector enabled by default)
-- Or run: CREATE EXTENSION IF NOT EXISTS vector; on self-hosted Postgres first.

-- ─── Extensions ──────────────────────────────────────────────────────────────

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm; -- for trigram similarity search

-- ─── users ────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS users (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email       TEXT UNIQUE NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── user_profiles ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS user_profiles (
  user_id        UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  difficulty_pref TEXT,
  goals          TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── topics ───────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS topics (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name           TEXT NOT NULL,
  slug           TEXT NOT NULL,
  description    TEXT,
  content_source TEXT NOT NULL DEFAULT 'youtube',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS topics_slug_idx ON topics(slug);

-- ─── searches ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS searches (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID REFERENCES users(id) ON DELETE SET NULL,
  query      TEXT NOT NULL,
  topic_id   UUID REFERENCES topics(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── channels ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS channels (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  youtube_channel_id  TEXT NOT NULL,
  name                TEXT NOT NULL,
  description         TEXT,
  subscriber_count    BIGINT,
  video_count         INTEGER,
  thumbnail_url       TEXT,
  content_source      TEXT NOT NULL DEFAULT 'youtube',
  last_synced_at      TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS channels_youtube_channel_id_idx
  ON channels(youtube_channel_id, content_source);

-- ─── playlists ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS playlists (
  id                        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  youtube_playlist_id       TEXT NOT NULL,
  channel_id                UUID REFERENCES channels(id) ON DELETE SET NULL,
  title                     TEXT NOT NULL,
  video_count               INTEGER,
  is_course                 BOOLEAN NOT NULL DEFAULT FALSE,
  course_confidence         REAL,
  difficulty                TEXT NOT NULL DEFAULT 'unknown',
  estimated_duration_seconds BIGINT,
  content_source            TEXT NOT NULL DEFAULT 'youtube',
  last_synced_at            TIMESTAMPTZ,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS playlists_youtube_playlist_id_idx
  ON playlists(youtube_playlist_id, content_source);

-- ─── videos ───────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS videos (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  youtube_video_id  TEXT NOT NULL,
  channel_id        UUID REFERENCES channels(id) ON DELETE SET NULL,
  playlist_id       UUID REFERENCES playlists(id) ON DELETE SET NULL,
  title             TEXT NOT NULL,
  description       TEXT,
  thumbnail_url     TEXT,
  published_at      TIMESTAMPTZ,
  duration_seconds  INTEGER,
  view_count        BIGINT,
  like_count        BIGINT,
  content_type      TEXT NOT NULL DEFAULT 'video',
  difficulty        TEXT NOT NULL DEFAULT 'unknown',
  ai_summary        TEXT,
  ai_topics         TEXT[] NOT NULL DEFAULT '{}',
  -- Phase 2: semantic search embedding (1536 dims = OpenAI/Gemini text-embedding)
  embedding         vector(1536),
  transcript_status TEXT NOT NULL DEFAULT 'none',
  content_source    TEXT NOT NULL DEFAULT 'youtube',
  last_synced_at    TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS videos_youtube_video_id_idx
  ON videos(youtube_video_id, content_source);

CREATE INDEX IF NOT EXISTS videos_content_type_idx ON videos(content_type);
CREATE INDEX IF NOT EXISTS videos_published_at_idx ON videos(published_at DESC);
CREATE INDEX IF NOT EXISTS videos_channel_id_idx   ON videos(channel_id);

-- Full-text search index (tsvector) — covers title + description
ALTER TABLE videos ADD COLUMN IF NOT EXISTS
  search_vector tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'B')
  ) STORED;

CREATE INDEX IF NOT EXISTS videos_search_vector_idx ON videos USING GIN(search_vector);

-- HNSW index for Phase 2 semantic search (created now, used later)
-- Using cosine distance — suitable for normalized embeddings
CREATE INDEX IF NOT EXISTS videos_embedding_hnsw_idx
  ON videos USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- ─── playlist_items ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS playlist_items (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  playlist_id UUID NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
  video_id    UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  position    INTEGER NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS playlist_items_playlist_video_idx
  ON playlist_items(playlist_id, video_id);

CREATE INDEX IF NOT EXISTS playlist_items_playlist_position_idx
  ON playlist_items(playlist_id, position);

-- ─── video_topics ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS video_topics (
  video_id        UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  topic_id        UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  relevance_score REAL NOT NULL DEFAULT 1.0,
  PRIMARY KEY (video_id, topic_id)
);

CREATE INDEX IF NOT EXISTS video_topics_topic_idx ON video_topics(topic_id);

-- ─── user_interests (Phase 4) ─────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS user_interests (
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  topic_id   UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  score      REAL NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, topic_id)
);

-- ─── learning_paths ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS learning_paths (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic_id     UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  ai_generated BOOLEAN NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── learning_path_items ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS learning_path_items (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  path_id     UUID NOT NULL REFERENCES learning_paths(id) ON DELETE CASCADE,
  -- Exactly one of video_id / playlist_id must be non-null
  video_id    UUID REFERENCES videos(id) ON DELETE CASCADE,
  playlist_id UUID REFERENCES playlists(id) ON DELETE CASCADE,
  level       INTEGER NOT NULL DEFAULT 1,
  position    INTEGER NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT lpi_one_content_ref CHECK (
    (video_id IS NOT NULL)::int + (playlist_id IS NOT NULL)::int = 1
  )
);

CREATE INDEX IF NOT EXISTS lpi_path_position_idx
  ON learning_path_items(path_id, level, position);

-- ─── user_progress ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS user_progress (
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  path_id      UUID NOT NULL REFERENCES learning_paths(id) ON DELETE CASCADE,
  item_id      UUID NOT NULL REFERENCES learning_path_items(id) ON DELETE CASCADE,
  status       TEXT NOT NULL DEFAULT 'not_started',
  completed_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, path_id, item_id)
);

-- ─── saved_content ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS saved_content (
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL,
  content_id   UUID NOT NULL,
  saved_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, content_type, content_id)
);

-- ─── watch_history ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS watch_history (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  video_id      UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  watch_seconds INTEGER NOT NULL DEFAULT 0,
  completed     BOOLEAN NOT NULL DEFAULT FALSE,
  watched_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS watch_history_user_video_idx ON watch_history(user_id, video_id);

-- ─── user_events ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS user_events (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID REFERENCES users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  payload    JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS user_events_user_idx ON user_events(user_id);
CREATE INDEX IF NOT EXISTS user_events_type_idx ON user_events(event_type);

-- ─── ingestion_jobs ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS ingestion_jobs (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic        TEXT NOT NULL,
  status       TEXT NOT NULL DEFAULT 'pending',
  units_spent  INTEGER NOT NULL DEFAULT 0,
  started_at   TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ingestion_jobs_topic_idx  ON ingestion_jobs(topic);
CREATE INDEX IF NOT EXISTS ingestion_jobs_status_idx ON ingestion_jobs(status);

-- ─── quota_tracking ───────────────────────────────────────────────────────────
-- Single-row table (keyed by date) for daily YouTube API quota tracking

CREATE TABLE IF NOT EXISTS quota_tracking (
  date        DATE PRIMARY KEY,
  units_used  INTEGER NOT NULL DEFAULT 0,
  daily_limit INTEGER NOT NULL DEFAULT 10000,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Seed topics ──────────────────────────────────────────────────────────────

INSERT INTO topics (name, slug, description) VALUES
  ('Full Stack Web Development', 'full-stack-web-development', 'End-to-end web development covering frontend, backend, and deployment.'),
  ('AI Engineering', 'ai-engineering', 'Building production AI systems, LLM applications, and MLOps pipelines.'),
  ('Data Science', 'data-science', 'Data analysis, visualization, statistics, and predictive modeling.'),
  ('Machine Learning', 'machine-learning', 'Algorithms, model training, evaluation, and deployment.'),
  ('Python Programming', 'python-programming', 'Python fundamentals, advanced patterns, and ecosystem tools.'),
  ('JavaScript TypeScript', 'javascript-typescript', 'JavaScript and TypeScript for web and Node.js development.'),
  ('System Design', 'system-design', 'Designing scalable, reliable distributed systems and architectures.'),
  ('DevOps Cloud Engineering', 'devops-cloud-engineering', 'CI/CD, Docker, Kubernetes, AWS, GCP, and cloud-native practices.'),
  ('Cybersecurity', 'cybersecurity', 'Security fundamentals, ethical hacking, and defensive practices.'),
  ('Digital Marketing', 'digital-marketing', 'SEO, content marketing, paid ads, analytics, and growth strategies.'),
  ('Product Management', 'product-management', 'Product strategy, roadmapping, user research, and stakeholder management.'),
  ('UX Design', 'ux-design', 'User experience design, Figma, prototyping, and usability testing.'),
  ('Stock Market Basics', 'stock-market-basics', 'Equity markets, technical analysis, fundamental analysis, and trading.'),
  ('Personal Finance', 'personal-finance', 'Budgeting, investing, tax planning, and wealth building.'),
  ('Entrepreneurship', 'entrepreneurship', 'Starting, building, and scaling a business from idea to revenue.'),
  ('UPSC Preparation', 'upsc-preparation', 'Civil services exam preparation: GS, CSAT, optionals, and essay.'),
  ('Physics JEE NEET', 'physics-jee-neet', 'Physics for JEE Main, JEE Advanced, and NEET entrance exams.'),
  ('Mathematics', 'mathematics', 'Calculus, algebra, statistics, discrete math, and competitive math.'),
  ('English Communication', 'english-communication', 'Spoken English, business writing, IELTS/TOEFL, and presentation skills.'),
  ('Graphic Design', 'graphic-design', 'Visual design principles, Adobe tools, Canva, and brand identity.'),
  ('Video Editing', 'video-editing', 'Premiere Pro, DaVinci Resolve, After Effects, and YouTube content creation.'),
  ('React Development', 'react-development', 'React.js fundamentals, hooks, state management, and ecosystem.'),
  ('Next.js', 'nextjs', 'Next.js App Router, server components, deployment, and full-stack patterns.'),
  ('Node.js', 'nodejs', 'Node.js fundamentals, Express, APIs, and server-side JavaScript.'),
  ('Database Engineering', 'database-engineering', 'SQL, PostgreSQL, NoSQL, query optimization, and database design.')
ON CONFLICT (slug) DO NOTHING;
