-- 02_products.sql
CREATE TABLE products (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name             TEXT NOT NULL,
  slug             TEXT NOT NULL UNIQUE,
  brand            TEXT,
  category_id      UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  description      TEXT,

  -- Pricing (integer subunits — divide by 100 for display)
  base_price_kes   INTEGER NOT NULL CHECK (base_price_kes >= 0),  -- KES cents
  base_price_usd   INTEGER CHECK (base_price_usd >= 0),           -- USD cents (optional)

  -- Inventory (managed at variant level if has_variants = true)
  stock            INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  has_variants     BOOLEAN NOT NULL DEFAULT false,

  -- Ratings (denormalised for query performance)
  rating           NUMERIC(3,2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  review_count     INTEGER NOT NULL DEFAULT 0,

  -- Metadata
  tags             TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  specs            JSONB,
  is_active        BOOLEAN NOT NULL DEFAULT true,
  is_featured      BOOLEAN NOT NULL DEFAULT false,

  -- Soft delete
  deleted_at       TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Full-text search vector (auto-maintained by trigger)
ALTER TABLE products ADD COLUMN search_vector TSVECTOR
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(name,'')), 'A') ||
    setweight(to_tsvector('english', coalesce(brand,'')), 'B') ||
    setweight(to_tsvector('english', coalesce(description,'')), 'C')
  ) STORED;

CREATE INDEX idx_products_category    ON products(category_id);
CREATE INDEX idx_products_active      ON products(is_active, deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_products_featured    ON products(is_featured) WHERE is_featured = true;
CREATE INDEX idx_products_tags        ON products USING GIN(tags);
CREATE INDEX idx_products_specs       ON products USING GIN(specs);
CREATE INDEX idx_products_search      ON products USING GIN(search_vector);
CREATE INDEX idx_products_price_kes   ON products(base_price_kes);

CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
