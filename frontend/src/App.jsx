import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import SectorDashboard from './pages/SectorDashboard';

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-vb-navy text-vb-white">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/sector/:sectorId" element={<SectorDashboard />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
