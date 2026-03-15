// lib/stripe.ts
import 'server-only';
import Stripe from 'stripe';

let stripeInstance: Stripe | null = null;

export function getStripe() {
  if (!stripeInstance) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not set');
    }
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2026-02-25.clover',
      typescript: true,
    });
  }
  return stripeInstance;
}

// WHO CAN IMPORT THIS:
// ✅ services/payment.service.ts
// ✅ app/api/webhooks/stripe/route.ts
// ❌ Everything else
