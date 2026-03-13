-- 13c_orders_rls.sql
-- Orders: users see own orders, admins see all
CREATE POLICY "orders_owner_read"
  ON orders FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "orders_owner_insert"
  ON orders FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users cannot update their own orders (status changes are admin/service-role only)
CREATE POLICY "orders_admin_update"
  ON orders FOR UPDATE
  USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_admin = true));

-- Order items: readable if user owns the order
CREATE POLICY "order_items_owner_read"
  ON order_items FOR SELECT
  USING (EXISTS (SELECT 1 FROM orders WHERE id = order_id AND user_id = auth.uid()));

CREATE POLICY "order_items_owner_insert"
  ON order_items FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM orders WHERE id = order_id AND user_id = auth.uid()));

-- Payments: users see own payments only
CREATE POLICY "payments_owner_read"
  ON payments FOR SELECT
  USING (user_id = auth.uid());

-- Payment inserts/updates are service-role only (webhook handlers)
-- No INSERT/UPDATE policy needed — RLS blocks anon/user, service role bypasses
