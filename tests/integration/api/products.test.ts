// tests/integration/api/products.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/products/route';
import { testAdmin, cleanDatabase, seedTestProducts } from '../../setup'; 
 
let seededProducts: Awaited<ReturnType<typeof seedTestProducts>>;
 
beforeAll(async () => {
  await cleanDatabase();
  seededProducts = await seedTestProducts(5);
});
 
afterAll(async () => {
  await cleanDatabase();
});
 
describe('GET /api/products', () => {
  it('returns 200 with paginated products', async () => {
    const req = new NextRequest('http://localhost/api/products?page=1&pageSize=3');
    const res = await GET(req);
    const json = await res.json(); 
 
    expect(res.status).toBe(200);
    expect(json.data.products).toHaveLength(3);
    expect(json.data.total).toBe(5);
    expect(json.data.page).toBe(1);
  });
 
  it('returns correct page 2 results', async () => {
    const req = new NextRequest('http://localhost/api/products?page=2&pageSize=3');
    const res = await GET(req);
    const json = await res.json();
 
    expect(res.status).toBe(200);
    expect(json.data.products).toHaveLength(2); // 5 total, 3 on page 1, 2 on page 2
  });
 
  it('returns 400 on invalid page param', async () => {
    const req = new NextRequest('http://localhost/api/products?page=abc');
    const res = await GET(req);
    expect(res.status).toBe(400);
  });
 
  it('response shape matches ApiSuccess<T>', async () => {
    const req = new NextRequest('http://localhost/api/products');
    const res = await GET(req);
    const json = await res.json();
 
    expect(json).toHaveProperty('data');
    expect(json).toHaveProperty('data.products');
    expect(json).toHaveProperty('data.total');
    expect(json).not.toHaveProperty('error');
  });
});
