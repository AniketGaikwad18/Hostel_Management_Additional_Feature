'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/lib/types';
import { api } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<User>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const savedToken = localStorage.getItem('hostelsphere_token');
    const savedUser = localStorage.getItem('hostelsphere_user');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('hostelsphere_token');
        localStorage.removeItem('hostelsphere_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<User> => {
    setIsLoading(true);
    try {
      const res = await api.auth.login({ username, password });
      const { access_token, user: loggedUser } = res.data;
      
      setToken(access_token);
      setUser(loggedUser);

      localStorage.setItem('hostelsphere_token', access_token);
      localStorage.setItem('hostelsphere_user', JSON.stringify(loggedUser));

      return loggedUser;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('hostelsphere_token');
    localStorage.removeItem('hostelsphere_user');
    setToken(null);
    setUser(null);
    router.push('/login');
  };

  const refreshUser = async () => {
    try {
      const res = await api.auth.me();
      setUser(res.data);
      localStorage.setItem('hostelsphere_user', JSON.stringify(res.data));
    } catch (e) {
      // Token might be expired
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, refreshUser }}>
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
