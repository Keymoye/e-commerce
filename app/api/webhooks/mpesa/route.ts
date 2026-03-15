// app/api/webhooks/mpesa/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { orderService } from '@/services/orders';
import { createAdminSupabase } from '@/lib/db/admin';
import { logger } from '@/lib/logger';
 
export async function POST(req: NextRequest) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
 
  const callback = body?.Body?.stkCallback;
  if (!callback) {
    logger.warn({ message: 'Invalid M-Pesa callback structure' });
    return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' });
  }
 
  const { ResultCode, ResultDesc, CheckoutRequestID, CallbackMetadata } = callback;
  logger.info({ message: 'M-Pesa callback received', ResultCode, CheckoutRequestID });
 
  const supabase = createAdminSupabase();
 
  // Find payment by checkout request ID
  const { data: payment } = await supabase
    .from('payments')
    .select('id, order_id')
    .eq('mpesa_checkout_request_id', CheckoutRequestID)
    .single();
 
  if (!payment) {
    logger.warn({ message: 'Payment not found for callback', CheckoutRequestID });
    return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' });
  }
 
  if (ResultCode === 0) {
    // Extract receipt from callback metadata
    const items = CallbackMetadata?.Item ?? [];
    const get   = (name: string) => items.find((i: any) => i.Name === name)?.Value;
 
    const receiptNumber = get('MpesaReceiptNumber');
    const amount        = get('Amount');
 
    await supabase
      .from('payments')
      .update({
        status:               'completed',
        mpesa_receipt_number: receiptNumber,
        mpesa_result_code:    ResultCode,
        mpesa_result_desc:    ResultDesc,
        provider_payload:     body,
        paid_at:              new Date().toISOString(),
      })
      .eq('id', payment.id);
 
    await orderService.updateStatus(payment.order_id, 'confirmed');
    logger.info({ message: 'M-Pesa payment confirmed', orderId: payment.order_id, receiptNumber });
  } else {
    // Payment failed or cancelled by user
    await supabase
      .from('payments')
      .update({
        status:            'failed',
        mpesa_result_code: ResultCode,
        mpesa_result_desc: ResultDesc,
        failed_at:         new Date().toISOString(),
      })
      .eq('id', payment.id);
 
    await orderService.updateStatus(payment.order_id, 'cancelled',
      { cancelled_at: new Date().toISOString() });
    logger.warn({ message: 'M-Pesa payment failed', ResultCode, ResultDesc });
  }
 
  // Always return 200 — M-Pesa retries on non-200
  return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' });
}
