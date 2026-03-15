// hooks/useCheckout.ts
'use client';
import { useState } from 'react';
import { useUIStore } from '@/store/ui-store';
import { useErrorHandler } from '@/hooks/shared/use-error-handler';
import { isApiError } from '@/types/api';
import { CartStore } from '@/store/cart-store';
 
export type PaymentMethod = 'stripe' | 'mpesa';
 
export interface CheckoutFormData {
  name:        string;
  phone:       string;
  line1:       string;
  city:        string;
  county?:     string;
  mpesaPhone?: string;
}
 
export function useCheckout() {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mpesa');
  const [clientSecret,  setClientSecret]  = useState<string | null>(null);
  const [orderId,       setOrderId]       = useState<string | null>(null);
  const [checkoutRequestId, setCheckoutRequestId] = useState<string | null>(null);
 
  const { handleError }              = useErrorHandler();
  const { setLoading, isLoading, showToast } = useUIStore();
  const items = CartStore((s) => s.items);
  const clearCart = CartStore((s) => s.clear);
  const LOADING_KEY = 'checkout.submit';
 
  const submitCheckout = async (data: CheckoutFormData) => {
    if (!items.length) {
      showToast({ type: 'warning', message: 'Your cart is empty.' });
      return;
    }
 
    setLoading(LOADING_KEY, true);
    try {
      const res  = await fetch('/api/checkout', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currency:      'KES',
          paymentMethod,
          mpesaPhone:    paymentMethod === 'mpesa' ? data.mpesaPhone : undefined,
          shipping: {
            name:    data.name,
            phone:   data.phone,
            line1:   data.line1,
            city:    data.city,
            county:  data.county,
            country: 'KE',
          },
          items: items.map(i => ({
            productId: i.id,
            quantity:  i.quantity,
          })),
        }),
      });
      const json = await res.json();
      if (isApiError(json)) { handleError(json); return; }
 
      setOrderId(json.data.orderId);
 
      if (json.data.paymentMethod === 'stripe') {
        setClientSecret(json.data.clientSecret);
        clearCart();
      } else {
        setCheckoutRequestId(json.data.checkoutRequestId);
        clearCart();
        showToast({ type: 'info', message: 'Check your phone — M-Pesa prompt sent!' });
      }
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(LOADING_KEY, false);
    }
  };
 
  return {
    paymentMethod, setPaymentMethod,
    clientSecret, orderId, checkoutRequestId,
    submitCheckout,
    isLoading: isLoading(LOADING_KEY),
  };
}
