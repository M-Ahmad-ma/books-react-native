import { Platform } from 'react-native';
import type {
  AuthResponse,
  AuthUser,
  LoginPayload,
  RegisterPayload,
  ProfileUpdatePayload,
} from '../types/auth';

const API_BASE = "https://books-auth-api-production.up.railway.app/api"

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let message = 'Request failed';
    try {
      const body = await res.json();
      message = body.message || message;
    } catch { }
    throw new Error(message);
  }
  return res.json();
}

function authHeaders(token?: string | null): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

export async function loginUser(payload: LoginPayload): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse<AuthResponse>(res);
}

export async function registerUser(
  payload: RegisterPayload,
): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse<AuthResponse>(res);
}

export async function refreshTokens(
  refreshToken: string,
): Promise<{ accessToken: string; refreshToken: string }> {
  const res = await fetch(`${API_BASE}/auth/refresh`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ refreshToken }),
  });
  return handleResponse<{ accessToken: string; refreshToken: string }>(res);
}

export async function fetchProfile(
  accessToken: string,
): Promise<AuthUser> {
  const res = await fetch(`${API_BASE}/profile`, {
    headers: authHeaders(accessToken),
  });
  return handleResponse<AuthUser>(res);
}

export async function updateProfile(
  accessToken: string,
  payload: ProfileUpdatePayload,
): Promise<AuthUser> {
  const res = await fetch(`${API_BASE}/profile`, {
    method: 'PUT',
    headers: authHeaders(accessToken),
    body: JSON.stringify(payload),
  });
  return handleResponse<AuthUser>(res);
}
