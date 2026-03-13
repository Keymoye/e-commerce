// services/order.service.ts
import { createServerClient } from '@/lib/supabase/server';
import { AppError } from '@/errors/AppError';
import { ErrorCode } from '@/errors/errorCodes';
import { withServiceError } from '@/errors/withErrorHandler';
import { logger } from '@/logger';
 
export interface CreateOrderInput {
  userId:   string;
  currency: 'KES' | 'USD';
  shipping: {
    name:    string;
    phone:   string;
    line1:   string;
    line2?:  string;
    city:    string;
    county?: string;
    country: string;
  };
  items: Array<{
    productId:  string;
    variantId?: string;
    quantity:   number;
  }>;
}
 
export const orderService = {
 
  async createOrder(input: CreateOrderInput) {
    return withServiceError(async () => {
      const supabase = await createServerClient();
 
      // 1. Validate all items exist and have sufficient stock
      const productIds = input.items.map(i => i.productId);
      const { data: products, error: prodErr } = await supabase
        .from('products')
        .select('id, name, base_price_kes, base_price_usd, stock, has_variants')
        .in('id', productIds)
        .eq('is_active', true);
 
      if (prodErr || !products?.length) {
        throw AppError.validation('One or more products are unavailable');
      }
 
      // 2. Build order items with price snapshots
      let subtotalKes = 0;
      const orderItems = [];
 
      for (const item of input.items) {
        const product = products.find(p => p.id === item.productId);
        if (!product) throw AppError.notFound(`Product ${item.productId}`);
 
        let unitPriceKes = product.base_price_kes;
        let variantName: string | undefined;
 
        // Check variant stock if applicable
        if (item.variantId) {
          const { data: variant } = await supabase
            .from('product_variants')
            .select('name, price_kes, stock')
            .eq('id', item.variantId)
            .single();
 
          if (!variant) throw AppError.notFound('Product variant');
          if (variant.stock < item.quantity) {
            throw new AppError(`Insufficient stock for ${product.name}`, 409, ErrorCode.OUT_OF_STOCK);
          }
          if (variant.price_kes) unitPriceKes = variant.price_kes;
          variantName = variant.name;
        } else if (product.stock < item.quantity) {
          throw new AppError(`Insufficient stock for ${product.name}`, 409, ErrorCode.OUT_OF_STOCK);
        }
 
        const totalKes = unitPriceKes * item.quantity;
        subtotalKes += totalKes;
 
        orderItems.push({
          product_id:     item.productId,
          variant_id:     item.variantId ?? null,
          product_name:   product.name,
          variant_name:   variantName ?? null,
          unit_price_kes: unitPriceKes,
          quantity:       item.quantity,
          total_kes:      totalKes,
        });
      }
 
      const shippingFeeKes = 30000; // KES 300.00 flat rate
      const totalKes = subtotalKes + shippingFeeKes;
 
      // 3. Insert order
      const { data: order, error: orderErr } = await supabase
        .from('orders')
        .insert({
          user_id:          input.userId,
          status:           'pending',
          currency:         input.currency,
          subtotal_kes:     subtotalKes,
          shipping_fee_kes: shippingFeeKes,
          total_kes:        totalKes,
          shipping_name:    input.shipping.name,
          shipping_phone:   input.shipping.phone,
          shipping_line_1:  input.shipping.line1,
          shipping_line_2:  input.shipping.line2 ?? null,
          shipping_city:    input.shipping.city,
          shipping_county:  input.shipping.county ?? null,
          shipping_country: input.shipping.country,
        })
        .select()
        .single();
 
      if (orderErr || !order) {
        logger.error({ message: 'Order insert failed', error: orderErr?.message });
        throw new AppError('Failed to create order', 500, ErrorCode.DATABASE_ERROR);
      }
 
      // 4. Insert order items
      const { error: itemsErr } = await supabase
        .from('order_items')
        .insert(orderItems.map(item => ({ ...item, order_id: order.id })));
 
      if (itemsErr) {
        logger.error({ message: 'Order items insert failed', error: itemsErr.message });
        throw new AppError('Failed to create order items', 500, ErrorCode.DATABASE_ERROR);
      }
 
      logger.info({ message: 'Order created', orderId: order.id, totalKes });
      return { order, totalKes, subtotalKes, shippingFeeKes };
    }, { operation: 'createOrder', userId: input.userId });
  },
 
  async updateStatus(orderId: string, status: string, extra?: Record<string, unknown>) {
    return withServiceError(async () => {
      const supabase = await createServerClient();
      const { error } = await supabase
        .from('orders')
        .update({ status, ...extra })
        .eq('id', orderId);
      if (error) throw new AppError('Status update failed', 500, ErrorCode.DATABASE_ERROR);
      logger.info({ message: 'Order status updated', orderId, status });
    }, { operation: 'updateStatus', orderId });
  },
};
