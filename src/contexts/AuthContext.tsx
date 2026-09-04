'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, RoleType } from '@/types/store';
import { storeApi, setToken, removeToken, getToken } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<{ success: boolean; message?: string }>;
  register: (data: {
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    password: string;
  }) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check localStorage on client mount
    const savedToken = getToken();
    const savedUserStr = localStorage.getItem('vixy_user');

    if (savedToken) {
      setTokenState(savedToken);
      if (savedUserStr) {
        try {
          setUser(JSON.parse(savedUserStr));
        } catch (e) {
          // ignore error
        }
      }

      // Fetch fresh profile from API
      storeApi.getProfile()
        .then((res) => {
          if (res.success && res.data) {
            setUser(res.data);
            localStorage.setItem('vixy_user', JSON.stringify(res.data));
          } else if (res.message?.includes('token') || res.message?.includes('invalido') || res.message?.includes('expirado')) {
            // Token expired
            removeToken();
            setUser(null);
            setTokenState(null);
          }
        })
        .catch(() => {})
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    setIsLoading(true);
    try {
      const res = await storeApi.login(credentials);
      if (res.success && res.token && res.user) {
        setToken(res.token);
        setTokenState(res.token);
        setUser(res.user);
        localStorage.setItem('vixy_user', JSON.stringify(res.user));
        return { success: true };
      }
      return { success: false, message: res.message || 'Credenciales inválidas' };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Error al iniciar sesión' };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: {
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    password: string;
  }) => {
    setIsLoading(true);
    try {
      const res = await storeApi.register(data);
      if (res.success && res.token && res.user) {
        setToken(res.token);
        setTokenState(res.token);
        setUser(res.user);
        localStorage.setItem('vixy_user', JSON.stringify(res.user));
        return { success: true };
      }
      return { success: false, message: res.message || 'Error al registrarse' };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Error de registro' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await storeApi.logout();
    } catch {
      // ignore
    } finally {
      removeToken();
      setUser(null);
      setTokenState(null);
    }
  };

  const refreshProfile = async () => {
    if (!token) return;
    try {
      const res = await storeApi.getProfile();
      if (res.success && res.data) {
        setUser(res.data);
        localStorage.setItem('vixy_user', JSON.stringify(res.data));
      }
    } catch {
      // ignore
    }
  };

  const role = user?.role as RoleType | undefined;
  const isAdmin = role === 'administrator' || role === 'secretary';
  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isAdmin,
        isLoading,
        login,
        register,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
