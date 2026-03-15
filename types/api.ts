import { ErrorCode } from '@/errors/errorCodes';
 
// Success response
export type ApiSuccess<T> = {
  data: T;
  meta?: {
    page?: number;
    pageSize?: number;
    total?: number;
  };
};
 
// Error response (matches AppError.toResponse())
export type ApiError = {
  error: {
    code: ErrorCode;
    message: string;
    context?: Record<string, unknown>; // dev only
  };
};
 
// Union type — what every API call returns
export type ApiResponse<T> = ApiSuccess<T> | ApiError;
 
// Type guard
export function isApiError(res: ApiResponse<unknown>): res is ApiError {
  return 'error' in res;
}
