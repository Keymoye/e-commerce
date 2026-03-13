-- 08_order_items.sql
CREATE TABLE order_items (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id           UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id         UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  variant_id         UUID REFERENCES product_variants(id) ON DELETE RESTRICT,

  -- Snapshot at time of purchase (prices may change, this is the truth)
  product_name       TEXT NOT NULL,
  variant_name       TEXT,          -- e.g. "Red / XL"
  sku                TEXT,
  unit_price_kes     INTEGER NOT NULL CHECK (unit_price_kes >= 0),
  unit_price_usd     INTEGER,
  quantity           INTEGER NOT NULL CHECK (quantity > 0),
  total_kes          INTEGER NOT NULL CHECK (total_kes >= 0),
  image_url          TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_order_items_order   ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);
CREATE INDEX idx_order_items_variant ON order_items(variant_id);
