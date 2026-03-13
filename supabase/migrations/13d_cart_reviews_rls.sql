-- 13d_cart_reviews_rls.sql
-- Cart: full owner CRUD
CREATE POLICY "cart_owner_all"
  ON cart_items FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Reviews: public read visible reviews
CREATE POLICY "reviews_public_read"
  ON reviews FOR SELECT
  USING (is_visible = true);

-- Reviews: authenticated users insert own review
CREATE POLICY "reviews_owner_insert"
  ON reviews FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Reviews: users update/delete own review
CREATE POLICY "reviews_owner_update"
  ON reviews FOR UPDATE
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "reviews_owner_delete"
  ON reviews FOR DELETE
  USING (user_id = auth.uid());

-- Admins can hide reviews (set is_visible = false)
CREATE POLICY "reviews_admin_update"
  ON reviews FOR UPDATE
  USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_admin = true));
