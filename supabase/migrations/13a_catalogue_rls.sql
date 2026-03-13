-- 13a_catalogue_rls.sql
-- Categories: public read, admin write
CREATE POLICY "categories_public_read"
  ON categories FOR SELECT USING (true);

CREATE POLICY "categories_admin_write"
  ON categories FOR ALL
  USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_admin = true))
  WITH CHECK (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_admin = true));

-- Products: public read active products, admin write
CREATE POLICY "products_public_read"
  ON products FOR SELECT
  USING (is_active = true AND deleted_at IS NULL);

CREATE POLICY "products_admin_all"
  ON products FOR ALL
  USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_admin = true));

-- Product variants: public read active variants
CREATE POLICY "variants_public_read"
  ON product_variants FOR SELECT
  USING (is_active = true);

CREATE POLICY "variants_admin_all"
  ON product_variants FOR ALL
  USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_admin = true));

-- Product images: public read
CREATE POLICY "images_public_read"
  ON product_images FOR SELECT USING (true);

CREATE POLICY "images_admin_all"
  ON product_images FOR ALL
  USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_admin = true));
