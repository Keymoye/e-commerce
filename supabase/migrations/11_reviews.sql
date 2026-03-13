-- 11_reviews.sql
CREATE TABLE reviews (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating      INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title       TEXT,
  body        TEXT,
  is_verified BOOLEAN NOT NULL DEFAULT false,  -- verified purchase
  is_visible  BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- One review per user per product
CREATE UNIQUE INDEX idx_reviews_unique ON reviews(product_id, user_id);
CREATE INDEX idx_reviews_product ON reviews(product_id) WHERE is_visible = true;

-- Denormalise rating back to products table on insert/update/delete
CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  UPDATE products
  SET
    rating       = (SELECT COALESCE(AVG(rating::NUMERIC), 0) FROM reviews
                    WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
                    AND is_visible = true),
    review_count = (SELECT COUNT(*) FROM reviews
                    WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
                    AND is_visible = true)
  WHERE id = COALESCE(NEW.product_id, OLD.product_id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_review_rating
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW EXECUTE PROCEDURE update_product_rating();

CREATE TRIGGER trg_reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
