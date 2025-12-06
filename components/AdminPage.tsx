import React, { useState } from 'react';
import { GameMode, Country, ADMIN_PASSWORD } from '../types';
import { INITIAL_DATA, CELL_HEIGHT, CELL_WIDTH } from '../constants';
import { Reorder, AnimatePresence, motion } from 'framer-motion';
import { CountryCard } from './CountryCard';
import { broadcastService } from '../services/broadcastService';
import { Lock, Unlock, Send, Monitor } from 'lucide-react';

export const AdminPage: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [selectedMode, setSelectedMode] = useState<GameMode>(GameMode.E_CONSOLE);
  
  // DRAFT STATE: This is what the admin manipulates in the Left Column
  const [draftRankings, setDraftRankings] = useState<Record<GameMode, Country[]>>(INITIAL_DATA);
  
  // LIVE STATE: This is what is shown in the Right Column and Broadcast Page
  const [liveRankings, setLiveRankings] = useState<Record<GameMode, Country[]>>(INITIAL_DATA);
  
  const draftList = draftRankings[selectedMode];
  const liveList = liveRankings[selectedMode];

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
    } else {
      alert('Incorrect Password');
    }
  };

  const handleReorder = (newOrder: Country[]) => {
    setDraftRankings(prev => ({
      ...prev,
      [selectedMode]: newOrder
    }));
  };

  const handleAnima = () => {
    // 1. Update the local Live state (triggers Right Column animation)
    setLiveRankings(prev => ({
      ...prev,
      [selectedMode]: [...draftList] 
    }));

    // 2. Persist State (Updates Broadcast Page globally via polling/storage)
    broadcastService.saveState(selectedMode, draftList);
  };

  const itemsToSkip = selectedMode === GameMode.ROCKET_LEAGUE ? 0 : 2;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="bg-slate-800 p-8 rounded-2xl shadow-2xl border border-slate-700 w-full max-w-md">
          <div className="flex justify-center mb-6">
            <div className="bg-emerald-500 p-4 rounded-full">
              <Lock className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white text-center mb-6">Admin Access</h2>
          <input
            type="password"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            placeholder="Enter Password"
            className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 mb-4 transition-all"
          />
          <button 
            type="submit"
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Unlock className="w-5 h-5" /> Login
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 p-4 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">
            RANKINGS ADMIN
          </h1>
          <select 
            value={selectedMode}
            onChange={(e) => setSelectedMode(e.target.value as GameMode)}
            className="bg-slate-800 text-white border border-slate-700 rounded-md px-3 py-1.5 focus:ring-2 focus:ring-emerald-500 outline-none"
          >
            {Object.values(GameMode).map(mode => (
              <option key={mode} value={mode}>{mode}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-4 text-sm text-slate-400">
          <span className="flex items-center gap-2">
            <Monitor className="w-4 h-4" /> Broadcast Ready
          </span>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* LEFT COLUMN: Editor */}
        <div className="w-1/3 min-w-[350px] border-r border-slate-800 p-6 flex flex-col bg-slate-900/50 overflow-y-auto custom-scrollbar">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-300">Draft Order</h3>
            <span className="text-xs bg-slate-800 px-2 py-1 rounded text-slate-400">Drag to reorder</span>
          </div>
          
          <Reorder.Group 
            axis="y" 
            values={draftList} 
            onReorder={handleReorder}
            className="space-y-3"
          >
            {draftList.map((country, index) => (
              <Reorder.Item 
                key={country.id} 
                value={country}
                className="relative z-10"
              >
                <CountryCard 
                  country={country} 
                  rankDisplay={index + 1} 
                  gameMode={selectedMode}
                  isDraggable
                />
              </Reorder.Item>
            ))}
          </Reorder.Group>
        </div>

        {/* MIDDLE: Actions */}
        <div className="w-32 bg-slate-900 border-r border-slate-800 flex flex-col items-center justify-center p-4 gap-8 z-10 shadow-xl relative">
          <div className="text-center space-y-2 relative z-20">
            <div className="w-1 h-24 bg-slate-800 mx-auto rounded-full mb-4"></div>
            <button
              onClick={handleAnima}
              className="group relative flex flex-col items-center justify-center w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full shadow-[0_0_20px_rgba(99,102,241,0.5)] hover:shadow-[0_0_40px_rgba(99,102,241,0.7)] transition-all transform hover:scale-105 active:scale-95 border-4 border-slate-800"
            >
              <Send className="w-8 h-8 text-white mb-1 group-hover:-translate-y-1 transition-transform" />
              <span className="text-xs font-black tracking-widest text-white">ANIMA</span>
            </button>
            <p className="text-xs text-slate-500 mt-4 text-center">Push to<br/>Live</p>
            <div className="w-1 h-24 bg-slate-800 mx-auto rounded-full mt-4"></div>
          </div>
        </div>

        {/* RIGHT COLUMN: Live Preview */}
        <div className="flex-1 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] bg-slate-950 relative overflow-hidden flex items-start justify-center p-8">
          <div className="absolute top-4 right-4 bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-xs font-bold border border-red-500/30 animate-pulse z-50">
            LIVE OUTPUT
          </div>
          
          {/* Scaled down preview container to fit resolution without scrolling */}
          <div className="transform scale-[0.55] origin-top h-full w-full flex justify-center pointer-events-none">
             {/* Simulating the broadcast grid structure */}
            <div 
              style={{ width: CELL_WIDTH }}
              className="relative"
            >
              {/* Skip empty cells */}
              <div 
                className="transition-all duration-500 ease-in-out"
                style={{ height: itemsToSkip * CELL_HEIGHT }} 
              />

              {/* Render Items from LIVE list */}
              <div className="flex flex-col">
                <AnimatePresence mode='popLayout'>
                  {liveList.map((country, index) => (
                    <motion.div
                      layout
                      key={country.id}
                      initial={{ opacity: 0, scale: 0.9, x: -50 }}
                      animate={{ opacity: 1, scale: 1, x: 0 }}
                      transition={{ 
                        type: "spring", 
                        stiffness: 150, 
                        damping: 20,
                        mass: 0.8,
                        layout: { duration: 0.8 }
                      }}
                      style={{ height: CELL_HEIGHT }}
                      className="flex items-center justify-center w-full"
                    >
                      <CountryCard 
                        country={country} 
                        rankDisplay={index + 1} 
                        gameMode={selectedMode}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
