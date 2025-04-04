
import React, { useState } from 'react';
import { Play, Pause, Settings, RotateCcw, Clock } from 'lucide-react';
import TimerSettings from './TimerSettings';
import QuickTimer from './QuickTimer';

interface TimerControlsProps {
  isRunning: boolean;
  onPlayPause: () => void;
  onReset: () => void;
  onSetTimer: (hours: number, minutes: number, seconds: number) => void;
}

const TimerControls: React.FC<TimerControlsProps> = ({ 
  isRunning, 
  onPlayPause,
  onReset,
  onSetTimer
}) => {
  const [settingsOpen, setSettingsOpen] = useState(false);

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
        
        <QuickTimer onSetTimer={onSetTimer} />
        
        <button 
          onClick={() => setSettingsOpen(true)}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all"
          aria-label="Settings"
        >
          <Settings className="w-8 h-8" />
        </button>
      </div>

      <TimerSettings 
        open={settingsOpen} 
        onOpenChange={setSettingsOpen} 
        onSetTimer={onSetTimer}
      />
    </div>
  );
};

export default TimerControls;
