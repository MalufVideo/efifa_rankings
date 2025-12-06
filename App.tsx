import React from 'react';
import { HashRouter, Routes, Route, Link } from 'react-router-dom';
import { AdminPage } from './components/AdminPage';
import { BroadcastPage } from './components/BroadcastPage';

const Home = () => (
  <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-8">
    <div className="max-w-2xl w-full text-center space-y-8">
      <h1 className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">
        RANKINGS APP
      </h1>
      <p className="text-slate-400 text-lg">Select an interface to proceed.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link to="/admin" className="group p-8 bg-slate-800 rounded-2xl border border-slate-700 hover:border-emerald-500 transition-all hover:bg-slate-700">
          <div className="text-3xl mb-4">🔐</div>
          <h2 className="text-2xl font-bold mb-2 group-hover:text-emerald-400 transition-colors">Admin Panel</h2>
          <p className="text-slate-400">Control the rankings, drag & drop countries, and trigger animations.</p>
        </Link>
        
        <Link to="/broadcast" className="group p-8 bg-slate-800 rounded-2xl border border-slate-700 hover:border-indigo-500 transition-all hover:bg-slate-700">
          <div className="text-3xl mb-4">📺</div>
          <h2 className="text-2xl font-bold mb-2 group-hover:text-indigo-400 transition-colors">Broadcast View</h2>
          <p className="text-slate-400">Transparent overlay for OBS/Streaming. 1204x1376 resolution.</p>
        </Link>
      </div>
    </div>
  </div>
);

const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/broadcast" element={<BroadcastPage />} />
      </Routes>
    </HashRouter>
  );
};

export default App;
