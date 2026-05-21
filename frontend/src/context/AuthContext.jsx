import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { logout as apiLogout } from '../api/auth';

const AuthContext = createContext(null);

const USER_KEY = 'skillswap_user';

export function AuthProvider({ children }) {
  const [tokens, setTokens] = useState(() => {
    const access = localStorage.getItem('access_token');
    const refresh = localStorage.getItem('refresh_token');
    return access ? { access, refresh } : null;
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
    localStorage.setItem('access_token', tokenData.access);
    localStorage.setItem('refresh_token', tokenData.refresh);
    if (userData) {
      localStorage.setItem(USER_KEY, JSON.stringify(userData));
    }
    setTokens(tokenData);
    setUser(userData || null);
  }, []);

  const logout = useCallback(async () => {
    try {
      if (tokens?.refresh) {
        await apiLogout(tokens.refresh);
      }
    } catch {
      // Ignore logout errors — clear state regardless
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
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
