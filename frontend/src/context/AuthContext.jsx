import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { logout as apiLogout } from '../api/auth';

const AuthContext = createContext(null);

const TOKENS_KEY = 'skillswap_tokens';
const USER_KEY = 'skillswap_user';

export function AuthProvider({ children }) {
  const [tokens, setTokens] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(TOKENS_KEY)) || null;
    } catch {
      return null;
    }
  });

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY)) || null;
    } catch {
      return null;
    }
  });

  // Listen for auto-logout events (from 401 interceptor)
  useEffect(() => {
    const handleLogout = () => {
      setTokens(null);
      setUser(null);
    };
    window.addEventListener('auth:logout', handleLogout);
    return () => window.removeEventListener('auth:logout', handleLogout);
  }, []);

  const login = useCallback((tokenData, userData) => {
    localStorage.setItem(TOKENS_KEY, JSON.stringify(tokenData));
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    setTokens(tokenData);
    setUser(userData);
  }, []);

  const logout = useCallback(async () => {
    try {
      if (tokens?.refresh) {
        await apiLogout(tokens.refresh);
      }
    } catch {
      // Ignore logout errors — clear state regardless
    } finally {
      localStorage.removeItem(TOKENS_KEY);
      localStorage.removeItem(USER_KEY);
      setTokens(null);
      setUser(null);
    }
  }, [tokens]);

  const updateUser = useCallback((updatedFields) => {
    setUser((prev) => {
      const next = { ...prev, ...updatedFields };
      localStorage.setItem(USER_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, tokens, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
