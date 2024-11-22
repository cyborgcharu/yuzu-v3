// src/App.jsx
import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { 
 BrowserRouter, 
 Routes, 
 Route, 
 Navigate, 
 Link,
 useSearchParams,
 useNavigate 
} from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Navigation component 
function Navigation() {
 const { user, isAuthenticated, login, logout } = useAuth();
 
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
           <button onClick={login} className="hover:text-slate-300">
             Login with Google
           </button>
         )}
       </div>
     </div>
   </nav>
 );
}

// Loading Spinner
function LoadingSpinner() {
 return (
   <div className="flex items-center justify-center h-screen">
     <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
   </div>
 );
}

// Auth Callback Handler
function AuthCallback() {
  const { setUser, setIsAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const sessionId = searchParams.get('sessionId');
    if (sessionId) {
      console.log('Auth successful, setting user and authentication state');
      // Fetch the user and token information from the session
      fetch(`/auth/user?sessionId=${sessionId}`, { credentials: 'include' })
        .then((response) => response.json())
        .then((data) => {
          setUser(data.user);
          setIsAuthenticated(true);
          navigate('/glasses', { replace: true });
        })
        .catch((error) => {
          console.error('Error fetching user data:', error);
          navigate('/', { replace: true });
        });
    } else {
      console.log('Auth failed, redirecting to home');
      navigate('/', { replace: true });
    }
  }, [searchParams, navigate, setUser, setIsAuthenticated]);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      <p className="mt-4">Processing authentication...</p>
    </div>
  );
}

// Protected Route Component
function ProtectedRoute({ children }) {
 const { isAuthenticated, loading } = useAuth();
 const navigate = useNavigate();

 useEffect(() => {
   if (!loading && !isAuthenticated) {
     console.log('Not authenticated, redirecting to home');
     navigate('/', { replace: true });
   }
 }, [loading, isAuthenticated, navigate]);

 if (loading) {
   return <LoadingSpinner />;
 }

 return isAuthenticated ? children : null;
}

// Home Page
function Home() {
 const { isAuthenticated, login } = useAuth();
 
 return (
   <div className="p-4">
     <h1 className="text-2xl font-bold mb-4">Welcome to Yuzu Meet</h1>
     {!isAuthenticated && (
       <button 
         onClick={login}
         className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
       >
         Login with Google
       </button>
     )}
   </div>
 );
}

// Glasses Page
function GlassesPage() {
 return (
   <div className="p-4">
     <h1 className="text-2xl font-bold mb-4">Glasses Interface</h1>
     <p>You are logged in and viewing the glasses interface.</p>
   </div>
 );
}

// Main App Component
function App() {
 return (
   <BrowserRouter>
     <AuthProvider>
       <div className="min-h-screen bg-gray-100">
         <Navigation />
         <main className="container mx-auto p-4">
           <Routes>
             <Route path="/" element={<Home />} />
             <Route path="/auth/google" element={<AuthCallback />} />
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

const root = createRoot(document.getElementById('root'));
root.render(<App />);

export default App;