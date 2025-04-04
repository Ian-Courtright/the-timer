import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import gsap from 'gsap';

interface QuickSetsProps {
  onSetTimer: (hours: number, minutes: number, seconds: number) => void;
}

const QuickSets: React.FC<QuickSetsProps> = ({ onSetTimer }) => {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const handleSetTimer = (hours: number, minutes: number, seconds: number) => {
    onSetTimer(hours, minutes, seconds);
    setIsOpen(false);
    toast.success(`Timer set to ${hours > 0 ? `${hours}h ` : ''}${minutes > 0 ? `${minutes}m ` : ''}${seconds > 0 ? `${seconds}s` : ''}`);
  };
  
  // Animation for dropdown
  useEffect(() => {
    if (dropdownRef.current) {
      if (isOpen) {
        gsap.fromTo(
          dropdownRef.current,
          { opacity: 0, y: -10 },
          { opacity: 1, y: 0, duration: 0.2, ease: "power2.out" }
        );
      }
    }
  }, [isOpen]);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        buttonRef.current && 
        dropdownRef.current && 
        !buttonRef.current.contains(event.target as Node) && 
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  return (
    <div className="relative">
      <button 
        ref={buttonRef}
        className="px-5 py-2 bg-transparent font-bold text-white/95 hover:text-white transition-all flex items-center gap-1"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-sm font-black tracking-tight">QuickSets</span>
        <ChevronDown className={`w-4 h-4 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div 
          ref={dropdownRef}
          className="absolute top-full left-1/2 -translate-x-1/2 mt-1 bg-[#1E1E1E] rounded-md shadow-lg py-1 w-40 z-10 border border-[#2A2A2A] overflow-hidden"
        >
          <ul>
            <li 
              className="px-4 py-2 hover:bg-white/10 cursor-pointer text-sm transition-colors" 
              onClick={() => handleSetTimer(0, 2, 0)}
            >
              2 minutes
            </li>
            <li 
              className="px-4 py-2 hover:bg-white/10 cursor-pointer text-sm transition-colors" 
              onClick={() => handleSetTimer(0, 5, 0)}
            >
              5 minutes
            </li>
            <li 
              className="px-4 py-2 hover:bg-white/10 cursor-pointer text-sm transition-colors" 
              onClick={() => handleSetTimer(0, 10, 0)}
            >
              10 minutes
            </li>
            <li 
              className="px-4 py-2 hover:bg-white/10 cursor-pointer text-sm transition-colors" 
              onClick={() => handleSetTimer(0, 15, 0)}
            >
              15 minutes
            </li>
            <li 
              className="px-4 py-2 hover:bg-white/10 cursor-pointer text-sm transition-colors" 
              onClick={() => handleSetTimer(0, 25, 0)}
            >
              25 minutes
            </li>
            <li 
              className="px-4 py-2 hover:bg-white/10 cursor-pointer text-sm transition-colors" 
              onClick={() => handleSetTimer(1, 0, 0)}
            >
              1 hour
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default QuickSets;
