export const CONFIG = {
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100,
  },
  PAYMENT: {
    SUPPORTED_METHODS: ['stripe', 'mpesa'] as const,
    DEFAULT_CURRENCY: 'KES',
  },
} as const;
