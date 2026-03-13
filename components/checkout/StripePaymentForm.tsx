// components/checkout/StripePaymentForm.tsx
'use client';
import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useUIStore } from '@/store/uiStore';
import { CartStore } from '@/store/cartStore';
import { useRouter } from 'next/navigation';
 
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
 
function PaymentForm({ orderId }: { orderId: string }) {
  const stripe    = useStripe();
  const elements  = useElements();
  const router    = useRouter();
  const showToast = useUIStore((s) => s.showToast);
  const clearCart = CartStore((s) => s.clear);
  const [loading, setLoading] = useState(false);
 
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
 
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/orders/${orderId}/confirmation`,
      },
    });
 
    if (error) {
      showToast({ type: 'error', message: error.message ?? 'Payment failed.' });
      setLoading(false);
    } else {
      clearCart();
    }
  };
 
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full bg-secondary text-background py-3 rounded-lg font-semibold
                   hover:bg-accent transition disabled:opacity-60"
      >
        {loading ? 'Processing...' : 'Pay Now'}
      </button>
    </form>
  );
}
 
export function StripePaymentForm({
  clientSecret,
  orderId,
}: {
  clientSecret: string;
  orderId: string;
}) {
  return (
    <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
      <PaymentForm orderId={orderId} />
    </Elements>
  );
}
