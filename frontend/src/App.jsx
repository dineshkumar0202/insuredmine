import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import IngestPage from './pages/IngestPage';
import SearchPage from './pages/SearchPage';
import AggregatePage from './pages/AggregatePage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50 text-slate-900 relative overflow-hidden font-sans antialiased selection:bg-orange-500 selection:text-white">
        {/* Soft warm background accents */}
        <div className="absolute w-[600px] h-[600px] rounded-full bg-orange-200/35 blur-[120px] top-[-250px] left-[-250px] pointer-events-none z-0 animate-blob-1" />
        <div className="absolute w-[600px] h-[600px] rounded-full bg-amber-200/25 blur-[120px] top-[40%] right-[-200px] pointer-events-none z-0 animate-blob-2" />
        <div className="absolute w-[600px] h-[600px] rounded-full bg-orange-100/30 blur-[120px] bottom-[-250px] left-[20%] pointer-events-none z-0 animate-blob-1" />
        
        <div className="relative z-10 flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<IngestPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/aggregate" element={<AggregatePage />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
