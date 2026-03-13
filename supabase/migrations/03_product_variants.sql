-- 03_product_variants.sql
CREATE TABLE product_variants (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id     UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,

  -- Variant identity
  sku            TEXT NOT NULL UNIQUE,
  name           TEXT NOT NULL,  -- Human label e.g. "Red / XL"

  -- Option values (up to 3 axes per variant)
  option_1_type  variant_option_type,
  option_1_value TEXT,           -- e.g. "Red"
  option_2_type  variant_option_type,
  option_2_value TEXT,           -- e.g. "XL"
  option_3_type  variant_option_type,
  option_3_value TEXT,           -- e.g. "256GB"

  -- Pricing override (NULL = use product base price)
  price_kes      INTEGER CHECK (price_kes >= 0),
  price_usd      INTEGER CHECK (price_usd >= 0),

  -- Inventory
  stock          INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  low_stock_threshold INTEGER NOT NULL DEFAULT 5,

  -- Media
  image_url      TEXT,

  -- Status
  is_active      BOOLEAN NOT NULL DEFAULT true,
  sort_order     INTEGER NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_variants_product  ON product_variants(product_id);
CREATE INDEX idx_variants_sku      ON product_variants(sku);
CREATE INDEX idx_variants_stock    ON product_variants(stock) WHERE stock > 0;
CREATE INDEX idx_variants_active   ON product_variants(is_active) WHERE is_active = true;

CREATE TRIGGER trg_variants_updated_at
  BEFORE UPDATE ON product_variants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
