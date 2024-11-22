// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from 'react';
import AuthService from '../services/AuthService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const authService = new AuthService();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      setError(null);
      const userData = await authService.getUser();
      setUser(userData);
    } catch (error) {
      console.error('Auth check failed:', error);
      setError(error.message);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = () => {
    try {
      authService.startAuth();
    } catch (error) {
      console.error('Login failed:', error);
      setError(error.message);
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export { AuthContext };
export default AuthContext;