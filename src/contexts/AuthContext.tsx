import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, loginUser, getSession, createSession, destroySession, getUserById, getCSRFToken } from '../utils/store';
import { logAudit } from '../utils/security';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string; requires2FA?: boolean }>;
  logout: () => void;
  refreshUser: () => void;
  csrfToken: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(() => {
    const session = getSession();
    if (session) {
      const userData = getUserById(session.userId);
      if (userData) {
        setUser(userData);
      } else {
        destroySession();
        setUser(null);
      }
    }
  }, []);

  useEffect(() => {
    const session = getSession();
    if (session) {
      const userData = getUserById(session.userId);
      if (userData) {
        setUser(userData);
      }
    }
    setIsLoading(false);

    // Session timeout checker
    const interval = setInterval(() => {
      const s = getSession();
      if (!s) {
        setUser(null);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const login = async (email: string, password: string) => {
    const result = loginUser(email, password);
    if (result.success && result.user && !result.requires2FA) {
      const csrfToken = getCSRFToken();
      createSession(result.user.id, csrfToken);
      setUser(result.user);
      logAudit('SESSION_CREATED', result.user.id, 'Nova sessão iniciada');
    }
    return { success: result.success, message: result.message, requires2FA: result.requires2FA };
  };

  const logout = () => {
    destroySession();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      logout,
      refreshUser,
      csrfToken: getCSRFToken(),
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
