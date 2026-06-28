export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  bio: string | null;
  preferences: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse extends TokenPair {
  user: AuthUser;
}

export interface ProfileUpdatePayload {
  name?: string;
  avatar_url?: string;
  bio?: string;
  preferences?: Record<string, unknown>;
}
