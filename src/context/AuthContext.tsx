import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import type { AuthUser, TokenPair, LoginPayload, RegisterPayload, ProfileUpdatePayload } from '../types/auth';
import * as authApi from '../api/auth';

interface AuthContextValue {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  getProfile: () => Promise<AuthUser>;
  updateUserProfile: (payload: ProfileUpdatePayload) => Promise<AuthUser>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const db = useSQLiteContext();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSession();
  }, []);

  async function loadSession() {
    try {
      const row = await db.getFirstAsync<{
        access_token: string;
        refresh_token: string;
        user_json: string;
      }>('SELECT access_token, refresh_token, user_json FROM auth_session WHERE id = 1');

      if (row) {
        setAccessToken(row.access_token);
        setRefreshToken(row.refresh_token);
        setUser(JSON.parse(row.user_json));
      }
    } catch (err) {
      console.warn('Failed to load auth session:', err);
    } finally {
      setIsLoading(false);
    }
  }

  async function saveSession(tokenPair: TokenPair, userData: AuthUser) {
    const userJson = JSON.stringify(userData);
    await db.runAsync(
      `INSERT OR REPLACE INTO auth_session (id, access_token, refresh_token, user_json)
       VALUES (1, ?, ?, ?)`,
      [tokenPair.accessToken, tokenPair.refreshToken, userJson],
    );
    setAccessToken(tokenPair.accessToken);
    setRefreshToken(tokenPair.refreshToken);
    setUser(userData);
  }

  async function clearSession() {
    await db.runAsync('DELETE FROM auth_session WHERE id = 1');
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
  }

  const login = useCallback(async (payload: LoginPayload) => {
    const res = await authApi.loginUser(payload);
    await saveSession(res, res.user);
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    const res = await authApi.registerUser(payload);
    await saveSession(res, res.user);
  }, []);

  const logout = useCallback(async () => {
    await clearSession();
  }, []);

  const refreshSession = useCallback(async () => {
    if (!refreshToken) {
      await clearSession();
      return;
    }
    try {
      const tokenPair = await authApi.refreshTokens(refreshToken);
      await db.runAsync(
        'UPDATE auth_session SET access_token = ?, refresh_token = ? WHERE id = 1',
        [tokenPair.accessToken, tokenPair.refreshToken],
      );
      setAccessToken(tokenPair.accessToken);
      setRefreshToken(tokenPair.refreshToken);
    } catch {
      await clearSession();
    }
  }, [refreshToken]);

  const getProfile = useCallback(async () => {
    if (!accessToken) throw new Error('Not authenticated');
    try {
      const profile = await authApi.fetchProfile(accessToken);
      setUser(profile);
      return profile;
    } catch {
      await refreshSession();
      if (accessToken) {
        const profile = await authApi.fetchProfile(accessToken);
        setUser(profile);
        return profile;
      }
      throw new Error('Session expired');
    }
  }, [accessToken, refreshSession]);

  const updateUserProfile = useCallback(async (payload: ProfileUpdatePayload) => {
    if (!accessToken) throw new Error('Not authenticated');
    try {
      const profile = await authApi.updateProfile(accessToken, payload);
      const userJson = JSON.stringify(profile);
      await db.runAsync('UPDATE auth_session SET user_json = ? WHERE id = 1', [userJson]);
      setUser(profile);
      return profile;
    } catch {
      await refreshSession();
      if (accessToken) {
        const profile = await authApi.updateProfile(accessToken, payload);
        setUser(profile);
        return profile;
      }
      throw new Error('Session expired');
    }
  }, [accessToken, refreshSession]);

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        refreshSession,
        getProfile,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
