// services/payment.service.ts
import { createServerClient } from '@/lib/db/server';
import { getStripe } from '@/lib/payments/stripe';
import { initiateStkPush } from '@/lib/payments/mpesa';
import { AppError } from '@/errors/base-error';
import { ErrorCode } from '@/errors/error-codes';
import { withServiceError } from '@/errors/error-handler';
import { logger } from '@/lib/logger';
 
export const paymentService = {

  // ── Stripe: create PaymentIntent ──────────────────────────────────────
  async createStripeIntent(orderId: string, userId: string, amountKes: number) {
    return withServiceError(async () => {
      const supabase = await createServerClient();
      const stripe = getStripe();

      // Create Stripe PaymentIntent
      const intent = await stripe.paymentIntents.create({
        amount:   amountKes,       // already in subunits (KES cents)
        currency: 'kes',
        metadata: { orderId, userId },
        automatic_payment_methods: { enabled: true },
      });
 
      // Record payment in DB
      const { error } = await supabase
        .from('payments')
        .insert({
          order_id:                 orderId,
          user_id:                  userId,
          method:                   'stripe',
          status:                   'pending',
          amount:                   amountKes,
          currency:                 'KES',
          stripe_payment_intent_id: intent.id,
          stripe_client_secret:     intent.client_secret,
        });
 
      if (error) {
        logger.error({ message: 'Payment record insert failed', error: error.message });
        throw new AppError('Failed to record payment', 500, ErrorCode.DATABASE_ERROR);
      }
 
      logger.info({ message: 'Stripe intent created', orderId, intentId: intent.id });
      return { clientSecret: intent.client_secret! };
    }, { operation: 'createStripeIntent', orderId });
  },
 
  // ── M-Pesa: initiate STK Push ─────────────────────────────────────────
  async initiateMpesa(orderId: string, userId: string, phone: string, amountKes: number) {
    return withServiceError(async () => {
      const supabase = await createServerClient();
 
      const stkRes = await initiateStkPush({
        phone,
        amount:      amountKes / 100,  // convert subunits → whole KES
        orderId,
        description: 'Order payment',
      });
 
      if (stkRes.ResponseCode !== '0') {
        throw AppError.external('M-Pesa', stkRes.ResponseDescription);
      }
 
      // Record payment in DB
      const { error } = await supabase
        .from('payments')
        .insert({
          order_id:                    orderId,
          user_id:                     userId,
          method:                      'mpesa',
          status:                      'pending',
          amount:                      amountKes,
          currency:                    'KES',
          mpesa_checkout_request_id:   stkRes.CheckoutRequestID,
          mpesa_phone:                 phone,
        });
 
      if (error) {
        throw new AppError('Failed to record M-Pesa payment', 500, ErrorCode.DATABASE_ERROR);
      }
 
      logger.info({ message: 'M-Pesa STK Push sent', orderId, checkoutRequestId: stkRes.CheckoutRequestID });
      return { checkoutRequestId: stkRes.CheckoutRequestID };
    }, { operation: 'initiateMpesa', orderId });
  },
 
  // ── Shared: confirm payment from webhook ──────────────────────────────
  async confirmPayment(paymentId: string, receiptData: Record<string, unknown>) {
    return withServiceError(async () => {
      const supabase = await createServerClient();
      const { error } = await supabase
        .from('payments')
        .update({
          status:           'completed',
          paid_at:          new Date().toISOString(),
          provider_payload: receiptData,
          ...receiptData,
        })
        .eq('id', paymentId);
      if (error) throw new AppError('Payment confirm failed', 500, ErrorCode.DATABASE_ERROR);
    }, { operation: 'confirmPayment', paymentId });
  },
};
