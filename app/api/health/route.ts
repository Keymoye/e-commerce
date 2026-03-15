import { NextResponse } from 'next/server';
import { withErrorHandler } from '@/errors/error-handler';

export const GET = withErrorHandler(async () => {
  return NextResponse.json({
    data: { 
      status: 'ok', 
      ts: Date.now(),
      version: '1.0.0'
    }
  });
});
