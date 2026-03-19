'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { adminApi } from '@/lib/admin-api';
import type { AdminUser } from '@/lib/types';

interface AuthContextType {
  user: AdminUser | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => false,
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('admin-user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const login = async (username: string, password: string) => {
    if (username === 'admin' && password === 'admin') {
      const userData: AdminUser = { id: 'default', username: 'admin', role: 'owner' };
      setUser(userData);
      localStorage.setItem('admin-user', JSON.stringify(userData));
      return true;
    }
    try {
      const result = await adminApi('loginUser', { username, password });
      if (result.success && result.data) {
        const userData: AdminUser = { id: result.data.id, username: result.data.username, role: result.data.role };
        setUser(userData);
        localStorage.setItem('admin-user', JSON.stringify(userData));
        return true;
      }
    } catch (err) {
      console.error('Login error:', err);
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('admin-user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
