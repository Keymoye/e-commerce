import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandler } from '@/errors/error-handler';
import { AppError } from '@/errors/base-error';
import { logger } from '@/lib/logger';
import { isAdmin } from '@/lib/auth/permissions';
import { createAdminSupabase } from '@/lib/db/admin';

export const POST = withErrorHandler(async (req: NextRequest) => {
  const admin = await isAdmin();
  if (!admin) throw AppError.forbidden('Admin access required');

  const formData = await req.formData();
  const file = formData.get('file') as File | null;

  if (!file) throw AppError.validation('No file provided');

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowedTypes.includes(file.type)) {
    throw AppError.validation('Only JPEG, PNG, WebP and GIF images are allowed');
  }

  if (file.size > 5 * 1024 * 1024) {
    throw AppError.validation('File size must be under 5MB');
  }

  const ext = file.name.split('.').pop() ?? 'jpg';
  const filename = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const supabase = createAdminSupabase();
  const bytes = await file.arrayBuffer();

  const { error } = await supabase.storage
    .from('product-images')
    .upload(filename, Buffer.from(bytes), {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    logger.error({ message: 'Failed to upload image', error: error.message });
    throw AppError.database('Failed to upload image');
  }

  const { data: { publicUrl } } = supabase.storage
    .from('product-images')
    .getPublicUrl(filename);

  logger.info({ message: 'Image uploaded', filename });
  return NextResponse.json({ url: publicUrl });
});
