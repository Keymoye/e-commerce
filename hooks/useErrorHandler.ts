'use client';
import { useCallback } from 'react';
import { useUIStore } from '@/store/uiStore';
import { isApiError } from '@/types/api.types';
import { ErrorCode } from '@/errors/errorCodes';
 
// Maps server error codes to user-friendly messages
const ERROR_MESSAGES: Partial<Record<ErrorCode, string>> = {
  [ErrorCode.UNAUTHORIZED]:        'Please sign in to continue.',
  [ErrorCode.FORBIDDEN]:           'You do not have permission to do that.',
  [ErrorCode.SESSION_EXPIRED]:     'Your session expired. Please sign in again.',
  [ErrorCode.NOT_FOUND]:           'That item could not be found.',
  [ErrorCode.OUT_OF_STOCK]:        'Sorry, this item is out of stock.',
  [ErrorCode.PAYMENT_FAILED]:      'Payment failed. Please try a different card.',
  [ErrorCode.VALIDATION_ERROR]:    'Please check form and try again.',
  [ErrorCode.INTERNAL_ERROR]:      'Something went wrong. Please try again.',
  [ErrorCode.RATE_LIMITED]:        'Too many requests. Please wait a moment.',
};
 
export function useErrorHandler() {
  const showToast = useUIStore((s) => s.showToast);
 
  const handleError = useCallback(
    (error: unknown, fallbackMessage = 'Something went wrong') => {
      // API response error (from our fetch calls)
      if (error && typeof error === 'object' && 'error' in error) {
        const apiError = error as { error: { code: string; message: string } };
        const msg = ERROR_MESSAGES[apiError.error.code as ErrorCode] ?? apiError.error.message;
        showToast({ type: 'error', message: msg });
        return;
      }
      // fetch() network error
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        showToast({ type: 'error', message: 'Network error. Check your connection.' });
        return;
      }
      // Unknown — show fallback
      showToast({ type: 'error', message: fallbackMessage });
    },
    [showToast],
  );
 
  return { handleError };
}
