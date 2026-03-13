// components/checkout/MpesaPaymentForm.tsx
'use client';
import { usePaymentStatus } from '@/hooks/usePayment';
import { useUIStore } from '@/store/uiStore';
import { CartStore } from '@/store/cartStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
 
export function MpesaPaymentForm({
  orderId,
  phone,
}: {
  orderId: string;
  phone:   string;
}) {
  const { status }  = usePaymentStatus(orderId);
  const router      = useRouter();
  const showToast   = useUIStore((s) => s.showToast);
  const clearCart   = CartStore((s) => s.clear);
 
  useEffect(() => {
    if (status === 'completed') {
      clearCart();
      showToast({ type: 'success', message: 'Payment confirmed! 🎉' });
      router.push(`/orders/${orderId}/confirmation`);
    } else if (status === 'failed' || status === 'cancelled') {
      showToast({ type: 'error', message: 'Payment failed. Please try again.' });
    }
  }, [status]);
 
  return (
    <div className="text-center space-y-4 py-8">
      <div className="text-5xl">📱</div>
      <h3 className="text-lg font-semibold">M-Pesa Prompt Sent</h3>
      <p className="text-muted-foreground text-sm">
        Check your phone ({phone}) and enter your M-Pesa PIN to complete payment.
      </p>
 
      {status === 'pending' && (
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <div className="h-4 w-4 border-2 border-green-500 border-t-transparent
                          rounded-full animate-spin" />
          Waiting for confirmation...
        </div>
      )}
 
      {status === 'completed' && (
        <p className="text-green-600 font-medium">✓ Payment confirmed! Redirecting...</p>
      )}
 
      {(status === 'failed' || status === 'cancelled') && (
        <p className="text-red-600 font-medium">✗ Payment was not completed.</p>
      )}
    </div>
  );
}
