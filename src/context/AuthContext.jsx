// src/contexts/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const checkAuth = useCallback(async () => {
    try {
      const userData = await authService.getUser();
      setUser(userData);
      setIsAuthenticated(!!userData);
    } catch (err) {
      console.error('Auth check failed:', err);
      setUser(null);
      setIsAuthenticated(false);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(() => {
    try {
      authService.login();
    } catch (err) {
      console.error('Login failed:', err);
      setError(err);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false);
    } catch (err) {
      console.error('Logout failed:', err);
      setError(err);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const value = {
    user,
    loading,
    error,
    isAuthenticated,
    login,
    logout,
    checkAuth
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
    </div>;
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};