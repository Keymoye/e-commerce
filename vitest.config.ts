// vitest.config.ts
import { defineConfig } from 'vitest/config';
import path from 'path';
import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

export default defineConfig({
  test: {
    environment: 'node',
    setupFiles: ['./tests/setup.ts'],
    env: {
      // Variables are loaded above
      SUPABASE_TEST_URL: process.env.SUPABASE_TEST_URL!,
      SUPABASE_TEST_SERVICE_KEY: process.env.SUPABASE_TEST_SERVICE_KEY!,
      SUPABASE_TEST_ANON_KEY: process.env.SUPABASE_TEST_ANON_KEY!,
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['services/**', 'lib/**', 'app/api/**'],
      exclude: ['**/*.test.ts', 'lib/supabase/**'],
    },
    globals: true,
    testTimeout: 30000,  // 30s for integration tests hitting real Supabase
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
});
