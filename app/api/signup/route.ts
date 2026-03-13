import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withErrorHandler } from '@/errors/withErrorHandler';
import { AppError } from '@/errors/AppError';
import { auth } from '@/services/auth.service';

const signupSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  fullName: z.string().min(2, 'Full name is required'),
});

export const POST = withErrorHandler(async (req: NextRequest) => {
  const body = await req.json();
  const params = signupSchema.safeParse(body);
  if (!params.success) {
    throw AppError.validation('Invalid signup data', { issues: params.error.issues });
  }
  const result = await auth.signup(params.data);
  return NextResponse.json({ data: result }, { status: 201 });
});
