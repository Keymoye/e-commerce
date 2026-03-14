// tests/integration/supabase/triggers.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { testAdmin, cleanDatabase, seedTestProducts, createTestUser, signInAsUser } from '../../setup'; 
 
let productId: string;
let userId: string; 
 
beforeAll(async () => {
  await cleanDatabase();
  const { products } = await seedTestProducts(1);
  productId = products[0].id;
  const user = await createTestUser();
  userId = user.user.id;
});
 
afterAll(async () => {
  await cleanDatabase();
  await testAdmin.auth.admin.deleteUser(userId);
});
 
describe('Order number auto-generation trigger', () => {
  it('generates ORD-YYYY-NNNNNN format order number', async () => {
    const { data: order, error } = await testAdmin
      .from('orders')
      .insert({
        user_id:          userId,
        status:           'pending',
        currency:         'KES',
        subtotal_kes:     10000,
        shipping_fee_kes: 30000,
        total_kes:        40000,
        shipping_name:    'Test', shipping_phone: '254712345678',
        shipping_line_1:  '123 St', shipping_city: 'Nairobi', shipping_country: 'KE',
      })
      .select().single();
 
    expect(error).toBeNull();
    expect(order!.order_number).toMatch(/^ORD-\d{4}-\d{6}$/);
  });
 
  it('order numbers are sequential and unique', async () => {
    const insertOrder = () => testAdmin
      .from('orders')
      .insert({
        user_id:          userId,
        status:           'pending', currency: 'KES',
        subtotal_kes:     5000, shipping_fee_kes: 30000, total_kes: 35000,
        shipping_name:    'Test', shipping_phone: '254712345678',
        shipping_line_1:  '123 St', shipping_city: 'Nairobi', shipping_country: 'KE',
      })
      .select('order_number').single();
 
    const [{ data: o1 }, { data: o2 }] = await Promise.all([insertOrder(), insertOrder()]);
    expect(o1!.order_number).not.toBe(o2!.order_number);
  });
});
 
describe('Review rating denormalisation trigger', () => {
  it('updates product rating and review_count when review inserted', async () => {
    // Insert a review
    await testAdmin
      .from('reviews')
      .insert({ product_id: productId, user_id: userId, rating: 5, is_verified: false, is_visible: true }); 
 
    // Check product rating updated
    const { data: product } = await testAdmin
      .from('products').select('rating, review_count').eq('id', productId).single();
 
    expect(product!.review_count).toBe(1);
    expect(product!.rating).toBe(5.0);
  });
 
  it('recalculates rating correctly when second review added', async () => {
    // Need a second user for second review
    const user2 = await createTestUser();
    await testAdmin
      .from('reviews')
      .insert({ product_id: productId, user_id: user2.user.id, rating: 3, is_verified: false, is_visible: true }); 
 
    const { data: product } = await testAdmin
      .from('products').select('rating, review_count').eq('id', productId).single();
 
    expect(product!.review_count).toBe(2);
    expect(product!.rating).toBe(4.0); // (5 + 3) / 2
 
    await testAdmin.auth.admin.deleteUser(user2.user.id);
  });
 
  it('decrements review count when review deleted', async () => {
    const { data: review } = await testAdmin
      .from('reviews').select('id').eq('user_id', userId).single();
    await testAdmin
      .from('reviews').delete().eq('id', review!.id);
 
    const { data: product } = await testAdmin
      .from('products').select('review_count').eq('id', productId).single();
    expect(product!.review_count).toBe(1); // one review deleted
  });
});
 
describe('User profile auto-creation trigger', () => {
  it('creates user_profile row when new auth user signs up', async () => {
    const newUser = await createTestUser(); 
 
    // Profile should exist immediately — trigger fires on auth.users insert
    const { data: profile, error } = await testAdmin
      .from('user_profiles').select('*').eq('id', newUser.user.id).single();
 
    expect(error).toBeNull();
    expect(profile).toBeTruthy();
    expect(profile!.currency_pref).toBe('KES'); // default value
    expect(profile!.is_admin).toBe(false);      // default value
 
    await testAdmin.auth.admin.deleteUser(newUser.user.id);
  });
});
