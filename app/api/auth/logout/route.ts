import { NextResponse } from 'next/server';
import { withErrorHandler } from '@/errors/error-handler';
import { auth } from '@/services/auth';

export const POST = withErrorHandler(async () => {
  const result = await auth.logout();
  return NextResponse.json({ data: result });
});
