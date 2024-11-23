// src/components/AuthSuccess.jsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AuthSuccess = () => {
  const navigate = useNavigate();
  const { checkAuth } = useAuth();

  useEffect(() => {
    const completeAuth = async () => {
      try {
        console.log('Starting auth check...');
        await checkAuth();
        console.log('Auth check completed');
        // Use window.history to properly handle SPA navigation
        window.history.replaceState({}, '', '/glasses');
        navigate('/glasses', { replace: true });
      } catch (error) {
        console.error('Auth completion failed:', error);
        navigate('/', { replace: true });
      }
    };

    completeAuth();
  }, [checkAuth, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      <p className="mt-4 text-gray-600">Completing login...</p>
    </div>
  );
};

export default AuthSuccess;