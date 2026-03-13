import { NextResponse } from 'next/server';
import { withErrorHandler } from '@/errors/withErrorHandler';
import { auth } from '@/services/auth.service';

export const POST = withErrorHandler(async () => {
  const result = await auth.logout();
  return NextResponse.json({ data: result });
});
