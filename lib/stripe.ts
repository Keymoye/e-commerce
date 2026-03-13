// lib/stripe.ts
import 'server-only';
import Stripe from 'stripe';
 
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}
 
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2026-02-25.clover',
  typescript: true,
});
 
// WHO CAN IMPORT THIS:
// ✅ services/payment.service.ts
// ✅ app/api/webhooks/stripe/route.ts
// ❌ Everything else
