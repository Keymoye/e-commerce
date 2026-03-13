// components/checkout/checkoutForm.tsx
'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCheckout } from '@/hooks/useCheckout';
import { useUIStore } from '@/store/uiStore';
import { StripePaymentForm } from './StripePaymentForm';
import { MpesaPaymentForm } from './MpesaPaymentForm';
 
const schema = z.object({
  name:       z.string().min(2),
  phone:      z.string().min(9),
  line1:      z.string().min(3),
  city:       z.string().min(2),
  county:     z.string().optional(),
  mpesaPhone: z.string().optional(),
});
 
type FormValues = z.infer<typeof schema>;
 
export default function CheckoutForm() {
  const {
    paymentMethod, setPaymentMethod,
    clientSecret, orderId, checkoutRequestId,
    submitCheckout, isLoading,
  } = useCheckout();
 
  const { register, handleSubmit, formState: { errors }, watch } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });
 
  // Show Stripe payment UI after order created
  if (clientSecret && orderId && paymentMethod === 'stripe') {
    return <StripePaymentForm clientSecret={clientSecret} orderId={orderId} />;
  }
 
  // Show M-Pesa waiting UI after STK Push sent
  if (checkoutRequestId && orderId && paymentMethod === 'mpesa') {
    const phone = watch('mpesaPhone') ?? '';
    return <MpesaPaymentForm orderId={orderId} phone={phone} />;
  }
 
  return (
    <form onSubmit={handleSubmit(submitCheckout)} className="space-y-6 max-w-lg mx-auto">
      <h2 className="text-xl font-semibold">Checkout</h2>
 
      {/* Payment method selector */}
      <div className="grid grid-cols-2 gap-3">
        {(['mpesa', 'stripe'] as const).map(method => (
          <button key={method} type="button"
            onClick={() => setPaymentMethod(method)}
            className={`py-3 rounded-lg border-2 font-medium capitalize transition
              ${paymentMethod === method
                ? 'border-accent bg-accent/10 text-accent'
                : 'border-border text-muted-foreground hover:border-accent/50'}
            `}
          >
            {method === 'mpesa' ? '📱 M-Pesa' : '💳 Card'}
          </button>
        ))}
      </div>
 
      {/* Shipping fields */}
      {['name','phone','line1','city','county'].map(field => (
        <div key={field}>
          <label className="block text-sm font-medium mb-1 capitalize">{field}</label>
          <input
            {...register(field as keyof FormValues)}
            className="w-full px-3 py-2 rounded-lg border bg-background focus:ring-2
                       focus:ring-accent outline-none transition"
          />
          {errors[field as keyof FormValues] && (
            <p className="text-xs text-red-500 mt-1">
              {errors[field as keyof FormValues]?.message}
            </p>
          )}
        </div>
      ))}
 
      {/* M-Pesa phone field */}
      {paymentMethod === 'mpesa' && (
        <div>
          <label className="block text-sm font-medium mb-1">M-Pesa Phone Number</label>
          <input
            {...register('mpesaPhone')}
            placeholder="254712345678"
            className="w-full px-3 py-2 rounded-lg border bg-background focus:ring-2
                       focus:ring-accent outline-none transition"
          />
          <p className="text-xs text-muted-foreground mt-1">Format: 254712345678 (no +)</p>
        </div>
      )}
 
      <button type="submit" disabled={isLoading}
        className="w-full bg-secondary text-background py-3 rounded-lg font-semibold
                   hover:bg-accent transition disabled:opacity-60"
      >
        {isLoading ? 'Processing...' : 'Continue to Payment'}
      </button>
    </form>
  );
}
