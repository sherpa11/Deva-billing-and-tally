import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('deva_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('deva_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const verifyUser = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me', { timeout: 3500 });
          if (isMounted && res.data && res.data.success) {
            setUser(res.data.user);
            localStorage.setItem('deva_user', JSON.stringify(res.data.user));
          } else if (isMounted) {
            logout();
          }
        } catch (err) {
          console.error('Auth verification failed or timed out:', err.message);
          if (isMounted) {
            logout();
          }
        }
      }
      if (isMounted) {
        setLoading(false);
      }
    };

    verifyUser();

    // Failsafe timer: Ensure loading never hangs on a white screen
    const timer = setTimeout(() => {
      if (isMounted) {
        setLoading(false);
      }
    }, 4000);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [token]);

  const login = async (username, password) => {
    const res = await api.post('/auth/login', { username, password });
    if (res.data.success) {
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('deva_token', res.data.token);
      localStorage.setItem('deva_user', JSON.stringify(res.data.user));
      return res.data;
    }
    throw new Error(res.data.message || 'Login failed');
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('deva_token');
    localStorage.removeItem('deva_user');
  };

  const isAdmin = user?.role === 'ADMIN';

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
