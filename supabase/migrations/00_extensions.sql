-- 00_extensions.sql
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";      -- UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";       -- Cryptographic functions
CREATE EXTENSION IF NOT EXISTS "unaccent";       -- Accent-insensitive search
CREATE EXTENSION IF NOT EXISTS "pg_trgm";        -- Trigram similarity for search

-- Create function for auto-updating updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Currency enum
CREATE TYPE currency_code AS ENUM ('KES', 'USD');

-- Order status enum
CREATE TYPE order_status AS ENUM (
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'refunded'
);

-- Payment status enum
CREATE TYPE payment_status AS ENUM (
  'pending',
  'processing',
  'completed',
  'failed',
  'cancelled',
  'refunded'
);

-- Payment method enum
CREATE TYPE payment_method AS ENUM ('mpesa', 'stripe', 'cash_on_delivery');

-- Variant option type enum
CREATE TYPE variant_option_type AS ENUM ('size', 'colour', 'storage', 'material', 'style', 'other');
