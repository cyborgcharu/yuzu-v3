// src/App.jsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MeetProvider } from './components/MeetProvider';
import { GlassesMeetDisplay } from './interfaces/glasses/MeetDisplay';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <MeetProvider>
        <Routes>
          {/* Redirect root to glasses interface */}
          <Route path="/" element={<Navigate to="/glasses" replace />} />
          
          {/* Glasses interface */}
          <Route path="/glasses" element={<GlassesMeetDisplay />} />
          
          {/* Add other interfaces here */}
          {/* <Route path="/wrist" element={<WristDisplay />} /> */}
          {/* <Route path="/ring" element={<RingControls />} /> */}
        </Routes>
      </MeetProvider>
    </BrowserRouter>
  );
}

// Mount the application
const root = createRoot(document.getElementById('root'));
root.render(<App />);

export default App;