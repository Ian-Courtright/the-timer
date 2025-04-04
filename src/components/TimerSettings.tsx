
import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { X } from 'lucide-react';

interface TimerSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSetTimer: (hours: number, minutes: number, seconds: number) => void;
}

const TimerSettings: React.FC<TimerSettingsProps> = ({ 
  open, 
  onOpenChange,
  onSetTimer 
}) => {
  const [hours, setHours] = useState<number>(0);
  const [minutes, setMinutes] = useState<number>(0);
  const [seconds, setSeconds] = useState<number>(0);

  const handleApplySettings = () => {
    onSetTimer(hours, minutes, seconds);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="bg-timer-background text-timer-text border-timer-background">
        <SheetHeader className="border-b border-white/10 pb-4">
          <div className="flex justify-between items-center">
            <SheetTitle className="text-white text-xl">Timer Settings</SheetTitle>
            <button 
              onClick={() => onOpenChange(false)}
              className="rounded-full p-1 hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Set Custom Timer</h3>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label htmlFor="hours" className="text-sm text-white/70">Hours</label>
                <input 
                  id="hours"
                  type="number" 
                  min="0"
                  max="23"
                  value={hours}
                  onChange={(e) => setHours(Number(e.target.value))}
                  className="w-full bg-white/10 border border-white/20 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white/30"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="minutes" className="text-sm text-white/70">Minutes</label>
                <input 
                  id="minutes"
                  type="number" 
                  min="0"
                  max="59"
                  value={minutes}
                  onChange={(e) => setMinutes(Number(e.target.value))}
                  className="w-full bg-white/10 border border-white/20 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white/30"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="seconds" className="text-sm text-white/70">Seconds</label>
                <input 
                  id="seconds"
                  type="number" 
                  min="0"
                  max="59"
                  value={seconds}
                  onChange={(e) => setSeconds(Number(e.target.value))}
                  className="w-full bg-white/10 border border-white/20 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white/30"
                />
              </div>
            </div>

            <button 
              onClick={handleApplySettings}
              className="w-full mt-4 py-2 bg-white/20 hover:bg-white/30 rounded-md transition-colors"
            >
              Apply Settings
            </button>
          </div>

          <div className="space-y-4 pt-4 border-t border-white/10">
            <h3 className="text-lg font-medium">Timer Appearance</h3>
            <div className="flex flex-col space-y-2">
              <label className="inline-flex items-center space-x-2">
                <input type="checkbox" className="rounded bg-white/10 border-white/20" />
                <span>Play sound on completion</span>
              </label>
              
              <label className="inline-flex items-center space-x-2">
                <input type="checkbox" className="rounded bg-white/10 border-white/20" />
                <span>Show notifications</span>
              </label>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default TimerSettings;
