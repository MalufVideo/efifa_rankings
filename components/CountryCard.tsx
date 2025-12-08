import React from 'react';
import { Country, GameMode, LayoutSettings } from '../types';
import { DEFAULT_LAYOUT_SETTINGS } from '../constants';

interface CountryCardProps {
  country: Country;
  rankDisplay: number;
  gameMode: GameMode;
  width?: number | string;
  height?: number;
  isDraggable?: boolean;
  layoutSettings?: LayoutSettings;
}

export const CountryCard: React.FC<CountryCardProps> = ({ 
  country, 
  rankDisplay, 
  gameMode, 
  width = '100%',
  height = 86,
  isDraggable = false,
  layoutSettings = DEFAULT_LAYOUT_SETTINGS
}) => {
  const { fontSize, textPositionX, rankPositionX, rankSize, flagSize, flagPositionX, headerFontSize, headerPositionX } = layoutSettings;
  
  const getGradient = () => {
    switch (gameMode) {
      case GameMode.ROCKET_LEAGUE:
        return 'from-[#CF0605] to-[#FEB50B]';
      case GameMode.E_MOBILE:
      case GameMode.E_MOBILE_GROUPS:
        return 'from-[#BCA400] to-[#D9D838]';
      case GameMode.E_CONSOLE:
      case GameMode.E_CONSOLE_GROUPS:
        return 'from-[#019C2E] to-[#9DDC03]';
      default:
        return 'from-gray-500 to-gray-400';
    }
  };

  // Render header row (Group A / Group B) - transparent background
  if (country.isHeader) {
    return (
      <div 
        className="relative flex items-center justify-center text-white font-black uppercase tracking-wider"
        style={{ width, height: height - 10 }}
      >
        <div 
          className="drop-shadow-lg z-10 text-center"
          style={{ 
            fontSize: `${headerFontSize}px`,
            transform: `translateX(${headerPositionX}px)`,
            textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
          }}
        >
          {country.name}
        </div>
      </div>
    );
  }

  const baseClasses = `
    relative flex items-center px-6 rounded-xl shadow-lg 
    ${isDraggable ? 'cursor-grab active:cursor-grabbing hover:scale-[1.02] transition-transform' : ''}
    bg-gradient-to-r ${getGradient()}
    text-black font-bold uppercase tracking-wider overflow-hidden
  `;

  return (
    <div 
      className={baseClasses}
      style={{ width, height: height - 10 }} // -10 for gap simulation/margin within the cell
    >
      {/* Background Pattern Overlay */}
      <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] mix-blend-overlay pointer-events-none" />
      
      
      {/* Rank Circle */}
      <div 
        className="flex-shrink-0 bg-black/80 text-white rounded-full flex items-center justify-center font-black mr-4 shadow-md z-10 border-2 border-white/20"
        style={{ 
          width: 40 * rankSize, 
          height: 40 * rankSize,
          fontSize: 20 * rankSize,
          transform: `translateX(${rankPositionX}px)` 
        }}
      >
        {country.rank || rankDisplay}
      </div>

      {/* Flag Image */}
      <div 
        className="mr-4 z-10 flex-shrink-0 flex items-center justify-center overflow-hidden rounded shadow-sm bg-black/10 border border-black/10"
        style={{ 
          width: 48 * flagSize, 
          height: 32 * flagSize,
          transform: `translateX(${flagPositionX}px)` 
        }}
      >
        <img 
          src={`https://flagcdn.com/h80/${country.isoCode}.png`} 
          alt={country.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Name */}
      <div 
        className="drop-shadow-sm truncate z-10 flex-grow font-black text-center"
        style={{ 
          fontSize: `${fontSize}px`,
          transform: `translateX(${textPositionX}px)` 
        }}
      >
        {country.name}
      </div>

      {isDraggable && (
        <div className="ml-auto opacity-50 z-10">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="8" y1="6" x2="21" y2="6"></line>
            <line x1="8" y1="12" x2="21" y2="12"></line>
            <line x1="8" y1="18" x2="21" y2="18"></line>
            <line x1="3" y1="6" x2="3.01" y2="6"></line>
            <line x1="3" y1="12" x2="3.01" y2="12"></line>
            <line x1="3" y1="18" x2="3.01" y2="18"></line>
          </svg>
        </div>
      )}
    </div>
  );
};
