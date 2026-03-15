// tests/integration/supabase/rls.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import { testAdmin, cleanDatabase, seedTestProducts, createTestUser, signInAsUser } from '../../setup'; 
 
let userA: Awaited<ReturnType<typeof createTestUser>>;
let userB: Awaited<ReturnType<typeof createTestUser>>;
let clientA: ReturnType<typeof createClient<Database>>;
let clientB: ReturnType<typeof createClient<Database>>;
let productId: string; 
 
beforeAll(async () => {
  await cleanDatabase();
  const { products } = await seedTestProducts(2);
  productId = products[0].id;
 
  userA = await createTestUser();
  userB = await createTestUser();
 
  const sessionA = await signInAsUser(userA.email, userA.password);
  const sessionB = await signInAsUser(userB.email, userB.password);
  clientA = sessionA.client as ReturnType<typeof createClient<Database>>;
  clientB = sessionB.client as ReturnType<typeof createClient<Database>>;
});
 
afterAll(async () => {
  await cleanDatabase();
  await testAdmin.auth.admin.deleteUser(userA.user.id);
  await testAdmin.auth.admin.deleteUser(userB.user.id);
});
 
describe('Products RLS', () => {
  it('anonymous users can read active products', async () => {
    const { data, error } = await testAdmin
      .from('products').select('id, name').limit(5);
    expect(error).toBeNull();
    expect(data!.length).toBeGreaterThan(0);
  });
 
  it('anonymous users cannot insert products', async () => {
    const { error } = await testAdmin.auth.signOut();
    const anonClient = createClient(
      process.env.SUPABASE_TEST_URL!,
      process.env.SUPABASE_TEST_ANON_KEY!,
      { auth: { persistSession: false } }
    );
    const { error: insertErr } = await anonClient.from('products').insert({
      name: 'Hack', slug: 'hack', base_price_kes: 1, category_id: '00000000-0000-0000-0000-000000000000',
    });
    expect(insertErr).not.toBeNull(); // RLS should block this
  });
});
 
describe('Orders RLS', () => {
  let orderAId: string; 
 
  it('user can create their own order', async () => {
    const { data, error } = await clientA
      .from('orders')
      .insert({
        user_id:          userA.user.id,
        status:           'pending',
        currency:         'KES',
        subtotal_kes:     10000,
        shipping_fee_kes: 30000,
        total_kes:        40000,
        shipping_name:    'Test', shipping_phone: '254712345678',
        shipping_line_1:  '123 St', shipping_city: 'Nairobi', shipping_country: 'KE',
      } as any)
      .select().single();
    expect(error).toBeNull();
    expect((data as any)?.user_id).toBe(userA.user.id);
    orderAId = (data as any)?.id;
  });
 
  it('user can read their own order', async () => {
    const { data, error } = await clientA
      .from('orders').select('*').eq('id', orderAId).single();
    expect(error).toBeNull();
    expect((data as any)?.id).toBe(orderAId);
  });
 
  it('user B CANNOT read user A orders', async () => {
    const { data } = await clientB
      .from('orders').select('*').eq('id', orderAId);
    expect(data).toHaveLength(0); // RLS returns empty, not an error
  });
});
 
describe('Cart Items RLS', () => {
  it('user can add to their own cart', async () => {
    const { data, error } = await clientA
      .from('cart_items')
      .insert({ user_id: userA.user.id, product_id: productId, quantity: 2 } as any)
      .select().single();
    expect(error).toBeNull();
    expect((data as any)?.quantity).toBe(2);
  });
 
  it('user B cannot read user A cart', async () => {
    const { data } = await clientB
      .from('cart_items').select('*').eq('user_id', userA.user.id);
    expect(data).toHaveLength(0);
  });
});
 
describe('Payments RLS', () => {
  it('payments can only be inserted by service role', async () => {
    // User client should NOT be able to insert payments directly
    const { error } = await clientA
      .from('payments')
      .insert({
        order_id: '00000000-0000-0000-0000-000000000001',
        user_id:  userA.user.id,
        method:   'stripe', status: 'completed',
        amount:   10000,
        currency: 'KES',
      } as any);
    expect(error).not.toBeNull(); // RLS should block this
  });
});
 
describe('User Profiles RLS', () => {
  it('user cannot set is_admin to true on their own profile', async () => {
    const { error } = await (clientA as any)
      .from('user_profiles')
      .update({ is_admin: true })
      .eq('id', userA.user.id);
    expect(error).not.toBeNull(); // blocked by anti-privilege-escalation policy
  });
});
