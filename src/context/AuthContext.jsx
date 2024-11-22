// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
 const [user, setUser] = useState(null);
 const [loading, setLoading] = useState(true);
 const [isAuthenticated, setIsAuthenticated] = useState(false);

 // Initial auth check
 useEffect(() => {
   const checkAuth = async () => {
     try {
       console.log('Checking auth status...');
       const response = await fetch('http://localhost:3000/auth/status', {
         credentials: 'include',
         headers: {
           'Accept': 'application/json',
           'Content-Type': 'application/json',
         }
       });
       
       if (!response.ok) throw new Error('Auth check failed');
       
       const data = await response.json();
       console.log('Auth status response:', data);
       
       if (data.hasTokens && data.hasUser) {
         setUser(data.user);
         setIsAuthenticated(true);
       } else {
         setUser(null);
         setIsAuthenticated(false);
       }
     } catch (error) {
       console.error('Auth check failed:', error);
       setUser(null);
       setIsAuthenticated(false);
     } finally {
       setLoading(false);
     }
   };

   checkAuth();
 }, []);

 const login = () => {
   console.log('Starting login process');
   window.location.href = 'http://localhost:3000/auth/google';
 };

 const logout = async () => {
   try {
     console.log('Starting logout process');
     const response = await fetch('http://localhost:3000/auth/logout', {
       method: 'GET',
       credentials: 'include',
       headers: {
         'Accept': 'application/json',
         'Content-Type': 'application/json',
       }
     });

     if (!response.ok) {
       throw new Error('Logout failed');
     }

     setUser(null);
     setIsAuthenticated(false);
     window.location.href = '/';
   } catch (error) {
     console.error('Logout failed:', error);
   }
 };

 const value = {
   user,
   loading,
   isAuthenticated,
   login,
   logout
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