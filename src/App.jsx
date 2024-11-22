// src/App.jsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { MeetProvider } from './components/MeetProvider';
import { GlassesMeetDisplay } from './interfaces/glasses/MeetDisplay';
import { WristMeetDisplay } from './interfaces/wrist/MeetDisplay';
import { RingMeetControls } from './interfaces/ring/MeetControls';
import './index.css';

// Navigation component
function Navigation() {
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
        </div>
      </div>
    </nav>
  );
}

// Layout component to add padding for the navbar
function Layout({ children }) {
  return (
    <div className="pt-16"> {/* Add padding to account for fixed navbar */}
      <Navigation />
      {children}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <MeetProvider>
        <Layout>
          <Routes>
            {/* Redirect root to glasses interface */}
            <Route path="/" element={<Navigate to="/glasses" replace />} />
            
            {/* Interface routes */}
            <Route path="/glasses" element={<GlassesMeetDisplay />} />
            <Route path="/wrist" element={<WristMeetDisplay />} />
            <Route path="/ring" element={<RingMeetControls />} />
          </Routes>
        </Layout>
      </MeetProvider>
    </BrowserRouter>
  );
}

// Mount the application
const root = createRoot(document.getElementById('root'));
root.render(<App />);

export default App;