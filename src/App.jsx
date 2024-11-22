// src/App.jsx
import React, { useEffect } from 'react';
import { 
  BrowserRouter, 
  Routes, 
  Route, 
  Navigate, 
  Link,
  useNavigate 
} from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginButton from '@/components/LoginButton';

function Navigation() {
  const { user, isAuthenticated, logout } = useAuth();
  
  return (
    <nav className="bg-slate-800 p-4 text-white">
      <div className="flex justify-between items-center">
        <h1 className="font-bold">Yuzu Meet</h1>
        <div className="space-x-4">
          <Link to="/" className="hover:text-slate-300">Home</Link>
          <Link to="/glasses" className="hover:text-slate-300">Glasses</Link>
          {isAuthenticated ? (
            <span className="space-x-4">
              <span>{user?.name}</span>
              <button onClick={logout} className="hover:text-slate-300">
                Logout
              </button>
            </span>
          ) : (
            <LoginButton />
          )}
        </div>
      </div>
    </nav>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
    </div>
  );
}

function Home() {
  const { isAuthenticated } = useAuth();
  
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Welcome to Yuzu Meet</h1>
      {!isAuthenticated && <LoginButton />}
    </div>
  );
}

function SuccessPage() {
  const navigate = useNavigate();
  const { checkAuth } = useAuth();

  useEffect(() => {
    const completeAuth = async () => {
      try {
        await checkAuth();
        navigate('/glasses', { replace: true });
      } catch (error) {
        console.error('Auth completion failed:', error);
        navigate('/', { replace: true });
      }
    };
    completeAuth();
  }, [navigate, checkAuth]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      <p className="mt-4">Completing login...</p>
    </div>
  );
}

function AuthFailure() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/', { replace: true });
    }, 3000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <p className="text-red-500">Authentication failed. Redirecting to home...</p>
    </div>
  );
}

function GlassesPage() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Glasses Interface</h1>
      <p>You are logged in and viewing the glasses interface.</p>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [loading, isAuthenticated, navigate]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return isAuthenticated ? children : null;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-gray-100">
          <Navigation />
          <main className="container mx-auto p-4">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/auth/success" element={<SuccessPage />} />
              <Route path="/auth/failure" element={<AuthFailure />} />
              <Route 
                path="/glasses" 
                element={
                  <ProtectedRoute>
                    <GlassesPage />
                  </ProtectedRoute>
                } 
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;