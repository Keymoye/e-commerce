-- 06_addresses.sql
CREATE TABLE addresses (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label        TEXT NOT NULL DEFAULT 'Home',  -- "Home", "Work", "Other"
  full_name    TEXT NOT NULL,
  phone        TEXT NOT NULL,  -- E.164 format
  line_1       TEXT NOT NULL,
  line_2       TEXT,
  city         TEXT NOT NULL,
  county       TEXT,           -- Kenya: county, Tanzania: region, Uganda: district
  country_code TEXT NOT NULL DEFAULT 'KE',  -- ISO 3166-1 alpha-2
  postal_code  TEXT,
  is_default   BOOLEAN NOT NULL DEFAULT false,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Only one default address per user
CREATE UNIQUE INDEX idx_addresses_default
  ON addresses(user_id) WHERE is_default = true;

CREATE INDEX idx_addresses_user ON addresses(user_id);

CREATE TRIGGER trg_addresses_updated_at
  BEFORE UPDATE ON addresses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
