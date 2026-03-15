// tests/unit/services/product.service.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { productService } from '@/services/products'; 
 
vi.mock('@/lib/db/server', () => ({ createServerClient: vi.fn() }));
import { createServerClient } from '@/lib/db/server'; 
 
const mockProducts = [
  { id: 'p1', name: 'Phone', slug: 'phone', base_price_kes: 100000, is_active: true, stock: 5 },
  { id: 'p2', name: 'Laptop', slug: 'laptop', base_price_kes: 200000, is_active: true, stock: 3 },
];
 
const makeListChain = (data: unknown[], count = data.length) => ({
  select:  vi.fn().mockReturnThis(),
  eq:      vi.fn().mockReturnThis(),
  is:      vi.fn().mockReturnThis(),
  order:   vi.fn().mockReturnThis(),
  range:   vi.fn().mockResolvedValue({ data, count, error: null }),
});
 
describe('productService.listProducts', () => {
  beforeEach(() => {
    const mockSupabase = { from: vi.fn().mockReturnValue(makeListChain(mockProducts, 2)) };
    (createServerClient as any).mockResolvedValue(mockSupabase);
  });
 
  it('returns paginated products with total count', async () => {
    const result = await productService.listProducts({ page: 1, pageSize: 8 });
    expect(result.products).toHaveLength(2);
    expect(result.total).toBe(2);
    // Note: result type doesn't include page, so we can't test it
  });
 
  it('calculates correct range for page 2', async () => {
    const mockSupabase = {
      from: vi.fn().mockReturnValue({
        ...makeListChain([], 10),
        range: vi.fn().mockResolvedValue({ data: [], count: 10, error: null }),
      }),
    };
    (createServerClient as any).mockResolvedValue(mockSupabase);
    const spy = vi.spyOn(mockSupabase.from(), 'range');
    // page 2, pageSize 8 → range(8, 15)
    await productService.listProducts({ page: 2, pageSize: 8 });
    expect(spy).toHaveBeenCalledWith(8, 15);
  });
});

describe('productService.getProductById', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
 
  it('returns product when found', async () => {
    const product = { id: 'p1', name: 'Phone', slug: 'phone', is_active: true };
    const mockSupabase = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq:     vi.fn().mockReturnThis(),
        is:     vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: product, error: null }),
      }),
    };
    (createServerClient as any).mockResolvedValue(mockSupabase);
    const result = await productService.getProductById('p1');
    expect(result.name).toBe('Phone');
  });
 
  it('throws NOT_FOUND when product does not exist', async () => {
    const mockSupabase = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq:     vi.fn().mockReturnThis(),
        is:     vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
      }),
    };
    (createServerClient as any).mockResolvedValue(mockSupabase);
    await expect(productService.getProductById('nonexistent'))
      .rejects.toMatchObject({ statusCode: 404 });
  });
});
