// hooks/usePayment.ts
'use client';
import { useState, useEffect, useRef } from 'react';
import { isApiError } from '@/types/api.types';
 
type PaymentStatus = 'pending' | 'completed' | 'failed' | 'cancelled';
 
export function usePaymentStatus(orderId: string | null) {
  const [status, setStatus] = useState<PaymentStatus>('pending');
  const intervalRef = useRef<NodeJS.Timeout | undefined>(undefined);
 
  useEffect(() => {
    if (!orderId) return;
 
    const poll = async () => {
      try {
        const res  = await fetch(`/api/orders/${orderId}/payment-status`);
        const json = await res.json();
        if (isApiError(json)) return;
 
        const paymentStatus: PaymentStatus = json.data.status;
        setStatus(paymentStatus);
 
        if (paymentStatus !== 'pending') {
          clearInterval(intervalRef.current);
        }
      } catch { /* ignore network errors during polling */ }
    };
 
    poll(); // immediate first check
    intervalRef.current = setInterval(poll, 3000); // then every 3s
 
    // Stop after 5 minutes regardless
    const timeout = setTimeout(() => clearInterval(intervalRef.current), 300_000);
 
    return () => {
      clearInterval(intervalRef.current);
      clearTimeout(timeout);
    };
  }, [orderId]);
 
  return { status };
}
