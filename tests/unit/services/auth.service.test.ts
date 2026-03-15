import { describe, it, expect, vi, beforeEach } from 'vitest';
import { auth } from '@/services/auth'; 
 
vi.mock('@/lib/db/server', () => ({ createServerClient: vi.fn() }));
import { createServerClient } from '@/lib/db/server'; 
 
const makeAuthMock = (overrides = {}) => ({
  auth: {
    signInWithPassword: vi.fn().mockResolvedValue({ data: { user: { id: 'u1' }, session: {} }, error: null }),
    signUp:             vi.fn().mockResolvedValue({ data: { user: { id: 'u1' } }, error: null }),
    signOut:            vi.fn().mockResolvedValue({ error: null }),
    getUser:            vi.fn().mockResolvedValue({ data: { user: { id: 'u1' } }, error: null }),
    ...overrides,
  },
});
 
describe('auth.login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
 
  it('returns user on successful login', async () => {
    (createServerClient as any).mockResolvedValue(makeAuthMock());
    const result = await auth.login({ email: 'test@example.com', password: 'Pass123!' });
    expect(result.user).toBeDefined();
  });
 
  it('throws INVALID_CREDENTIALS on wrong password', async () => {
    (createServerClient as any).mockResolvedValue(makeAuthMock({
      signInWithPassword: vi.fn().mockResolvedValue({
        data: { user: null, session: null }, error: { message: 'Invalid credentials' }
      }),
    }));
    await expect(auth.login({ email: 'test@example.com', password: 'wrong' }))
      .rejects.toMatchObject({ statusCode: 401 });
  });
});
 
describe('auth.signup', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
 
  it('throws on duplicate email', async () => {
    (createServerClient as any).mockResolvedValue(makeAuthMock({
      signUp: vi.fn().mockResolvedValue({
        data: { user: null }, error: { message: 'User already registered' }
      }),
    }));
    await expect(auth.signup({ email: 'existing@example.com', password: 'Pass123!', fullName: 'Test User' }))
      .rejects.toThrow();
  });
});
