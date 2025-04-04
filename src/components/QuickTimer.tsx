import React, { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Plus } from 'lucide-react';

interface QuickTimerProps {
  onSetTimer: (hours: number, minutes: number, seconds: number) => void;
}

const QuickTimer: React.FC<QuickTimerProps> = ({ onSetTimer }) => {
  const [hours, setHours] = useState<number>(0);
  const [minutes, setMinutes] = useState<number>(0);
  const [seconds, setSeconds] = useState<number>(0);

  const handleApplyCustomTimer = () => {
    onSetTimer(hours, minutes, seconds);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button 
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all"
          aria-label="Custom Timer"
        >
          <Plus className="w-8 h-8" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-4 bg-timer-background border-white/10">
        <div className="space-y-4">
          <h3 className="text-base font-medium text-white">Custom Timer</h3>
          
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <label htmlFor="quick-hours" className="text-xs text-white/70">Hours</label>
              <input 
                id="quick-hours"
                type="number" 
                min="0"
                max="23"
                value={hours}
                onChange={(e) => setHours(Number(e.target.value))}
                className="w-full bg-white/10 border border-white/20 rounded-md px-2 py-1 text-white focus:outline-none focus:ring-1 focus:ring-white/30 text-sm"
              />
            </div>
            
            <div className="space-y-1">
              <label htmlFor="quick-minutes" className="text-xs text-white/70">Minutes</label>
              <input 
                id="quick-minutes"
                type="number" 
                min="0"
                max="59"
                value={minutes}
                onChange={(e) => setMinutes(Number(e.target.value))}
                className="w-full bg-white/10 border border-white/20 rounded-md px-2 py-1 text-white focus:outline-none focus:ring-1 focus:ring-white/30 text-sm"
              />
            </div>
            
            <div className="space-y-1">
              <label htmlFor="quick-seconds" className="text-xs text-white/70">Seconds</label>
              <input 
                id="quick-seconds"
                type="number" 
                min="0"
                max="59"
                value={seconds}
                onChange={(e) => setSeconds(Number(e.target.value))}
                className="w-full bg-white/10 border border-white/20 rounded-md px-2 py-1 text-white focus:outline-none focus:ring-1 focus:ring-white/30 text-sm"
              />
            </div>
          </div>

          <button 
            onClick={handleApplyCustomTimer}
            className="w-full py-1.5 bg-white/20 hover:bg-white/30 rounded-md transition-colors text-sm"
          >
            Start Timer
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default QuickTimer;
