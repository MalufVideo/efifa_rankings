import React from 'react';
import { ChevronUp, ChevronDown, X, Check } from 'lucide-react';

interface RankPositionModalProps {
  rankNumber: number;
  currentOffset: number;
  onOffsetChange: (newOffset: number) => void;
  onClose: () => void;
}

const MAX_OFFSET = 20;
const MIN_OFFSET = -20;

export const RankPositionModal: React.FC<RankPositionModalProps> = ({
  rankNumber,
  currentOffset,
  onOffsetChange,
  onClose
}) => {
  const handleUp = () => {
    if (currentOffset > MIN_OFFSET) {
      onOffsetChange(currentOffset - 1);
    }
  };

  const handleDown = () => {
    if (currentOffset < MAX_OFFSET) {
      onOffsetChange(currentOffset + 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-2xl p-6 shadow-2xl border border-slate-700 min-w-[280px]">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-white">
            Fine-Tune Rank {rankNumber}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col items-center gap-4">
          {/* Up Arrow */}
          <button
            onClick={handleUp}
            disabled={currentOffset <= MIN_OFFSET}
            className={`w-16 h-16 rounded-xl flex items-center justify-center transition-all ${
              currentOffset <= MIN_OFFSET
                ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                : 'bg-emerald-500 hover:bg-emerald-400 text-white active:scale-95'
            }`}
          >
            <ChevronUp className="w-10 h-10" />
          </button>

          {/* Current Offset Display */}
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-1">
              {currentOffset > 0 ? '+' : ''}{currentOffset}px
            </div>
            <div className="text-xs text-slate-400">
              Y Position Offset
            </div>
          </div>

          {/* Down Arrow */}
          <button
            onClick={handleDown}
            disabled={currentOffset >= MAX_OFFSET}
            className={`w-16 h-16 rounded-xl flex items-center justify-center transition-all ${
              currentOffset >= MAX_OFFSET
                ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                : 'bg-emerald-500 hover:bg-emerald-400 text-white active:scale-95'
            }`}
          >
            <ChevronDown className="w-10 h-10" />
          </button>

          {/* Limits Info */}
          <div className="text-xs text-slate-500 mt-2">
            Range: {MIN_OFFSET}px to +{MAX_OFFSET}px
          </div>
        </div>

        {/* OK Button */}
        <button
          onClick={onClose}
          className="w-full mt-6 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <Check className="w-5 h-5" /> OK
        </button>
      </div>
    </div>
  );
};
