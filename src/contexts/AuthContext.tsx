'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface User {
  email: string;
  name: string;
  role: string;
  division: string;
}

interface AuthContextType {
  user: User | null;
  isReady: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isReady, setIsReady] = useState(false);

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem('streamliner_user');
      setUser(stored ? JSON.parse(stored) as User : null);
    } catch {
      localStorage.removeItem('streamliner_user');
      setUser(null);
    } finally {
      setIsReady(true);
    }
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    // Mock authentication
    if (email && password) {
      const mockUser: User = {
        email,
        name: email.split('@')[0].replace('.', ' ').replace(/\b\w/g, c => c.toUpperCase()),
        role: 'Admin',
        division: 'DEFAULT',
      };
      setUser(mockUser);
      localStorage.setItem('streamliner_user', JSON.stringify(mockUser));
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('streamliner_user');
  }, []);

  return (
    <AuthContext.Provider value={{ user, isReady, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
