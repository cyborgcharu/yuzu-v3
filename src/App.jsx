// src/App.jsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { MeetProvider } from './components/MeetProvider';
import { useMeet } from './hooks/useMeet';  // Add this import
import { GlassesMeetDisplay } from './interfaces/glasses/MeetDisplay';
import { WristMeetDisplay } from './interfaces/wrist/MeetDisplay';
import { RingMeetControls } from './interfaces/ring/MeetControls';
import './index.css';

// Auth component to handle Google OAuth redirect
function AuthHandler() {
  React.useEffect(() => {
    window.location.href = '/api/auth/google';
  }, []);

  return <div>Redirecting to Google login...</div>;
}

// Navigation component
function Navigation() {
  const { googleAuthStatus } = useMeet();  // Use the hook

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
          {googleAuthStatus !== 'authorized' && (
            <Link to="/auth/google" className="text-white hover:text-slate-300">
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

// Layout component
function Layout({ children }) {
  return (
    <div className="pt-16">
      <Navigation />
      {children}
    </div>
  );
}

// Move AuthRequired to be its own component
function AuthRequired({ children }) {
  const { googleAuthStatus, isLoading } = useMeet();  // Use the hook here

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-200"></div>
          <p className="mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  if (googleAuthStatus !== 'authorized') {
    return <Navigate to="/auth/google" replace />;
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <MeetProvider>
        <Routes>
          {/* Auth routes */}
          <Route path="/auth/google" element={<AuthHandler />} />
          <Route path="/auth/callback" element={<Navigate to="/" replace />} />

          {/* Protected routes */}
          <Route path="/" element={
            <Layout>
              <AuthRequired>
                <Navigate to="/glasses" replace />
              </AuthRequired>
            </Layout>
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
        </Routes>
      </MeetProvider>
    </BrowserRouter>
  );
}

const root = createRoot(document.getElementById('root'));
root.render(<App />);

export default App;