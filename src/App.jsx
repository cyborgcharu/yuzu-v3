// src/App.jsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate, Link, useSearchParams, useNavigate } from 'react-router-dom';
import { MeetProvider } from './components/MeetProvider';
import { useMeet } from './hooks/useMeet';
import { GlassesMeetDisplay } from './interfaces/glasses/MeetDisplay';
import { WristMeetDisplay } from './interfaces/wrist/MeetDisplay';
import { RingMeetControls } from './interfaces/ring/MeetControls';
import './index.css';

// Loading Spinner Component
function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-200"></div>
        <p className="mt-4">Loading...</p>
      </div>
    </div>
  );
}

// Auth Handler Component
function AuthHandler() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { updateAuthStatus } = useMeet();
  
  React.useEffect(() => {
    const handleAuth = async () => {
      console.log('Auth Handler - Current params:', Object.fromEntries(searchParams.entries()));
      
      // Case 1: Success callback
      if (searchParams.get('auth') === 'success') {
        console.log('Auth success detected, redirecting to app');
        updateAuthStatus('authorized');
        navigate('/glasses', { replace: true });
        return;
      }
      
      // Case 2: Have auth code
      if (searchParams.get('code')) {
        console.log('Auth code detected, waiting for callback');
        return;
      }
      
      // Case 3: Start auth
      console.log('Starting new auth flow');
      window.location.href = 'http://localhost:3000/auth/google';
    };

    handleAuth();
  }, [searchParams, navigate, updateAuthStatus]);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-200"></div>
        <p className="mt-4">Processing authentication...</p>
        <p className="text-sm text-gray-500 mt-2">
          {searchParams.get('auth') === 'success' ? 'Redirecting to app...' : 'Connecting to Google...'}
        </p>
      </div>
    </div>
  );
}

// Auth Required Component
function AuthRequired({ children }) {
  const { googleAuthStatus, isLoading } = useMeet();
  const navigate = useNavigate();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (googleAuthStatus !== 'authorized') {
    navigate('/auth/google', { replace: true });
    return null;
  }

  return children;
}

// Navigation Component
function Navigation() {
  const { googleAuthStatus, logout, user } = useMeet();
  
  return (
    <nav className="fixed top-0 left-0 right-0 bg-slate-800 p-4 z-50">
      <div className="container mx-auto flex items-center justify-between">
        <span className="text-white font-bold">Yuzu Meet</span>
        <div className="space-x-4">
          <Link to="/glasses" className="text-white hover:text-slate-300">
            Glasses Interface
          </Link>
          <Link to="/wrist" className="text-white hover:text-slate-300">
            Wrist Interface
          </Link>
          <Link to="/ring" className="text-white hover:text-slate-300">
            Ring Interface
          </Link>
          {googleAuthStatus === 'authorized' ? (
            <div className="flex items-center space-x-4">
              {user?.name && <span className="text-white">{user.name}</span>}
              <button 
                onClick={logout}
                className="text-white hover:text-slate-300"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <Link to="/auth/google" className="text-white hover:text-slate-300">
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

// Layout Component
function Layout({ children }) {
  return (
    <div className="min-h-screen bg-slate-100">
      <Navigation />
      <div className="pt-16 container mx-auto px-4">
        {children}
      </div>
    </div>
  );
}

// Main App Component
function App() {
  return (
    <BrowserRouter>
      <MeetProvider>
        <Routes>
          {/* Auth Routes */}
          <Route path="/auth/google" element={<AuthHandler />} />
          
          {/* Protected Routes */}
          <Route path="/" element={
            <Navigate to="/glasses" replace />
          } />
          
          <Route path="/glasses" element={
            <Layout>
              <AuthRequired>
                <GlassesMeetDisplay />
              </AuthRequired>
            </Layout>
          } />
          
          <Route path="/wrist" element={
            <Layout>
              <AuthRequired>
                <WristMeetDisplay />
              </AuthRequired>
            </Layout>
          } />
          
          <Route path="/ring" element={
            <Layout>
              <AuthRequired>
                <RingMeetControls />
              </AuthRequired>
            </Layout>
          } />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/glasses" replace />} />
        </Routes>
      </MeetProvider>
    </BrowserRouter>
  );
}

// Root Render
const root = createRoot(document.getElementById('root'));
root.render(<App />);

export default App;