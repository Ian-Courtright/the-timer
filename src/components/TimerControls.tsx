
import React from 'react';
import { Play, Pause, Settings, Plus, RotateCcw } from 'lucide-react';

interface TimerControlsProps {
  isRunning: boolean;
  onPlayPause: () => void;
  onReset: () => void;
}

const TimerControls: React.FC<TimerControlsProps> = ({ 
  isRunning, 
  onPlayPause,
  onReset
}) => {
  return (
    <div className="flex flex-col items-center mt-24 gap-8">
      <button 
        onClick={onPlayPause}
        className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-all duration-300"
        aria-label={isRunning ? "Pause" : "Play"}
      >
        {isRunning ? (
          <Pause className="w-10 h-10 text-white" />
        ) : (
          <Play className="w-10 h-10 text-white" />
        )}
      </button>
      
      <div className="flex justify-between w-full max-w-md px-10">
        <button 
          onClick={onReset}
          className="flex items-center justify-center p-2 rounded-full bg-red-500/20 hover:bg-red-500/40 transition-all"
          aria-label="Reset"
        >
          <RotateCcw className="w-8 h-8" />
        </button>
        
        <button className="p-2 rounded-md bg-white/10 hover:bg-white/20 transition-all">
          <Plus className="w-8 h-8" />
        </button>
        
        <button className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all">
          <Settings className="w-8 h-8" />
        </button>
      </div>
    </div>
  );
};

export default TimerControls;
