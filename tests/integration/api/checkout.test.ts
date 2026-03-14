// tests/integration/api/checkout.test.ts
import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/checkout/route';
import { testAdmin, cleanDatabase, seedTestProducts, createTestUser } from '../../setup'; 
 
// Mock Stripe and M-Pesa so no real API calls are made
vi.mock('@/lib/stripe', () => ({
  stripe: {
    paymentIntents: { create: vi.fn().mockResolvedValue({ id: 'pi_test', client_secret: 'secret_test' }) },
  },
}));
vi.mock('@/lib/mpesa', () => ({
  initiateStkPush: vi.fn().mockResolvedValue({ ResponseCode: '0', CheckoutRequestID: 'CRQ_test' }),
}));
 
// Mock auth to return a real test user
vi.mock('@/lib/supabase/server', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/supabase/server')>();
  return {
    ...actual,
    createServerClient: vi.fn(),
  };
});
 
import { createServerClient } from '@/lib/supabase/server'; 
 
let testUser: Awaited<ReturnType<typeof createTestUser>>;
let productId: string; 
 
beforeAll(async () => {
  await cleanDatabase();
  const { products } = await seedTestProducts(2);
  productId = products[0].id;
  testUser = await createTestUser();
});
 
afterAll(async () => {
  await cleanDatabase();
  await testAdmin.auth.admin.deleteUser(testUser.user.id);
});
 
const makeAuthenticatedSupabase = (userId: string) => ({
  auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: userId } }, error: null }) },
  from: (table: string) => testAdmin.from(table),  // real DB for data operations
});
 
const validCheckoutBody = (productId: string) => ({
  currency:      'KES',
  paymentMethod: 'stripe',
  shipping: {
    name: 'Test User', phone: '254712345678',
    line1: '123 Test St', city: 'Nairobi', country: 'KE',
  },
  items: [{ productId, quantity: 1 }],
});
 
describe('POST /api/checkout', () => {
  it('returns 401 when not authenticated', async () => {
    (createServerClient as any).mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }) },
    });
    const req = new NextRequest('http://localhost/api/checkout', {
      method: 'POST',
      body: JSON.stringify(validCheckoutBody(productId)),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });
 
  it('creates order and returns clientSecret for Stripe', async () => {
    (createServerClient as any).mockResolvedValue(
      makeAuthenticatedSupabase(testUser.user.id)
    );
    const req = new NextRequest('http://localhost/api/checkout', {
      method: 'POST',
      body: JSON.stringify(validCheckoutBody(productId)),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await POST(req);
    const json = await res.json();
 
    expect(res.status).toBe(200);
    expect(json.data.clientSecret).toBe('secret_test');
    expect(json.data.orderId).toBeDefined();
    expect(json.data.paymentMethod).toBe('stripe');
  });
 
  it('order is persisted in database after checkout', async () => {
    (createServerClient as any).mockResolvedValue(
      makeAuthenticatedSupabase(testUser.user.id)
    );
    const req = new NextRequest('http://localhost/api/checkout', {
      method: 'POST',
      body: JSON.stringify(validCheckoutBody(productId)),
      headers: { 'Content-Type': 'application/json' },
    });
    const res  = await POST(req);
    const json = await res.json();
    const orderId = json.data.orderId;
 
    // Verify in real test DB
    const { data: order } = await testAdmin
      .from('orders').select('*').eq('id', orderId).single();
 
    expect(order).toBeTruthy();
    expect(order!.status).toBe('pending');
    expect(order!.user_id).toBe(testUser.user.id);
  });
 
  it('returns 400 on missing required fields', async () => {
    (createServerClient as any).mockResolvedValue(
      makeAuthenticatedSupabase(testUser.user.id)
    );
    const req = new NextRequest('http://localhost/api/checkout', {
      method: 'POST',
      body: JSON.stringify({ currency: 'KES' }), // missing items, shipping, paymentMethod
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });
 
  it('returns 409 when product stock is insufficient', async () => {
    // Drain stock to 0
    await testAdmin
      .from('products').update({ stock: 0 }).eq('id', productId);
 
    (createServerClient as any).mockResolvedValue(
      makeAuthenticatedSupabase(testUser.user.id)
    );
    const req = new NextRequest('http://localhost/api/checkout', {
      method: 'POST',
      body: JSON.stringify(validCheckoutBody(productId)),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await POST(req);
    expect(res.status).toBe(409);
 
    // Restore stock
    await testAdmin
      .from('products').update({ stock: 10 }).eq('id', productId);
  });
});
