
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface CircularTimerProps {
  isRunning: boolean;
  progress: number; // 0-100 percentage
}

const CircularTimer: React.FC<CircularTimerProps> = ({ isRunning, progress }) => {
  return (
    <div className="relative w-12 h-12 flex items-center justify-center">
      {/* Circular progress with glow effect when running */}
      <div 
        className={cn(
          "absolute inset-0 rounded-full overflow-hidden transition-all duration-300",
          isRunning && "animate-pulse"
        )}
      >
        <div 
          className={cn(
            "w-full h-full rounded-full border-2",
            isRunning 
              ? "border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.7)]" 
              : "border-white/30"
          )}
        ></div>

        {/* Decreasing pie chart effect */}
        <div 
          className="absolute top-0 left-0 w-full h-full" 
          style={{
            background: isRunning ? '#ea384c' : 'rgba(255, 255, 255, 0.1)',
            clipPath: `conic-gradient(transparent ${progress}%, rgba(0,0,0,0) 0%)`
          }}
        ></div>
      </div>
      
      {/* Progress number in center */}
      <span className="z-10 text-xs font-mono font-bold">
        {Math.round(progress)}%
      </span>
    </div>
  );
};

export default CircularTimer;
