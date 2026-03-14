// app/api/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { orderService } from '@/services/order.service';
import { createAdminSupabase } from '@/lib/supabase/admin';
import { logger } from '@/logger';

// CRITICAL: disable body parsing — Stripe needs the raw body for signature verification
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const body      = await req.arrayBuffer();
  const rawBody   = Buffer.from(body);
  const signature = req.headers.get('stripe-signature') ?? '';

  const stripe = getStripe();

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (err) {
    logger.warn({ message: 'Stripe webhook signature invalid', error: String(err) });
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }
 
  const supabase = createAdminSupabase(); // bypasses RLS for webhook updates
 
  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const intent = event.data.object;
        const orderId = intent.metadata.orderId;
 
        // Update payment record
        await supabase
          .from('payments')
          .update({ status: 'completed', paid_at: new Date().toISOString() })
          .eq('stripe_payment_intent_id', intent.id);
 
        // Confirm order
        await orderService.updateStatus(orderId, 'confirmed');
        logger.info({ message: 'Stripe payment confirmed', orderId, intentId: intent.id });
        break;
      }
 
      case 'payment_intent.payment_failed': {
        const intent = event.data.object;
        const orderId = intent.metadata.orderId;
 
        await supabase
          .from('payments')
          .update({ status: 'failed', failed_at: new Date().toISOString() })
          .eq('stripe_payment_intent_id', intent.id);
 
        await orderService.updateStatus(orderId, 'cancelled', { cancelled_at: new Date().toISOString() });
        logger.warn({ message: 'Stripe payment failed', orderId });
        break;
      }
    }
  } catch (err) {
    logger.error({ message: 'Webhook processing error', error: String(err) });
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
  }
 
  return NextResponse.json({ received: true });
}
