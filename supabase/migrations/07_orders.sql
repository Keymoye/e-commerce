-- 07_orders.sql
CREATE TABLE orders (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  status            order_status NOT NULL DEFAULT 'pending',
  order_number      TEXT NOT NULL UNIQUE,  -- Human-readable: ORD-2026-000001

  -- Totals in integer subunits
  subtotal_kes      INTEGER NOT NULL CHECK (subtotal_kes >= 0),
  subtotal_usd      INTEGER,
  shipping_fee_kes  INTEGER NOT NULL DEFAULT 0 CHECK (shipping_fee_kes >= 0),
  total_kes         INTEGER NOT NULL CHECK (total_kes >= 0),
  total_usd         INTEGER,
  currency          currency_code NOT NULL DEFAULT 'KES',

  -- Shipping address snapshot (denormalised — address may change later)
  shipping_name     TEXT NOT NULL,
  shipping_phone    TEXT NOT NULL,
  shipping_line_1   TEXT NOT NULL,
  shipping_line_2   TEXT,
  shipping_city     TEXT NOT NULL,
  shipping_county   TEXT,
  shipping_country  TEXT NOT NULL DEFAULT 'KE',

  -- Tracking
  notes             TEXT,
  shipped_at        TIMESTAMPTZ,
  delivered_at      TIMESTAMPTZ,
  cancelled_at      TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Order number generator: ORD-2026-000001
CREATE SEQUENCE order_number_seq START 1;
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT LANGUAGE plpgsql AS $$
BEGIN
  RETURN 'ORD-' || to_char(NOW(), 'YYYY') || '-'
         || lpad(nextval('order_number_seq')::TEXT, 6, '0');
END;
$$;

ALTER TABLE orders ALTER COLUMN order_number SET DEFAULT generate_order_number();

CREATE INDEX idx_orders_user       ON orders(user_id);
CREATE INDEX idx_orders_status     ON orders(status);
CREATE INDEX idx_orders_created    ON orders(created_at DESC);
CREATE INDEX idx_orders_number     ON orders(order_number);

CREATE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
