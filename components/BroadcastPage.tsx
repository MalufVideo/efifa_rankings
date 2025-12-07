import React, { useEffect, useState } from 'react';
import { broadcastService } from '../services/broadcastService';
import { GameMode, Country, LayoutSettings } from '../types';
import { INITIAL_DATA, CELL_HEIGHT, CELL_WIDTH, CANVAS_HEIGHT, CANVAS_WIDTH, DEFAULT_LAYOUT_SETTINGS } from '../constants';
import { AnimatePresence, motion } from 'framer-motion';
import { CountryCard } from './CountryCard';

export const BroadcastPage: React.FC = () => {
  const [currentMode, setCurrentMode] = useState<GameMode>(GameMode.E_CONSOLE);
  const [countries, setCountries] = useState<Country[]>(INITIAL_DATA[GameMode.E_CONSOLE]);
  const [layoutSettings, setLayoutSettings] = useState<LayoutSettings>(DEFAULT_LAYOUT_SETTINGS);

  useEffect(() => {
    // New subscription method that handles polling and storage events
    const unsubscribe = broadcastService.subscribe((msg) => {
      if (msg.type === 'UPDATE_RANKINGS') {
        setCurrentMode(msg.gameMode);
        setCountries(msg.countries);
        if (msg.layoutSettings) {
          setLayoutSettings(msg.layoutSettings);
        }
      }
    });
    return unsubscribe;
  }, []);

  const itemsToSkip = currentMode === GameMode.ROCKET_LEAGUE ? 0 : 2;

  // The styling requires exact pixel dimensions as per request
  return (
    <div 
      className="bg-transparent overflow-hidden relative"
      style={{ 
        width: CANVAS_WIDTH, 
        height: CANVAS_HEIGHT 
      }}
    >
      {/* Grid Structure */}
      <div className="flex flex-col w-full h-full">
        
        {/* Spacer for lists with fewer items (skip first 2 cells) */}
        <div 
          className="transition-all duration-500 ease-in-out"
          style={{ height: itemsToSkip * CELL_HEIGHT }} 
        />

        {/* List Container */}
        <div className="flex flex-col">
          <AnimatePresence mode="popLayout">
            {countries.map((country, index) => (
              <motion.div
                layout
                key={country.id}
                initial={{ opacity: 0, scale: 0.9, x: -100 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                  mass: 1,
                  layout: { duration: 0.8, type: "spring", bounce: 0.15 } // The "Sleek" animation
                }}
                style={{ height: CELL_HEIGHT }}
                className="w-full flex items-center justify-center"
              >
                <CountryCard 
                  country={country} 
                  rankDisplay={index + 1} 
                  gameMode={currentMode}
                  width={CELL_WIDTH}
                  height={CELL_HEIGHT}
                  layoutSettings={layoutSettings}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
