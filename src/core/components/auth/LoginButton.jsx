// src/components/LoginButton.jsx
import React from 'react';
import { useAuth } from '../context/AuthContext';

const LoginButton = () => {
  const { login } = useAuth();

  return (
    <button
      onClick={login}
      className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg"
    >
      Sign in with Google
    </button>
  );
};

export default LoginButton;