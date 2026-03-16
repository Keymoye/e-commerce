import { NextResponse } from 'next/server';
import { withErrorHandler } from '@/errors/error-handler';
import { createServerClient } from '@/lib/db/server';
import { logger } from '@/lib/logger';

export const GET = withErrorHandler(async () => {
  const supabase = await createServerClient();

  // Since there's no dedicated categories table, extract unique category names from products
  const { data, error } = await supabase
    .from('products')
    .select('category_id')
    .not('category_id', 'is', null);

  if (error) {
    logger.error({ message: 'Failed to fetch categories', error: error.message });
    throw new Error('Failed to fetch categories');
  }

  // Extract unique category names and format as expected by the frontend
  const uniqueCategories = [...new Set(data?.map(p => p.category_id))]
    .filter(Boolean)
    .map(categoryId => ({
      id: categoryId,
      name: categoryId,
      slug: categoryId.toLowerCase().replace(/\s+/g, '-')
    }));

  logger.debug({ message: 'Categories fetched', count: uniqueCategories.length });

  return NextResponse.json({ data: uniqueCategories });
});
