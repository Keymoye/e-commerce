-- 13b_user_rls.sql
-- User profiles: users read/update own profile only
CREATE POLICY "profiles_owner_read"
  ON user_profiles FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "profiles_owner_update"
  ON user_profiles FOR UPDATE
  USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- Prevent users changing their own is_admin flag
CREATE POLICY "profiles_no_self_promote"
  ON user_profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (is_admin = (SELECT is_admin FROM user_profiles WHERE id = auth.uid()));

-- Addresses: owner full CRUD
CREATE POLICY "addresses_owner_all"
  ON addresses FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
