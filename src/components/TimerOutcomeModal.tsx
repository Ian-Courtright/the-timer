import React, { useState, useRef, useEffect } from 'react';
import { X, CheckCircle, XCircle, Trash2, FileEdit } from 'lucide-react';
import gsap from 'gsap';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export type TimerOutcome = 'completed' | 'cancelled' | 'scrapped' | 'other';

interface TimerOutcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (outcome: TimerOutcome, note?: string) => void;
}

const TimerOutcomeModal: React.FC<TimerOutcomeModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm 
}) => {
  const [selectedOutcome, setSelectedOutcome] = useState<TimerOutcome>('completed');
  const [note, setNote] = useState<string>('');
  const [showNoteInput, setShowNoteInput] = useState<boolean>(false);
  
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
  
  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node) && isOpen) {
        onClose();
      }
    };
    
    // Add event listener when modal is open
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    // Clean up
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);
  
  // Handle ESC key to close
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, onClose]);
  
  // Show note input when "Other" is selected
  useEffect(() => {
    setShowNoteInput(selectedOutcome === 'other');
  }, [selectedOutcome]);
  
  const handleConfirm = () => {
    onConfirm(selectedOutcome, showNoteInput ? note : undefined);
    
    // Reset state
    setSelectedOutcome('completed');
    setNote('');
    setShowNoteInput(false);
    
    onClose();
  };
  
  if (!isOpen) return null;
  
  return (
    <div 
      ref={containerRef} 
      className="absolute bottom-28 left-1/2 -translate-x-1/2 bg-[#1E1E1E] rounded-lg shadow-lg p-4 w-80 border border-[#333333] z-10"
    >
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-black tracking-tight text-white">Timer Outcome</h3>
        <Tooltip>
          <TooltipTrigger asChild>
            <button 
              onClick={onClose}
              className="rounded-full p-1 hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </TooltipTrigger>
          <TooltipContent className="bg-[#2A2A2A] text-white border-[#333333]">
            <p>Press Esc to close</p>
          </TooltipContent>
        </Tooltip>
      </div>
      
      <p className="text-white/70 mb-3 text-sm">Select the outcome for this timer session:</p>
      
      <div className="grid grid-cols-2 gap-2 mb-4">
        <button 
          onClick={() => setSelectedOutcome('completed')}
          className={`p-3 rounded-md flex flex-col items-center transition-colors ${
            selectedOutcome === 'completed' 
              ? 'bg-green-500/20 border border-green-500/40' 
              : 'bg-white/10 border border-white/20 hover:bg-white/15'
          }`}
        >
          <CheckCircle className={`w-6 h-6 mb-1 ${selectedOutcome === 'completed' ? 'text-green-500' : 'text-white/60'}`} />
          <span className="text-sm font-medium">Completed</span>
        </button>
        
        <button 
          onClick={() => setSelectedOutcome('cancelled')}
          className={`p-3 rounded-md flex flex-col items-center transition-colors ${
            selectedOutcome === 'cancelled' 
              ? 'bg-yellow-500/20 border border-yellow-500/40' 
              : 'bg-white/10 border border-white/20 hover:bg-white/15'
          }`}
        >
          <XCircle className={`w-6 h-6 mb-1 ${selectedOutcome === 'cancelled' ? 'text-yellow-500' : 'text-white/60'}`} />
          <span className="text-sm font-medium">Cancelled</span>
        </button>
        
        <button 
          onClick={() => setSelectedOutcome('scrapped')}
          className={`p-3 rounded-md flex flex-col items-center transition-colors ${
            selectedOutcome === 'scrapped' 
              ? 'bg-red-500/20 border border-red-500/40' 
              : 'bg-white/10 border border-white/20 hover:bg-white/15'
          }`}
        >
          <Trash2 className={`w-6 h-6 mb-1 ${selectedOutcome === 'scrapped' ? 'text-red-500' : 'text-white/60'}`} />
          <span className="text-sm font-medium">Scrapped</span>
        </button>
        
        <button 
          onClick={() => setSelectedOutcome('other')}
          className={`p-3 rounded-md flex flex-col items-center transition-colors ${
            selectedOutcome === 'other' 
              ? 'bg-blue-500/20 border border-blue-500/40' 
              : 'bg-white/10 border border-white/20 hover:bg-white/15'
          }`}
        >
          <FileEdit className={`w-6 h-6 mb-1 ${selectedOutcome === 'other' ? 'text-blue-500' : 'text-white/60'}`} />
          <span className="text-sm font-medium">Other</span>
        </button>
      </div>
      
      {showNoteInput && (
        <div className="mb-4">
          <label htmlFor="note" className="text-xs text-white/70 block mb-1">Add a note (optional)</label>
          <textarea 
            id="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Enter details about the timer outcome..."
            className="w-full bg-white/10 border border-white/20 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-white/30 min-h-[80px] text-sm"
          />
        </div>
      )}
      
      <button 
        onClick={handleConfirm}
        className="w-full py-2 bg-white/20 hover:bg-white/30 rounded-md transition-colors font-bold"
      >
        Confirm
      </button>
    </div>
  );
};

export default TimerOutcomeModal; 