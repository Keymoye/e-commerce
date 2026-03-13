// app/api/checkout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withErrorHandler } from '@/errors/withErrorHandler';
import { AppError } from '@/errors/AppError';
import { orderService } from '@/services/order.service';
import { paymentService } from '@/services/payment.service';
import { createServerClient } from '@/lib/supabase/server';
 
const checkoutSchema = z.object({
  currency:      z.enum(['KES', 'USD']).default('KES'),
  paymentMethod: z.enum(['stripe', 'mpesa']),
  mpesaPhone:    z.string().optional(),
  shipping: z.object({
    name:    z.string().min(2),
    phone:   z.string().min(9),
    line1:   z.string().min(3),
    line2:   z.string().optional(),
    city:    z.string().min(2),
    county:  z.string().optional(),
    country: z.string().default('KE'),
  }),
  items: z.array(z.object({
    productId:  z.string().uuid(),
    variantId:  z.string().uuid().optional(),
    quantity:   z.number().int().positive(),
  })).min(1),
});
 
export const POST = withErrorHandler(async (req: NextRequest) => {
  // 1. Auth check
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw AppError.unauthorized();
 
  // 2. Validate
  const body = await req.json();
  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) throw AppError.validation('Invalid checkout data', { issues: parsed.error.issues });
 
  const { shipping, items, currency, paymentMethod, mpesaPhone } = parsed.data;
 
  // 3. Create order (status: pending)
  const { order, totalKes } = await orderService.createOrder({
    userId: user.id,
    currency,
    shipping,
    items,
  });
 
  // 4. Initiate payment
  if (paymentMethod === 'stripe') {
    const { clientSecret } = await paymentService.createStripeIntent(
      order.id, user.id, totalKes,
    );
    return NextResponse.json({
      data: { orderId: order.id, clientSecret, paymentMethod: 'stripe' }
    });
  }
 
  if (paymentMethod === 'mpesa') {
    if (!mpesaPhone) throw AppError.validation('M-Pesa phone number is required');
    const { checkoutRequestId } = await paymentService.initiateMpesa(
      order.id, user.id, mpesaPhone, totalKes,
    );
    return NextResponse.json({
      data: { orderId: order.id, checkoutRequestId, paymentMethod: 'mpesa' }
    });
  }
 
  throw AppError.validation('Invalid payment method');
});
