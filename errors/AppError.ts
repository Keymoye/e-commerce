import { ErrorCode } from './errorCodes';
 
export class AppError extends Error {
  readonly statusCode: number;
  readonly code: ErrorCode;
  readonly isOperational: boolean; // true = expected, false = bug/crash
  readonly context?: Record<string, unknown>;
 
  constructor(
    message: string,
    statusCode: number = 500,
    code: ErrorCode = ErrorCode.INTERNAL_ERROR,
    context?: Record<string, unknown>,
    isOperational: boolean = true,
  ) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    this.context = context;
    Error.captureStackTrace(this, this.constructor);
  }
 
  // ── Static factories for most common cases ──────────────────────
  static notFound(resource: string): AppError {
    return new AppError(`${resource} not found`, 404, ErrorCode.NOT_FOUND);
  }
  static unauthorized(msg = 'Authentication required'): AppError {
    return new AppError(msg, 401, ErrorCode.UNAUTHORIZED);
  }
  static forbidden(msg = 'Insufficient permissions'): AppError {
    return new AppError(msg, 403, ErrorCode.FORBIDDEN);
  }
  static validation(msg: string, context?: Record<string, unknown>): AppError {
    return new AppError(msg, 422, ErrorCode.VALIDATION_ERROR, context);
  }
  static conflict(msg: string): AppError {
    return new AppError(msg, 409, ErrorCode.CONFLICT);
  }
  static external(service: string, cause?: unknown): AppError {
    return new AppError(
      `External service error: ${service}`,
      502, ErrorCode.EXTERNAL_SERVICE_ERROR,
      { service, cause: String(cause) },
    );
  }
 
  // ── Serialise for API responses (never expose stack in production) ───
  toResponse() {
    return {
      error: {
        code: this.code,
        message: this.message,
        ...(process.env.NODE_ENV === 'development' && {
          context: this.context,
          stack: this.stack,
        }),
      },
    };
  }
 
  static isAppError(e: unknown): e is AppError {
    return e instanceof AppError;
  }
}
