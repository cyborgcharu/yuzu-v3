// src/components/Navigation.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navigation = () => {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <nav className="bg-slate-800/95 backdrop-blur-sm text-white fixed top-0 left-0 right-0 z-50">
      <div className="flex justify-between items-center p-4">
        <h1 className="font-bold">Yuzu Meet</h1>
        <div className="flex items-center space-x-6">
          <Link to="/" className="hover:text-slate-300">Home</Link>
          {isAuthenticated && (
            <>
              <Link to="/glasses" className="hover:text-slate-300">Glasses</Link>
              <Link to="/wrist" className="hover:text-slate-300">Wrist</Link>
              <Link to="/ring" className="hover:text-slate-300">Ring</Link>
              <div className="flex items-center space-x-4">
                {user?.picture && (
                  <img 
                    src={user.picture} 
                    alt={user.name}
                    className="w-8 h-8 rounded-full"
                  />
                )}
                <span className="text-sm">{user?.name}</span>
                <button 
                  onClick={logout}
                  className="text-sm hover:text-slate-300"
                >
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;