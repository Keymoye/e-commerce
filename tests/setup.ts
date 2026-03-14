// tests/setup.ts
import { createClient } from '@supabase/supabase-js';
import { afterAll, beforeAll } from 'vitest';
 
// Admin client — bypasses RLS for setup/teardown
export const testAdmin = createClient(
  process.env.SUPABASE_TEST_URL!,
  process.env.SUPABASE_TEST_SERVICE_KEY!,
  { auth: { persistSession: false } }
);
 
// Anon client — respects RLS (used in RLS policy tests)
export const testAnon = createClient(
  process.env.SUPABASE_TEST_URL!,
  process.env.SUPABASE_TEST_ANON_KEY!,
  { auth: { persistSession: false } }
);
 
// Truncate all tables in dependency order before each test file
export async function cleanDatabase() {
  const tables = [
    'reviews', 'cart_items', 'payments', 'order_items',
    'orders', 'addresses', 'user_profiles', 'product_variants',
    'product_images', 'products', 'categories',
  ];
  for (const table of tables) {
    await testAdmin.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
  }
}
 
// Seed a test category and products for tests that need them
export async function seedTestProducts(count = 3) {
  const { data: cat } = await testAdmin
    .from('categories')
    .insert({ name: 'Test Category', slug: 'test-category' })
    .select().single();

  if (!cat) {
    throw new Error('Failed to create test category');
  }

  const products = Array.from({ length: count }, (_, i) => ({
    name:          `Test Product ${i + 1}`,
    slug:          `test-product-${i + 1}`,
    category_id:   cat.id,
    base_price_kes: (i + 1) * 10000,  // 100, 200, 300 KES
    stock:          10,
    is_active:      true,
  }));

  const { data } = await testAdmin
    .from('products').insert(products).select();
  return { category: cat, products: data! };
}
 
// Create a test user via Supabase auth (returns user + session)
export async function createTestUser(email?: string, password = "TestPass123!") {
  const testEmail = email ?? `test-${Date.now()}@example.com`;
  const { data, error } = await testAdmin.auth.admin.createUser({
    email: testEmail,
    password,
    email_confirm: true,
  });
  if (error) throw new Error(`Failed to create test user: ${error.message}`);
  return { user: data.user!, email: testEmail, password };
}
 
// Sign in as test user — returns authenticated client
export async function signInAsUser(email: string, password: string) {
  const client = createClient(
    process.env.SUPABASE_TEST_URL!,
    process.env.SUPABASE_TEST_ANON_KEY!,
    { auth: { persistSession: false } }
  );
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw new Error(`Sign in failed: ${error.message}`);
  return { client, session: data.session!, user: data.user! };
}
