
import React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Clock } from 'lucide-react';

interface QuickTimerProps {
  onSetTimer: (hours: number, minutes: number, seconds: number) => void;
}

const QuickTimer: React.FC<QuickTimerProps> = ({ onSetTimer }) => {
  const presetTimes = [
    { name: "5 min", time: { hours: 0, minutes: 5, seconds: 0 } },
    { name: "10 min", time: { hours: 0, minutes: 10, seconds: 0 } },
    { name: "15 min", time: { hours: 0, minutes: 15, seconds: 0 } },
    { name: "30 min", time: { hours: 0, minutes: 30, seconds: 0 } },
    { name: "1 hour", time: { hours: 1, minutes: 0, seconds: 0 } },
  ];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button 
          className="p-2 rounded-md bg-white/10 hover:bg-white/20 transition-all"
          aria-label="Quick Timer"
        >
          <Clock className="w-8 h-8" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-0 bg-timer-background border-white/10">
        <div className="py-2">
          {presetTimes.map((preset, index) => (
            <button
              key={index}
              className="w-full text-left px-4 py-2 hover:bg-white/10 transition-colors"
              onClick={() => onSetTimer(preset.time.hours, preset.time.minutes, preset.time.seconds)}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default QuickTimer;
