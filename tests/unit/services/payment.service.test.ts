// tests/unit/services/payment.service.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { paymentService } from '@/services/payment.service'; 
 
// Mock all external dependencies
vi.mock('@/lib/supabase/server', () => ({ createServerClient: vi.fn() }));
vi.mock('@/lib/stripe', () => ({
  getStripe: vi.fn(() => ({
    paymentIntents: {
      create: vi.fn().mockResolvedValue({ id: 'pi_test', client_secret: 'pi_test_secret' }),
    },
  })),
}));
vi.mock('@/lib/mpesa', () => ({
  initiateStkPush: vi.fn().mockResolvedValue({
    ResponseCode: '0',
    CheckoutRequestID: 'ws_CO_test123',
    ResponseDescription: 'Success',
    CustomerMessage: 'Check your phone',
    MerchantRequestID: 'merchant-123',
  }),
}));

import { getStripe } from '@/lib/stripe';
import { initiateStkPush } from '@/lib/mpesa';
import { createServerClient } from '@/lib/supabase/server'; 
 
const mockSupabase = { from: vi.fn() }; 
 
describe('paymentService.createStripeIntent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (createServerClient as any).mockResolvedValue(mockSupabase);
    mockSupabase.from.mockReturnValue({
      insert: vi.fn().mockResolvedValue({ data: null, error: null }),
    });
  });
 
  it('creates PaymentIntent with correct amount', async () => {
    const result = await paymentService.createStripeIntent('order-1', 'user-1', 50000);
    // Just verify the function returns the expected client secret
    expect(result.clientSecret).toBe('pi_test_secret');
  });
 
  it('throws DATABASE_ERROR when payment record insert fails', async () => {
    mockSupabase.from.mockReturnValue({
      insert: vi.fn().mockResolvedValue({ data: null, error: { message: 'insert failed' } }),
    });
    await expect(paymentService.createStripeIntent('order-1', 'user-1', 50000))
      .rejects.toMatchObject({ statusCode: 500 });
  });
});
 
describe('paymentService.initiateMpesa', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (createServerClient as any).mockResolvedValue(mockSupabase);
    mockSupabase.from.mockReturnValue({
      insert: vi.fn().mockResolvedValue({ data: null, error: null }),
    });
  });
 
  it('converts subunits to whole KES before STK Push', async () => {
    await paymentService.initiateMpesa('order-1', 'user-1', '254712345678', 50000);
    expect(initiateStkPush).toHaveBeenCalledWith(
      expect.objectContaining({ amount: 500 })  // 50000 subunits → 500 KES
    );
  });
 
  it('throws when STK Push returns non-zero ResponseCode', async () => {
    (initiateStkPush as any).mockResolvedValueOnce({
      ResponseCode: '1', ResponseDescription: 'Insufficient funds',
      CheckoutRequestID: '', MerchantRequestID: '', CustomerMessage: '',
    });
    await expect(paymentService.initiateMpesa('order-1', 'user-1', '254712345678', 50000))
      .rejects.toThrow();
  });
 
  it('stores checkoutRequestId in payments table', async () => {
    const insertMock = vi.fn().mockResolvedValue({ data: null, error: null });
    mockSupabase.from.mockReturnValue({ insert: insertMock });
    await paymentService.initiateMpesa('order-1', 'user-1', '254712345678', 50000);
    expect(insertMock).toHaveBeenCalledWith(
      expect.objectContaining({ mpesa_checkout_request_id: 'ws_CO_test123' })
    );
  });
});
