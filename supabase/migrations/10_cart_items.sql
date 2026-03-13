-- 10_cart_items.sql
CREATE TABLE cart_items (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id   UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_id   UUID REFERENCES product_variants(id) ON DELETE CASCADE,
  quantity     INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- One row per user + product + variant combination
CREATE UNIQUE INDEX idx_cart_unique
  ON cart_items(user_id, product_id, COALESCE(variant_id, '00000000-0000-0000-0000-000000000000'::UUID));

CREATE INDEX idx_cart_user ON cart_items(user_id);

CREATE TRIGGER trg_cart_updated_at
  BEFORE UPDATE ON cart_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
