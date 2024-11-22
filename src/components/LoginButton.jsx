// src/components/LoginButton.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function LoginButton() {
  const handleLogin = () => {
    window.location.href = '/auth/google';
  };

  return (
    <button
      onClick={handleLogin}
      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition"
    >
      Login with Google
    </button>
  );
}