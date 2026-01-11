-- 001_create_admin_audits.sql
-- Run this using psql, supabase CLI, or your DB migration tooling

CREATE TABLE IF NOT EXISTS admin_audits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NULL,
  action text NOT NULL,
  details jsonb NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_audits_created_at ON admin_audits (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_audits_action ON admin_audits (action);
