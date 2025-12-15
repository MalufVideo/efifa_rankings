import React, { useState, useEffect, useCallback } from 'react';
import { GameMode, Country, ADMIN_PASSWORD, LayoutSettings, AnimationSettings, RankPositionOffsets } from '../types';
import { INITIAL_DATA, CELL_HEIGHT, CELL_WIDTH, DEFAULT_LAYOUT_SETTINGS, DEFAULT_ANIMATION_SETTINGS } from '../constants';
import { Reorder, AnimatePresence, motion } from 'framer-motion';
import { CountryCard } from './CountryCard';
import { broadcastService } from '../services/broadcastService';
import { adminSettingsService, AdminSettings } from '../services/adminSettingsService';
import { Lock, Unlock, Send, Monitor, Settings, RotateCcw, Timer } from 'lucide-react';
import { RankPositionModal } from './RankPositionModal';

export const AdminPage: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [selectedMode, setSelectedMode] = useState<GameMode>(GameMode.E_CONSOLE);
  const [isLoading, setIsLoading] = useState(true);
  
  // DRAFT STATE: This is what the admin manipulates in the Left Column
  const [draftRankings, setDraftRankings] = useState<Record<GameMode, Country[]>>(INITIAL_DATA);
  
  // LIVE STATE: This is what is shown in the Right Column and Broadcast Page
  const [liveRankings, setLiveRankings] = useState<Record<GameMode, Country[]>>(INITIAL_DATA);
  
  // LAYOUT SETTINGS: Controls for card appearance
  const [layoutSettings, setLayoutSettings] = useState<LayoutSettings>(DEFAULT_LAYOUT_SETTINGS);
  const [showLayoutControls, setShowLayoutControls] = useState(false);

  // ANIMATION SETTINGS: Controls for animation timing
  const [animationSettings, setAnimationSettings] = useState<AnimationSettings>(DEFAULT_ANIMATION_SETTINGS);
  const [showAnimationControls, setShowAnimationControls] = useState(false);

  // RANK POSITION OFFSETS: Fine-tune Y position per rank number
  const [rankPositionOffsets, setRankPositionOffsets] = useState<RankPositionOffsets>({});
  const [fineTuneModal, setFineTuneModal] = useState<{ isOpen: boolean; rankNumber: number }>({ isOpen: false, rankNumber: 0 });

  // Load saved settings on mount
  useEffect(() => {
    const loadSavedSettings = async () => {
      const saved = await adminSettingsService.loadSettings();
      if (saved) {
        // Merge saved rankings with initial data to handle new game modes
        const mergedDraft = { ...INITIAL_DATA };
        const mergedLive = { ...INITIAL_DATA };
        
        Object.keys(saved.draftRankings || {}).forEach((mode) => {
          if (mode in mergedDraft) {
            mergedDraft[mode as GameMode] = saved.draftRankings[mode as GameMode];
          }
        });
        
        Object.keys(saved.liveRankings || {}).forEach((mode) => {
          if (mode in mergedLive) {
            mergedLive[mode as GameMode] = saved.liveRankings[mode as GameMode];
          }
        });

        setDraftRankings(mergedDraft);
        setLiveRankings(mergedLive);
        if (saved.layoutSettings) {
          setLayoutSettings(saved.layoutSettings);
        }
        if (saved.selectedMode && Object.values(GameMode).includes(saved.selectedMode)) {
          setSelectedMode(saved.selectedMode);
        }
        if (saved.rankPositionOffsets) {
          setRankPositionOffsets(saved.rankPositionOffsets);
        }
        if (saved.animationSettings) {
          setAnimationSettings(saved.animationSettings);
        }
      }
      setIsLoading(false);
    };
    loadSavedSettings();
  }, []);

  // Auto-save settings when they change (debounced)
  const saveCurrentSettings = useCallback(() => {
    if (isLoading) return; // Don't save during initial load
    const settings: AdminSettings = {
      draftRankings,
      liveRankings,
      layoutSettings,
      animationSettings,
      selectedMode,
      rankPositionOffsets,
      timestamp: Date.now()
    };
    adminSettingsService.saveSettings(settings);
  }, [draftRankings, liveRankings, layoutSettings, animationSettings, selectedMode, rankPositionOffsets, isLoading]);

  useEffect(() => {
    saveCurrentSettings();
  }, [saveCurrentSettings]);
  
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
    const newLiveRankings = {
      ...liveRankings,
      [selectedMode]: [...draftList] 
    };
    setLiveRankings(newLiveRankings);

    // 2. Persist State (Updates Broadcast Page globally via polling/storage)
    broadcastService.saveState(selectedMode, draftList, layoutSettings, animationSettings, rankPositionOffsets);

    // 3. Save admin settings immediately
    adminSettingsService.saveSettingsImmediate({
      draftRankings,
      liveRankings: newLiveRankings,
      layoutSettings,
      animationSettings,
      selectedMode,
      rankPositionOffsets,
      timestamp: Date.now()
    });
  };

  const handleLayoutChange = (key: keyof LayoutSettings, value: number) => {
    setLayoutSettings(prev => ({ ...prev, [key]: value }));
  };

  const resetLayoutSettings = () => {
    setLayoutSettings(DEFAULT_LAYOUT_SETTINGS);
  };

  const handleAnimationChange = (key: keyof AnimationSettings, value: number) => {
    setAnimationSettings(prev => ({ ...prev, [key]: value }));
  };

  const resetAnimationSettings = () => {
    setAnimationSettings(DEFAULT_ANIMATION_SETTINGS);
  };

  // Handle rank position fine-tuning
  const handleRankClick = (rankNumber: number) => {
    setFineTuneModal({ isOpen: true, rankNumber });
  };

  const handleOffsetChange = (newOffset: number) => {
    setRankPositionOffsets(prev => ({
      ...prev,
      [fineTuneModal.rankNumber]: newOffset
    }));
  };

  const closeFineTuneModal = () => {
    setFineTuneModal({ isOpen: false, rankNumber: 0 });
  };

  const itemsToSkip = selectedMode === GameMode.ROCKET_LEAGUE ? 0 : 0;

  // Helper to check if current mode is a group mode (has header at index 0)
  const isGroupMode = [
    GameMode.E_CONSOLE_GROUP_A,
    GameMode.E_CONSOLE_GROUP_B,
    GameMode.E_MOBILE_GROUP_A,
    GameMode.E_MOBILE_GROUP_B,
    GameMode.ROCKET_LEAGUE_GROUP_A,
    GameMode.ROCKET_LEAGUE_GROUP_B
  ].includes(selectedMode);

  // For group modes, rank 1 starts at index 1 (after header)
  const getRankDisplay = (index: number) => isGroupMode ? index : index + 1;

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
          <button
            onClick={() => setShowLayoutControls(!showLayoutControls)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors ${
              showLayoutControls ? 'bg-emerald-500/20 text-emerald-400' : 'hover:bg-slate-800'
            }`}
          >
            <Settings className="w-4 h-4" /> Layout
          </button>
          <button
            onClick={() => setShowAnimationControls(!showAnimationControls)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors ${
              showAnimationControls ? 'bg-purple-500/20 text-purple-400' : 'hover:bg-slate-800'
            }`}
          >
            <Timer className="w-4 h-4" /> Animação
          </button>
          <span className="flex items-center gap-2">
            <Monitor className="w-4 h-4" /> Broadcast Ready
          </span>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* LEFT COLUMN: Editor */}
        <div className="w-1/3 min-w-[350px] border-r border-slate-800 p-6 flex flex-col bg-slate-900/50 overflow-y-auto custom-scrollbar">
          
          {/* Layout Controls Panel */}
          {showLayoutControls && (
            <div className="mb-6 p-4 bg-slate-800/50 rounded-xl border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                  <Settings className="w-4 h-4" /> Layout Controls
                </h3>
                <button
                  onClick={resetLayoutSettings}
                  className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-700 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" /> Reset
                </button>
              </div>
              
              <div className="space-y-4">
                {/* Font Size */}
                <div>
                  <label className="text-xs text-slate-400 mb-1 flex justify-between">
                    <span>Font Size</span>
                    <span className="text-emerald-400">{layoutSettings.fontSize}px</span>
                  </label>
                  <input
                    type="range"
                    min="12"
                    max="48"
                    value={layoutSettings.fontSize}
                    onChange={(e) => handleLayoutChange('fontSize', Number(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                </div>

                {/* Text Position X */}
                <div>
                  <label className="text-xs text-slate-400 mb-1 flex justify-between">
                    <span>Text Position X</span>
                    <span className="text-emerald-400">{layoutSettings.textPositionX}px</span>
                  </label>
                  <input
                    type="range"
                    min="-500"
                    max="500"
                    value={layoutSettings.textPositionX}
                    onChange={(e) => handleLayoutChange('textPositionX', Number(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                </div>

                {/* Rank Position X */}
                <div>
                  <label className="text-xs text-slate-400 mb-1 flex justify-between">
                    <span>Rank Position X</span>
                    <span className="text-emerald-400">{layoutSettings.rankPositionX}px</span>
                  </label>
                  <input
                    type="range"
                    min="-100"
                    max="400"
                    value={layoutSettings.rankPositionX}
                    onChange={(e) => handleLayoutChange('rankPositionX', Number(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                </div>

                {/* Rank Size */}
                <div>
                  <label className="text-xs text-slate-400 mb-1 flex justify-between">
                    <span>Rank Size</span>
                    <span className="text-emerald-400">{layoutSettings.rankSize.toFixed(1)}x</span>
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="2.5"
                    step="0.1"
                    value={layoutSettings.rankSize}
                    onChange={(e) => handleLayoutChange('rankSize', Number(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                </div>

                {/* Flag Size */}
                <div>
                  <label className="text-xs text-slate-400 mb-1 flex justify-between">
                    <span>Flag Size</span>
                    <span className="text-emerald-400">{layoutSettings.flagSize.toFixed(1)}x</span>
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="2.5"
                    step="0.1"
                    value={layoutSettings.flagSize}
                    onChange={(e) => handleLayoutChange('flagSize', Number(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                </div>

                {/* Flag Position X */}
                <div>
                  <label className="text-xs text-slate-400 mb-1 flex justify-between">
                    <span>Flag Position X</span>
                    <span className="text-emerald-400">{layoutSettings.flagPositionX}px</span>
                  </label>
                  <input
                    type="range"
                    min="-100"
                    max="400"
                    value={layoutSettings.flagPositionX}
                    onChange={(e) => handleLayoutChange('flagPositionX', Number(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                </div>

                {/* Header Font Size */}
                <div>
                  <label className="text-xs text-slate-400 mb-1 flex justify-between">
                    <span>Header Text Size</span>
                    <span className="text-emerald-400">{layoutSettings.headerFontSize}px</span>
                  </label>
                  <input
                    type="range"
                    min="16"
                    max="72"
                    value={layoutSettings.headerFontSize}
                    onChange={(e) => handleLayoutChange('headerFontSize', Number(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                </div>

                {/* Header Position X */}
                <div>
                  <label className="text-xs text-slate-400 mb-1 flex justify-between">
                    <span>Header Position X</span>
                    <span className="text-emerald-400">{layoutSettings.headerPositionX}px</span>
                  </label>
                  <input
                    type="range"
                    min="-400"
                    max="400"
                    value={layoutSettings.headerPositionX}
                    onChange={(e) => handleLayoutChange('headerPositionX', Number(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Animation Controls Panel */}
          {showAnimationControls && (
            <div className="mb-6 p-4 bg-slate-800/50 rounded-xl border border-purple-700/50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                  <Timer className="w-4 h-4 text-purple-400" /> Velocidade da Animação
                </h3>
                <button
                  onClick={resetAnimationSettings}
                  className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-700 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" /> Resetar
                </button>
              </div>
              
              <div className="space-y-4">
                {/* Stiffness */}
                <div>
                  <label className="text-xs text-slate-400 mb-1 flex justify-between">
                    <span>Rigidez (velocidade do encaixe)</span>
                    <span className="text-purple-400">{animationSettings.stiffness}</span>
                  </label>
                  <input
                    type="range"
                    min="50"
                    max="500"
                    step="10"
                    value={animationSettings.stiffness}
                    onChange={(e) => handleAnimationChange('stiffness', Number(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                    <span>Mais lento</span>
                    <span>Mais rápido</span>
                  </div>
                </div>

                {/* Damping */}
                <div>
                  <label className="text-xs text-slate-400 mb-1 flex justify-between">
                    <span>Amortecimento (reduz quique)</span>
                    <span className="text-purple-400">{animationSettings.damping}</span>
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="100"
                    step="1"
                    value={animationSettings.damping}
                    onChange={(e) => handleAnimationChange('damping', Number(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                    <span>Mais quique</span>
                    <span>Menos quique</span>
                  </div>
                </div>

                {/* Mass */}
                <div>
                  <label className="text-xs text-slate-400 mb-1 flex justify-between">
                    <span>Massa (sensação de peso)</span>
                    <span className="text-purple-400">{animationSettings.mass.toFixed(1)}</span>
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="5"
                    step="0.1"
                    value={animationSettings.mass}
                    onChange={(e) => handleAnimationChange('mass', Number(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                    <span>Mais leve</span>
                    <span>Mais pesado</span>
                  </div>
                </div>

                {/* Layout Duration */}
                <div>
                  <label className="text-xs text-slate-400 mb-1 flex justify-between">
                    <span>Duração da Mudança de Posição</span>
                    <span className="text-purple-400">{animationSettings.layoutDuration.toFixed(1)}s</span>
                  </label>
                  <input
                    type="range"
                    min="0.2"
                    max="3"
                    step="0.1"
                    value={animationSettings.layoutDuration}
                    onChange={(e) => handleAnimationChange('layoutDuration', Number(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                    <span>Rápido</span>
                    <span>Lento</span>
                  </div>
                </div>
              </div>
            </div>
          )}

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
                  rankDisplay={getRankDisplay(index)} 
                  gameMode={selectedMode}
                  isDraggable
                  layoutSettings={layoutSettings}
                  positionYOffset={rankPositionOffsets[getRankDisplay(index)] || 0}
                  onRankClick={handleRankClick}
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
                        stiffness: animationSettings.stiffness,
                        damping: animationSettings.damping,
                        mass: animationSettings.mass,
                        layout: { duration: animationSettings.layoutDuration }
                      }}
                      style={{ height: CELL_HEIGHT }}
                      className="flex items-center justify-center w-full"
                    >
                      <CountryCard 
                        country={country} 
                        rankDisplay={getRankDisplay(index)} 
                        gameMode={selectedMode}
                        layoutSettings={layoutSettings}
                        positionYOffset={rankPositionOffsets[getRankDisplay(index)] || 0}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Fine-Tune Position Modal */}
      {fineTuneModal.isOpen && (
        <RankPositionModal
          rankNumber={fineTuneModal.rankNumber}
          currentOffset={rankPositionOffsets[fineTuneModal.rankNumber] || 0}
          onOffsetChange={handleOffsetChange}
          onClose={closeFineTuneModal}
        />
      )}
    </div>
  );
};
