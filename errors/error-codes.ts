export const ErrorCode = {
  // ── Auth ──────────────────────────────────────────────────────────────
  UNAUTHORIZED:            'AUTH_001',
  FORBIDDEN:               'AUTH_002',
  SESSION_EXPIRED:         'AUTH_003',
  EMAIL_NOT_VERIFIED:      'AUTH_004',
  INVALID_CREDENTIALS:     'AUTH_005',
 
  // ── Validation ────────────────────────────────────────────────────────
  VALIDATION_ERROR:        'VAL_001',
  MISSING_REQUIRED_FIELD:  'VAL_002',
  INVALID_FORMAT:          'VAL_003',
 
  // ── Resources ─────────────────────────────────────────────────────────
  NOT_FOUND:               'RES_001',
  CONFLICT:                'RES_002',
  OUT_OF_STOCK:            'RES_003',
 
  // ── Payments ──────────────────────────────────────────────────────────
  PAYMENT_FAILED:          'PAY_001',
  PAYMENT_CANCELLED:       'PAY_002',
  INVALID_PAYMENT_INTENT:  'PAY_003',
 
  // ── Orders ────────────────────────────────────────────────────────────
  ORDER_NOT_FOUND:         'ORD_001',
  ORDER_CANNOT_CANCEL:     'ORD_002',
 
  // ── External services ─────────────────────────────────────────────────
  EXTERNAL_SERVICE_ERROR:  'EXT_001',
  DATABASE_ERROR:          'EXT_002',
 
  // ── Internal ──────────────────────────────────────────────────────────
  INTERNAL_ERROR:          'INT_001',
  RATE_LIMITED:            'INT_002',
} as const;
 
export type ErrorCode = typeof ErrorCode[keyof typeof ErrorCode];
