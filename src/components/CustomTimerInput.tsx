import React, { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import gsap from 'gsap';

interface CustomTimerInputProps {
  isOpen: boolean;
  onClose: () => void;
  onSetTimer: (hours: number, minutes: number, seconds: number) => void;
}

const CustomTimerInput: React.FC<CustomTimerInputProps> = ({ 
  isOpen, 
  onClose, 
  onSetTimer 
}) => {
  const [hours, setHours] = useState<number>(0);
  const [minutes, setMinutes] = useState<number>(0);
  const [seconds, setSeconds] = useState<number>(0);
  
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Animation for opening/closing
  useEffect(() => {
    if (containerRef.current) {
      if (isOpen) {
        gsap.fromTo(
          containerRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" }
        );
      } else {
        gsap.to(containerRef.current, {
          opacity: 0,
          y: 20,
          duration: 0.2,
          ease: "power2.in"
        });
      }
    }
  }, [isOpen]);
  
  const handleApply = () => {
    onSetTimer(hours, minutes, seconds);
    onClose();
    
    // Reset the inputs
    setHours(0);
    setMinutes(0);
    setSeconds(0);
  };
  
  if (!isOpen) return null;
  
  return (
    <div 
      ref={containerRef} 
      className="absolute bottom-36 left-1/2 -translate-x-1/2 bg-[#1E1E1E] rounded-lg shadow-lg p-4 w-72 border border-[#333333]"
    >
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-black tracking-tight text-white">Custom Timer</h3>
        <button 
          onClick={onClose}
          className="rounded-full p-1 hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div>
          <label htmlFor="hours-custom" className="text-xs text-white/70 block mb-1">Hours</label>
          <input 
            id="hours-custom"
            type="number" 
            min="0"
            max="23"
            value={hours}
            onChange={(e) => setHours(Math.max(0, Math.min(23, Number(e.target.value))))}
            className="w-full bg-white/10 border border-white/20 rounded-md px-2 py-1 text-white focus:outline-none focus:ring-1 focus:ring-white/30"
          />
        </div>
        
        <div>
          <label htmlFor="minutes-custom" className="text-xs text-white/70 block mb-1">Minutes</label>
          <input 
            id="minutes-custom"
            type="number" 
            min="0"
            max="59"
            value={minutes}
            onChange={(e) => setMinutes(Math.max(0, Math.min(59, Number(e.target.value))))}
            className="w-full bg-white/10 border border-white/20 rounded-md px-2 py-1 text-white focus:outline-none focus:ring-1 focus:ring-white/30"
          />
        </div>
        
        <div>
          <label htmlFor="seconds-custom" className="text-xs text-white/70 block mb-1">Seconds</label>
          <input 
            id="seconds-custom"
            type="number" 
            min="0"
            max="59"
            value={seconds}
            onChange={(e) => setSeconds(Math.max(0, Math.min(59, Number(e.target.value))))}
            className="w-full bg-white/10 border border-white/20 rounded-md px-2 py-1 text-white focus:outline-none focus:ring-1 focus:ring-white/30"
          />
        </div>
      </div>
      
      <button 
        onClick={handleApply}
        className="w-full py-2 bg-white/20 hover:bg-white/30 rounded-md transition-colors font-bold"
      >
        Start Timer
      </button>
    </div>
  );
};

export default CustomTimerInput; 