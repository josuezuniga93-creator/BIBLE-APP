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
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── Index for fast user lookups ───────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS user_sync_data_user_id_idx ON user_sync_data (user_id);
