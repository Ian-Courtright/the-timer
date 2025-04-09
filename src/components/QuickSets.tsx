import React, { useRef, useEffect } from 'react';
import { toast } from 'sonner';
import gsap from 'gsap';
import { soundEffects } from '@/lib/sounds/soundEffects';

interface QuickSetsProps {
  onSetTimer: (hours: number, minutes: number, seconds: number) => void;
}

const QuickSets: React.FC<QuickSetsProps> = ({ onSetTimer }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef(true);
  
  const handleSetTimer = (hours: number, minutes: number, seconds: number) => {
    soundEffects.playSettingsPlusQuickset();
    onSetTimer(hours, minutes, seconds);
    toast.success(`Timer set to ${hours > 0 ? `${hours}h ` : ''}${minutes > 0 ? `${minutes}m ` : ''}${seconds > 0 ? `${seconds}s` : ''}`);
  };
  
  // Initial animation
  useEffect(() => {
    if (containerRef.current && isInitialMount.current) {
      gsap.from(containerRef.current, {
        opacity: 0,
        y: -10,
        duration: 0.3,
        ease: "power2.out"
      });
      isInitialMount.current = false;
    }
  }, []);
  
  return (
    <div 
      ref={containerRef}
      className="bg-[#1E1E1E] rounded-md shadow-md py-3 border border-[#2A2A2A] overflow-hidden w-[280px] sm:w-[320px]"
    >
      <div className="grid grid-cols-3 gap-3 px-3 mx-auto">
        {/* Column 1 */}
        <button 
          className="px-3 py-2 bg-white/10 hover:bg-white/15 rounded-md text-sm transition-colors w-full"
          onClick={() => handleSetTimer(0, 2, 0)}
        >
          2 min
        </button>
        <button 
          className="px-3 py-2 bg-white/10 hover:bg-white/15 rounded-md text-sm transition-colors w-full"
          onClick={() => handleSetTimer(0, 5, 0)}
        >
          5 min
        </button>
        <button 
          className="px-3 py-2 bg-white/10 hover:bg-white/15 rounded-md text-sm transition-colors w-full"
          onClick={() => handleSetTimer(0, 10, 0)}
        >
          10 min
        </button>
        
        {/* Column 2 */}
        <button 
          className="px-3 py-2 bg-white/10 hover:bg-white/15 rounded-md text-sm transition-colors w-full"
          onClick={() => handleSetTimer(0, 15, 0)}
        >
          15 min
        </button>
        <button 
          className="px-3 py-2 bg-white/10 hover:bg-white/15 rounded-md text-sm transition-colors w-full"
          onClick={() => handleSetTimer(0, 20, 0)}
        >
          20 min
        </button>
        <button 
          className="px-3 py-2 bg-white/10 hover:bg-white/15 rounded-md text-sm transition-colors w-full"
          onClick={() => handleSetTimer(0, 25, 0)}
        >
          25 min
        </button>
        
        {/* Column 3 */}
        <button 
          className="px-3 py-2 bg-white/10 hover:bg-white/15 rounded-md text-sm transition-colors w-full"
          onClick={() => handleSetTimer(0, 30, 0)}
        >
          30 min
        </button>
        <button 
          className="px-3 py-2 bg-white/10 hover:bg-white/15 rounded-md text-sm transition-colors w-full"
          onClick={() => handleSetTimer(1, 0, 0)}
        >
          1 hour
        </button>
        <button 
          className="px-3 py-2 bg-white/10 hover:bg-white/15 rounded-md text-sm transition-colors w-full"
          onClick={() => handleSetTimer(2, 0, 0)}
        >
          2 hour
        </button>
      </div>
    </div>
  );
};

export default QuickSets;
