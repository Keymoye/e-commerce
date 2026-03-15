// tests/unit/services/order.service.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { orderService } from '@/services/orders';
import { AppError } from '@/errors/base-error';
 
// ── Mock Supabase server client ───────────────────────────────────────
vi.mock('@/lib/db/server', () => ({
  createServerClient: vi.fn(),
}));
 
import { createServerClient } from '@/lib/db/server';
 
const mockSupabase = {
  from: vi.fn(),
};
 
const makeChain = (result: unknown) => ({
  select:  vi.fn().mockReturnThis(),
  insert:  vi.fn().mockReturnThis(),
  update:  vi.fn().mockReturnThis(),
  eq:      vi.fn().mockReturnThis(),
  is:      vi.fn().mockReturnThis(),
  in:      vi.fn().mockReturnThis(),
  single:  vi.fn().mockResolvedValue(result),
  order:   vi.fn().mockReturnThis(),
  limit:   vi.fn().mockResolvedValue(result),
});
 
const validInput = {
  userId:   'user-123',
  currency: 'KES' as const,
  shipping: {
    name: 'Jane Doe', phone: '254712345678',
    line1: '123 Main St', city: 'Nairobi', country: 'KE',
  },
  items: [{ productId: "prod-1", quantity: 2 }],
};
 
describe('orderService.createOrder', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (createServerClient as any).mockResolvedValue(mockSupabase);
  });
 
  it('throws validation error when product not found', async () => {
    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'products') {
        const data: any[] = [];
        const chain = {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          is: vi.fn().mockReturnThis(),
          in: vi.fn().mockReturnThis(),
        };
        // Make the chain itself awaitable (returns data when awaited)
        const thenable = Object.assign(
          Promise.resolve({ data, error: null }),
          chain
        );
        chain.select.mockReturnValue(thenable);
        chain.eq.mockReturnValue(thenable);
        chain.is.mockReturnValue(thenable);
        chain.in.mockReturnValue(thenable);
        return chain;
      }
      return makeChain({ data: null, error: null });
    });

    await expect(orderService.createOrder(validInput))
      .rejects.toThrow();
  });
 
  it('throws OUT_OF_STOCK when stock < quantity', async () => {
    const product = {
      id: 'prod-1', name: 'Widget',
      base_price_kes: 10000, stock: 1,
      has_variants: false,
    };
    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'products') {
        const data = [product];
        const chain = {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          is: vi.fn().mockReturnThis(),
          in: vi.fn().mockReturnThis(),
        };
        // Make the chain itself awaitable (returns data when awaited)
        const thenable = Object.assign(
          Promise.resolve({ data, error: null }),
          chain
        );
        chain.select.mockReturnValue(thenable);
        chain.eq.mockReturnValue(thenable);
        chain.is.mockReturnValue(thenable);
        chain.in.mockReturnValue(thenable);
        return chain;
      }
      return makeChain({ data: null, error: null });
    });
 
    // quantity: 2 > stock: 1
    await expect(orderService.createOrder(validInput))
      .rejects.toMatchObject({ statusCode: 409 });
  });
 
  it('calculates totals correctly including shipping', async () => {
    const product = {
      id: 'prod-1', name: 'Widget',
      base_price_kes: 10000, stock: 10,
      has_variants: false,
    };
    const mockOrder = { id: 'order-1', order_number: 'ORD-2026-000001' };
 
    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'products') {
        const data = [product];
        const chain = {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          is: vi.fn().mockReturnThis(),
          in: vi.fn().mockReturnThis(),
        };
        // Make the chain itself awaitable (returns data when awaited)
        const thenable = Object.assign(
          Promise.resolve({ data, error: null }),
          chain
        );
        chain.select.mockReturnValue(thenable);
        chain.eq.mockReturnValue(thenable);
        chain.is.mockReturnValue(thenable);
        chain.in.mockReturnValue(thenable);
        return chain;
      }
      if (table === 'orders') return {
        ...makeChain({ data: mockOrder, error: null }),
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockOrder, error: null }),
      };
      if (table === 'order_items') return {
        insert: vi.fn().mockResolvedValue({ data: null, error: null }),
      };
      return makeChain({ data: null, error: null });
    });
 
    const result = await orderService.createOrder(validInput);
    // 2 items × 10000 = 20000 subtotal + 30000 shipping = 50000 total
    expect(result.subtotalKes).toBe(20000);
    expect(result.shippingFeeKes).toBe(30000);
    expect(result.totalKes).toBe(50000);
  });
 
  it('throws DATABASE_ERROR when order insert fails', async () => {
    const product = {
      id: 'prod-1', name: 'Widget',
      base_price_kes: 10000, stock: 10,
      has_variants: false,
    };
    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'products') {
        const data = [product];
        const chain = {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          is: vi.fn().mockReturnThis(),
          in: vi.fn().mockReturnThis(),
        };
        // Make the chain itself awaitable (returns data when awaited)
        const thenable = Object.assign(
          Promise.resolve({ data, error: null }),
          chain
        );
        chain.select.mockReturnValue(thenable);
        chain.eq.mockReturnValue(thenable);
        chain.is.mockReturnValue(thenable);
        chain.in.mockReturnValue(thenable);
        return chain;
      }
      if (table === 'orders') return {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } }),
      };
      return makeChain({ data: null, error: null });
    });
 
    await expect(orderService.createOrder(validInput))
      .rejects.toMatchObject({ statusCode: 500 });
  });
});
 
describe('orderService.updateStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (createServerClient as any).mockResolvedValue(mockSupabase);
  });
 
  it('updates order status successfully', async () => {
    mockSupabase.from.mockReturnValue({
      update: vi.fn().mockReturnThis(),
      eq:     vi.fn().mockResolvedValue({ data: null, error: null }),
    });
    await expect(orderService.updateStatus('order-1', 'confirmed'))
      .resolves.not.toThrow();
  });
 
  it('throws on DB error', async () => {
    mockSupabase.from.mockReturnValue({
      update: vi.fn().mockReturnThis(),
      eq:     vi.fn().mockResolvedValue({ data: null, error: { message: 'fail' } }),
    });
    await expect(orderService.updateStatus('order-1', 'confirmed'))
      .rejects.toMatchObject({ statusCode: 500 });
  });
});
