// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from 'react';
import AuthService from '../services/AuthService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const authService = new AuthService();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('[AuthContext] Checking authentication status');
        const user = await authService.getUser();
        console.log('[AuthContext] Retrieved user:', user);
        if (user) {
          console.log('[AuthContext] User is authenticated');
          setUser(user);
          setIsAuthenticated(true);
        } else {
          console.log('[AuthContext] User is not authenticated');
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('[AuthContext] Error checking authentication:', error);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        console.log('[AuthContext] Authentication check complete');
        setLoading(false);
      }
    };
    checkAuth();
  }, [authService]);

  const login = () => {
    console.log('[AuthContext] Starting login process');
    authService.startAuth().then((authUrl) => {
      console.log('[AuthContext] Redirecting user to Google OAuth2 authorization URL:', authUrl);
      window.location.href = authUrl;
    }).catch((error) => {
      console.error('[AuthContext] Error starting authentication:', error);
    });
  };

  const logout = async () => {
    try {
      console.log('[AuthContext] Starting logout process');
      await authService.logout();
      console.log('[AuthContext] User logged out successfully');
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('[AuthContext] Error during logout:', error);
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
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