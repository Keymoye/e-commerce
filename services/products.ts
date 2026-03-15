import { createServerClient } from '@/lib/db/server';
import { AppError } from '@/errors/base-error';
import { ErrorCode } from '@/errors/error-codes';
import { withServiceError } from '@/errors/error-handler';
import { logger } from '@/lib/logger';
import type { Product } from '@/types/product';

// ── Type for list result ──────────────────────────────────────────
type ListProductsResult = { products: Product[]; total: number };
type ListProductsParams = { page: number; pageSize: number; category?: string; q?: string };

export const productService = {

  async listProducts(params: ListProductsParams): Promise<ListProductsResult> {
    return withServiceError(async () => {
      const supabase = await createServerClient();
      const { page, pageSize, category, q } = params;
      const from = (page - 1) * pageSize;

      let query = supabase
        .from('products')
        .select('*', { count: 'exact' })
        .range(from, from + pageSize - 1);

      if (category) query = query.eq('category', category);
      if (q) query = query.or(`name.ilike.%${q}%,description.ilike.%${q}%`);

      const { data, error, count } = await query;

      if (error) {
        logger.error({ message: 'DB error in listProducts', error: error.message });
        throw new AppError('Failed to fetch products', 500, ErrorCode.DATABASE_ERROR);
      }

      logger.info({ message: 'listProducts', total: count, params });
      return { products: (data ?? []) as Product[], total: count ?? 0 };
    }, { operation: 'listProducts', params });
  },

  async getProductById(id: string): Promise<Product> {
    return withServiceError(async () => {
      const supabase = await createServerClient();
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) throw AppError.notFound(`Product '${id}'`);

      return data as Product;
    }, { operation: 'getProductById', id });
  },

  // ... more methods follow the same pattern
};
