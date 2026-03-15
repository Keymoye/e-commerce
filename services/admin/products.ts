// services/admin/product.ts
import { createServerClient } from '@/lib/db/server';
import { AppError } from '@/errors/base-error';
import { logger } from '@/lib/logger';
import { productSchema, createProductSchema } from './product-schemas';
import { Product } from '@/types/product';
import { z } from 'zod';

export const adminProductService = {
  async getProducts(page: number, pageSize: number) {
    logger.debug({ message: 'Fetching admin products', page, pageSize });
    
    const supabase = await createServerClient();

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, count, error } = await supabase
      .from("products")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      logger.error({ message: 'Failed to fetch admin products', error: error.message });
      throw AppError.database('Failed to fetch products');
    }

    const result = {
      products: data ?? [],
      totalPages: Math.max(1, Math.ceil((count ?? 0) / pageSize)),
    };

    logger.info({ message: 'Admin products fetched successfully', count: result.products.length, totalPages: result.totalPages });
    return result;
  },

  async getProductById(id: string): Promise<Product> {
    logger.debug({ message: 'Fetching admin product by ID', productId: id });
    
    const supabase = await createServerClient();

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      logger.error({ message: 'Failed to fetch admin product', productId: id, error: error.message });
      throw AppError.notFound('Product not found');
    }

    logger.info({ message: 'Admin product fetched successfully', productId: id });
    return data;
  },

  async updateProduct(id: string, data: z.infer<typeof productSchema>) {
    logger.debug({ message: 'Updating admin product', productId: id });
    
    const parsed = productSchema.parse(data);
    const supabase = await createServerClient();

    const { error } = await supabase
      .from("products")
      .update({
        name: parsed.name,
        base_price_kes: parsed.base_price_kes,
        stock: parsed.stock,
        category_id: parsed.category_id,
      })
      .eq("id", id);

    if (error) {
      logger.error({ message: 'Failed to update admin product', productId: id, error: error.message });
      throw AppError.database('Failed to update product');
    }

    logger.info({ message: 'Admin product updated successfully', productId: id });
    return true;
  },

  async createProduct(data: z.infer<typeof createProductSchema>) {
    logger.debug({ message: 'Creating admin product' });
    
    const parsed = createProductSchema.parse(data);
    const supabase = await createServerClient();
    
    const { data: product, error } = await supabase
      .from("products")
      .insert([{
        name: parsed.name,
        base_price_kes: parsed.base_price_kes,
        stock: parsed.stock,
        category_id: parsed.category_id,
      }])
      .select()
      .single();

    if (error) {
      logger.error({ message: 'Failed to create admin product', error: error.message });
      throw AppError.database('Failed to create product');
    }

    logger.info({ message: 'Admin product created successfully', productId: product.id });
    return product;
  },

  async deleteProduct(productId: string) {
    logger.debug({ message: 'Deleting admin product', productId });
    
    const supabase = await createServerClient();
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", productId);

    if (error) {
      logger.error({ message: 'Failed to delete admin product', productId, error: error.message });
      throw AppError.database('Failed to delete product');
    }

    logger.info({ message: 'Admin product deleted successfully', productId });
    return true;
  },
};

// Export factory function for dependency injection
export function createAdminProductService() {
  return adminProductService;
}

// Legacy exports for backward compatibility
export const getAdminProducts = adminProductService.getProducts;
export const getAdminProductById = adminProductService.getProductById;
export const updateAdminProduct = adminProductService.updateProduct;
export const createAdminProduct = adminProductService.createProduct;
export const deleteAdminProduct = adminProductService.deleteProduct;
