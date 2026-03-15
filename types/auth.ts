export interface AuthUser {
  id: string;
  email: string;
  is_admin?: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name?: string;
}

export interface AuthSession {
  user: AuthUser;
  accessToken: string;
}
