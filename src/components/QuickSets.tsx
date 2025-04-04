
import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const QuickSets: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  
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
            <li className="px-4 py-2 hover:bg-gray-700 cursor-pointer">5 minutes</li>
            <li className="px-4 py-2 hover:bg-gray-700 cursor-pointer">10 minutes</li>
            <li className="px-4 py-2 hover:bg-gray-700 cursor-pointer">15 minutes</li>
            <li className="px-4 py-2 hover:bg-gray-700 cursor-pointer">25 minutes</li>
            <li className="px-4 py-2 hover:bg-gray-700 cursor-pointer">Custom...</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default QuickSets;
