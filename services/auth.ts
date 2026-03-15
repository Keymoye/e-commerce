import { createServerClient } from '@/lib/db/server';
import { AppError } from '@/errors/base-error';
import { ErrorCode } from '@/errors/error-codes';
import { withServiceError } from '@/errors/error-handler';
import { logger } from '@/lib/logger';
import type { User } from '@supabase/supabase-js';

type LoginCredentials = { email: string; password: string };
type SignupData = { email: string; password: string; fullName: string };

export const auth = {
  async login(credentials: LoginCredentials): Promise<{ user: User }> {
    return withServiceError(async () => {
      const supabase = await createServerClient();
      const { data, error } = await supabase.auth.signInWithPassword(credentials);

      if (error) {
        logger.warn({ message: 'login failed', email: credentials.email, error: error.message });
        throw new AppError(
          error.message === 'Invalid login credentials' 
            ? 'Invalid email or password' 
            : error.message,
          401,
          ErrorCode.INVALID_CREDENTIALS
        );
      }

      logger.info({ message: 'user logged in', userId: data.user?.id });
      return { user: data.user! };
    }, { operation: 'login', email: credentials.email });
  },

  async signup(data: SignupData): Promise<{ user: User }> {
    return withServiceError(async () => {
      const supabase = await createServerClient();
      const { data: result, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: { data: { full_name: data.fullName } },
      });

      if (error) {
        logger.warn({ message: 'signup failed', email: data.email, error: error.message });
        throw new AppError(error.message, 400, ErrorCode.VALIDATION_ERROR);
      }

      logger.info({ message: 'user signed up', userId: result.user?.id });
      return { user: result.user! };
    }, { operation: 'signup', email: data.email });
  },

  async logout(): Promise<{ ok: boolean }> {
    return withServiceError(async () => {
      const supabase = await createServerClient();
      const { error } = await supabase.auth.signOut();

      if (error) {
        logger.error({ message: 'logout failed', error: error.message });
        throw new AppError('Logout failed', 400, ErrorCode.INTERNAL_ERROR);
      }

      logger.info({ message: 'user logged out' });
      return { ok: true };
    }, { operation: 'logout' });
  },

  async getUser(): Promise<User | null> {
    return withServiceError(async () => {
      const supabase = await createServerClient();
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error) {
        logger.warn({ message: 'get user failed', error: error.message });
        return null;
      }

      return user;
    }, { operation: 'getUser' });
  },
};
