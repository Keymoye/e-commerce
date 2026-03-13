-- 04_product_images.sql
CREATE TABLE product_images (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url         TEXT NOT NULL,
  alt_text    TEXT,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  is_primary  BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Only one primary image per product
CREATE UNIQUE INDEX idx_images_primary
  ON product_images(product_id) WHERE is_primary = true;

CREATE INDEX idx_images_product ON product_images(product_id, sort_order);
