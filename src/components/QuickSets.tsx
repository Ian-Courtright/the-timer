
import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { toast } from 'sonner';

interface QuickSetsProps {
  onSetTimer: (hours: number, minutes: number, seconds: number) => void;
}

const QuickSets: React.FC<QuickSetsProps> = ({ onSetTimer }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const handleSetTimer = (hours: number, minutes: number, seconds: number) => {
    onSetTimer(hours, minutes, seconds);
    setIsOpen(false);
    toast.success(`Timer set to ${hours > 0 ? `${hours}h ` : ''}${minutes > 0 ? `${minutes}m ` : ''}${seconds > 0 ? `${seconds}s` : ''}`);
  };
  
  return (
    <div className="relative">
      <button 
        className="flex items-center gap-1 px-4 py-2 text-white/80 hover:text-white transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>QuickSets</span>
        <ChevronDown className={`w-4 h-4 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 bg-gray-800 rounded-md shadow-lg py-2 w-40 z-10">
          <ul>
            <li className="px-4 py-2 hover:bg-gray-700 cursor-pointer" onClick={() => handleSetTimer(0, 5, 0)}>5 minutes</li>
            <li className="px-4 py-2 hover:bg-gray-700 cursor-pointer" onClick={() => handleSetTimer(0, 10, 0)}>10 minutes</li>
            <li className="px-4 py-2 hover:bg-gray-700 cursor-pointer" onClick={() => handleSetTimer(0, 15, 0)}>15 minutes</li>
            <li className="px-4 py-2 hover:bg-gray-700 cursor-pointer" onClick={() => handleSetTimer(0, 25, 0)}>25 minutes</li>
            <li className="px-4 py-2 hover:bg-gray-700 cursor-pointer" onClick={() => handleSetTimer(1, 0, 0)}>1 hour</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default QuickSets;
