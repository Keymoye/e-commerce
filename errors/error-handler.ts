import { NextRequest, NextResponse } from 'next/server';
import { AppError } from './AppError';
import { ErrorCode } from './errorCodes';
import { logger } from '@/logger';
 
type ApiHandler = (req: NextRequest, ctx?: unknown) => Promise<NextResponse>;
 
/**
 * Wraps a Next.js API route handler.
 * Catches all errors, logs them, and returns a consistent JSON error response.
 * Usage: export const GET = withErrorHandler(async (req) => { ... })
 */
export function withErrorHandler(handler: ApiHandler): ApiHandler {
  return async (req, ctx) => {
    const requestId = req.headers.get('x-request-id') ?? crypto.randomUUID();
    try {
      return await handler(req, ctx);
    } catch (error) {
      if (AppError.isAppError(error)) {
        // Operational error — expected, log at warn level
        if (error.isOperational) {
          logger.warn({
            requestId,
            code: error.code,
            message: error.message,
            context: error.context,
          });
        } else {
          // Non-operational AppError = programmer mistake, log as error
          logger.error({
            requestId,
            code: error.code,
            message: error.message,
            stack: error.stack,
          });
        }
        return NextResponse.json(error.toResponse(), { status: error.statusCode });
      }
      // Unknown error — convert and log as critical
      logger.error({
        requestId,
        message: 'Unexpected error',
        error: String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      const appError = new AppError(
        'An unexpected error occurred',
        500,
        ErrorCode.INTERNAL_ERROR,
        undefined,
        false, // NOT operational
      );
      return NextResponse.json(appError.toResponse(), { status: 500 });
    }
  };
}
 
/**
 * Wraps a plain async service function (for use outside API routes).
 * Usage: const result = await withServiceError(() => myService.doThing())
 */
export async function withServiceError<T>(
  fn: () => Promise<T>,
  context?: Record<string, unknown>,
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (AppError.isAppError(error)) throw error; // already typed, re-throw
    logger.error({ message: 'Service error', error: String(error), context });
    throw new AppError(
      'A service error occurred',
      500,
      ErrorCode.INTERNAL_ERROR,
      context,
      false,
    );
  }
}
