import React, { useEffect, useState } from 'react';
import { broadcastService } from '../services/broadcastService';
import { GameMode, Country, LayoutSettings, AnimationSettings, RankPositionOffsets } from '../types';
import { INITIAL_DATA, CELL_HEIGHT, CELL_WIDTH, CANVAS_HEIGHT, CANVAS_WIDTH, DEFAULT_LAYOUT_SETTINGS, DEFAULT_ANIMATION_SETTINGS } from '../constants';
import { AnimatePresence, motion } from 'framer-motion';
import { CountryCard } from './CountryCard';

export const BroadcastPage: React.FC = () => {
  const [currentMode, setCurrentMode] = useState<GameMode>(GameMode.E_CONSOLE);
  const [countries, setCountries] = useState<Country[]>(INITIAL_DATA[GameMode.E_CONSOLE]);
  const [layoutSettings, setLayoutSettings] = useState<LayoutSettings>(DEFAULT_LAYOUT_SETTINGS);
  const [animationSettings, setAnimationSettings] = useState<AnimationSettings>(DEFAULT_ANIMATION_SETTINGS);
  const [rankPositionOffsets, setRankPositionOffsets] = useState<RankPositionOffsets>({});

  useEffect(() => {
    // New subscription method that handles polling and storage events
    const unsubscribe = broadcastService.subscribe((msg) => {
      if (msg.type === 'UPDATE_RANKINGS') {
        setCurrentMode(msg.gameMode);
        setCountries(msg.countries);
        if (msg.layoutSettings) {
          setLayoutSettings(msg.layoutSettings);
        }
        if (msg.animationSettings) {
          setAnimationSettings(msg.animationSettings);
        }
        if (msg.rankPositionOffsets) {
          setRankPositionOffsets(msg.rankPositionOffsets);
        }
      }
    });
    return unsubscribe;
  }, []);

  const itemsToSkip = currentMode === GameMode.ROCKET_LEAGUE ? 0 : 0;

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
            {countries.map((country, index) => {
              // For group modes, header is at index 0, so rank 1 starts at index 1
              const isGroupMode = [
                GameMode.E_CONSOLE_GROUP_A,
                GameMode.E_CONSOLE_GROUP_B,
                GameMode.E_MOBILE_GROUP_A,
                GameMode.E_MOBILE_GROUP_B
              ].includes(currentMode);
              const rankDisplay = isGroupMode ? index : index + 1;
              
              return (
                <motion.div
                  layout
                  key={country.id}
                  initial={{ opacity: 0, scale: 0.9, x: -100 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{
                    type: "spring",
                    stiffness: animationSettings.stiffness,
                    damping: animationSettings.damping,
                    mass: animationSettings.mass,
                    layout: { 
                      duration: animationSettings.layoutDuration, 
                      type: "spring", 
                      bounce: 0.15 
                    }
                  }}
                  style={{ height: CELL_HEIGHT }}
                  className="w-full flex items-center justify-start"
                >
                  <CountryCard 
                    country={country} 
                    rankDisplay={rankDisplay} 
                    gameMode={currentMode}
                    width={CELL_WIDTH}
                    height={CELL_HEIGHT}    
                    layoutSettings={layoutSettings}
                    positionYOffset={rankPositionOffsets[rankDisplay] || 0}
                  />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
