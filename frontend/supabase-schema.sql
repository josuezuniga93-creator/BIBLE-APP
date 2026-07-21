-- Tulip Bible App — Supabase Schema
-- Run this in your Supabase project: Dashboard → SQL Editor → New query → paste → Run

-- ── User sync data table ──────────────────────────────────────────────────────
-- Stores localStorage key-value pairs per user for cross-device sync.
-- Each row = one localStorage key (e.g. 'ryc-vcolor-1-3', 'tulip-church-analyses')

CREATE TABLE IF NOT EXISTS user_sync_data (
  user_id     UUID   NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  storage_key TEXT   NOT NULL,
  value       TEXT   NOT NULL,
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, storage_key)
);

-- ── Row Level Security ────────────────────────────────────────────────────────
-- Users can only read and write their own rows.

ALTER TABLE user_sync_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own data"
  ON user_sync_data
  FOR ALL
  USING  ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- ── Index for fast user lookups ───────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS user_sync_data_user_id_idx ON user_sync_data (user_id);

-- ── Quote likes table ──────────────────────────────────────────────────────────
-- One row per (quote, user) like. user_name/avatar_url are snapshotted at like
-- time so the community avatar row can render without joining auth.users
-- (which client-side queries can't read).

CREATE TABLE IF NOT EXISTS quote_likes (
  quote_id    TEXT   NOT NULL,
  user_id     UUID   NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name   TEXT,
  avatar_url  TEXT,
  liked_at    TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (quote_id, user_id)
);

ALTER TABLE quote_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view quote likes"
  ON quote_likes FOR SELECT
  USING (true);

CREATE POLICY "Users add their own quote like"
  ON quote_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users remove their own quote like"
  ON quote_likes FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS quote_likes_quote_id_idx ON quote_likes (quote_id);

-- Enable realtime so like counts update live across devices/users.
ALTER PUBLICATION supabase_realtime ADD TABLE quote_likes;
