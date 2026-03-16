import { createServerClient } from '@/lib/db/server';
import { AppError } from '@/errors/base-error';
import { logger } from '@/lib/logger';
import { createProductSchema, updateProductSchema } from './product-schemas';
import type {
  AdminProduct,
  AdminProductsResult,
  GetProductsOptions,
} from '@/types/product';
import type { CreateProductInput, UpdateProductInput } from './product-schemas';

export const adminProductService = {
  async getProducts(options: GetProductsOptions = {}): Promise<AdminProductsResult> {
    const { page = 1, pageSize = 10, search, category, isActive } = options;
    logger.debug({ message: 'Fetching admin products', page, pageSize, search, category });

    const supabase = await createServerClient();
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from('products')
      .select('*, category:categories(id, name)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (search) query = query.ilike('name', `%${search}%`);
    if (category) query = query.eq('category_id', category);
    if (typeof isActive === 'boolean') query = query.eq('is_active', isActive);

    const { data, count, error } = await query;

    if (error) {
      logger.error({ message: 'Failed to fetch admin products', error: error.message });
      throw AppError.database('Failed to fetch products');
    }

    return {
      products: (data ?? []) as AdminProduct[],
      totalPages: Math.max(1, Math.ceil((count ?? 0) / pageSize)),
      total: count ?? 0,
    };
  },

  async getProductById(id: string): Promise<AdminProduct> {
    logger.debug({ message: 'Fetching admin product by ID', productId: id });
    const supabase = await createServerClient();

    const { data, error } = await supabase
      .from('products')
      .select('*, category:categories(id, name)')
      .eq('id', id)
      .single();

    if (error || !data) {
      logger.error({ message: 'Failed to fetch admin product', productId: id, error: error?.message });
      throw AppError.notFound('Product not found');
    }

    logger.info({ message: 'Admin product fetched successfully', productId: id });
    return data as AdminProduct;
  },

  async createProduct(input: CreateProductInput): Promise<AdminProduct> {
    logger.debug({ message: 'Creating admin product' });
    const parsed = createProductSchema.parse(input);
    const supabase = await createServerClient();

    const { data, error } = await supabase
      .from('products')
      .insert([{
        name: parsed.name,
        description: parsed.description,
        slug: parsed.slug,
        brand: parsed.brand,
        base_price_kes: parsed.base_price_kes,
        base_price_usd: parsed.base_price_usd,
        stock: parsed.stock,
        category_id: parsed.category_id,
        images: parsed.images,
        tags: parsed.tags,
        is_active: parsed.is_active,
      }])
      .select('*, category:categories(id, name)')
      .single();

    if (error) {
      logger.error({ message: 'Failed to create admin product', error: error.message });
      if (error.message.includes('slug')) throw AppError.validation('A product with this slug already exists');
      throw AppError.database('Failed to create product');
    }

    logger.info({ message: 'Admin product created successfully', productId: data.id });
    return data as AdminProduct;
  },

  async updateProduct(id: string, input: UpdateProductInput): Promise<AdminProduct> {
    logger.debug({ message: 'Updating admin product', productId: id });
    const parsed = updateProductSchema.parse(input);
    const supabase = await createServerClient();

    const { data, error } = await supabase
      .from('products')
      .update({ ...parsed, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*, category:categories(id, name)')
      .single();

    if (error) {
      logger.error({ message: 'Failed to update admin product', productId: id, error: error.message });
      throw AppError.database('Failed to update product');
    }

    logger.info({ message: 'Admin product updated successfully', productId: id });
    return data as AdminProduct;
  },

  async deleteProduct(productId: string): Promise<void> {
    logger.debug({ message: 'Deleting admin product', productId });
    const supabase = await createServerClient();

    const { error } = await supabase.from('products').delete().eq('id', productId);

    if (error) {
      logger.error({ message: 'Failed to delete admin product', productId, error: error.message });
      if (error.message.includes('order_items')) {
        throw AppError.validation(
          'This product cannot be deleted because it has existing orders. Set it to Draft instead.'
        );
      }
      throw AppError.database('Failed to delete product');
    }

    logger.info({ message: 'Admin product deleted successfully', productId });
  },
};

export function createAdminProductService() {
  return adminProductService;
}

export const getAdminProductById =
  adminProductService.getProductById.bind(adminProductService);
