import React, { useState, useRef, useEffect } from 'react';
import QuickSets from './QuickSets';
import CircularTimer from './CircularTimer';
import gsap from 'gsap';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ChevronDown } from 'lucide-react';
import { soundEffects } from '@/lib/sounds/soundEffects';

interface HeaderProps {
  onSetTimer: (hours: number, minutes: number, seconds: number) => void;
  isRunning: boolean;
  progress: number; // Add progress prop
  isCountingUp?: boolean; // Add isCountingUp prop as optional
  isOverage?: boolean; // Add isOverage prop as optional
  onOpenSettings?: () => void; // Add handler for settings
}

const Header: React.FC<HeaderProps> = ({ 
  onSetTimer, 
  isRunning, 
  progress, 
  isCountingUp = false,
  isOverage = false,
  onOpenSettings
}) => {
  const [quickSetsVisible, setQuickSetsVisible] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const timerFlowRef = useRef<HTMLDivElement>(null);
  const quickSetsRef = useRef<HTMLDivElement>(null);
  const quickSetsContentRef = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef(true);
  
  // Create animations that will be controlled by event handlers
  const timerFlowAnimationTl = useRef(gsap.timeline({ paused: true }));
  const quickSetsAnimationTl = useRef(gsap.timeline({ paused: true }));
  
  // Initial animation - only on mount
  useEffect(() => {
    if (headerRef.current && isInitialMount.current) {
      gsap.from(headerRef.current, {
        y: -50,
        opacity: 0,
        duration: 0.8, 
        ease: "power2.out",
        delay: 0.2
      });
      isInitialMount.current = false;
    }
  }, []);
  
  // Setup TimerFlow animation once
  useEffect(() => {
    if (timerFlowRef.current) {
      const spanElement = timerFlowRef.current.querySelector('span');
      
      if (spanElement) {
        // Create the animation but don't add event listeners here
        timerFlowAnimationTl.current = gsap.timeline({ paused: true });
        timerFlowAnimationTl.current.to(spanElement, {
          scale: 1.05,
          duration: 0.3,
          ease: "power2.out"
        }, 0);
      }
    }
  }, []);

  // Setup QuickSets animation once
  useEffect(() => {
    if (quickSetsRef.current) {
      const spanElement = quickSetsRef.current.querySelector('span');
      
      if (spanElement) {
        // Create the animation but don't add event listeners here
        quickSetsAnimationTl.current = gsap.timeline({ paused: true });
        quickSetsAnimationTl.current.to(spanElement, {
          scale: 1.05,
          duration: 0.3,
          ease: "power2.out"
        }, 0);
      }
    }
  }, []);
  
  // QuickSets content animation and click outside handling
  useEffect(() => {
    // Animation effects
    if (quickSetsContentRef.current) {
      if (quickSetsVisible) {
        gsap.fromTo(
          quickSetsContentRef.current,
          { opacity: 0, y: -10 },
          { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" }
        );
      } else {
        gsap.to(
          quickSetsContentRef.current,
          { opacity: 0, y: -10, duration: 0.2, ease: "power2.in" }
        );
      }
    }
    
    // Handle click outside to close QuickSets
    const handleClickOutside = (event: MouseEvent) => {
      if (
        quickSetsVisible && 
        quickSetsContentRef.current && 
        !quickSetsContentRef.current.contains(event.target as Node) &&
        quickSetsRef.current && 
        !quickSetsRef.current.contains(event.target as Node)
      ) {
        setQuickSetsVisible(false);
      }
    };
    
    // Add event listener when dropdown is open
    if (quickSetsVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    // Clean up event listener
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [quickSetsVisible]);
  
  // Handle ESC key to close QuickSets
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && quickSetsVisible) {
        setQuickSetsVisible(false);
      }
    };
    
    if (quickSetsVisible) {
      document.addEventListener('keydown', handleEscKey);
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [quickSetsVisible]);
  
  // Event handlers for TimerFlow
  const handleTimerFlowMouseEnter = () => {
    timerFlowAnimationTl.current.play();
    soundEffects.playHoverLogo();
  };
  
  const handleTimerFlowMouseLeave = () => {
    timerFlowAnimationTl.current.reverse();
  };
  
  // Event handlers for QuickSets
  const handleQuickSetsMouseEnter = () => {
    quickSetsAnimationTl.current.play();
  };
  
  const handleQuickSetsMouseLeave = () => {
    quickSetsAnimationTl.current.reverse();
  };
  
  // Function to toggle QuickSets visibility
  const toggleQuickSets = () => {
    soundEffects.playSettingsPlusQuickset();
    setQuickSetsVisible(prev => !prev);
  };

  return (
    <header 
      ref={headerRef} 
      className="fixed top-0 left-0 right-0 flex justify-between items-center w-full py-3 pl-6 pr-0 backdrop-blur-sm z-10"
    >
      {/* Left side with CircularTimer */}
      <div className="flex items-center justify-center ml-2">
        <CircularTimer isRunning={isRunning} progress={progress} isCountingUp={isCountingUp} isOverage={isOverage} />
      </div>
      
      {/* Center tab - QuickSets */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2">
        <Tooltip>
          <TooltipTrigger 
            asChild
          >
            <div 
              ref={quickSetsRef}
              className={`px-6 py-2 ${quickSetsVisible ? 'bg-[#333333]' : 'bg-[#2A2A2A]'} rounded-b-lg shadow-md flex items-center justify-center cursor-pointer hover:bg-[#333333] transition-colors gap-1`}
              onClick={toggleQuickSets}
              onMouseEnter={handleQuickSetsMouseEnter}
              onMouseLeave={handleQuickSetsMouseLeave}
              data-tooltip="quicksets"
            >
              <span className="text-sm font-black tracking-tight">QuickSets</span>
              <ChevronDown className={`w-4 h-4 transform transition-transform ${quickSetsVisible ? 'rotate-180' : ''}`} />
            </div>
          </TooltipTrigger>
          <TooltipContent 
            className="bg-[#2A2A2A] text-white border-[#333333]"
            side="bottom"
            align="center"
          >
            <p>Press 'Q' to access common timer presets for people who can't be bothered to type numbers</p>
          </TooltipContent>
        </Tooltip>
      </div>
      
      {/* Center QuickSets content */}
      <div 
        ref={quickSetsContentRef}
        className={`absolute top-12 left-1/2 transform -translate-x-1/2 z-20 w-full max-w-xs mx-auto ${quickSetsVisible ? 'block' : 'hidden'}`}
      >
        <div className="px-2 py-2 flex justify-center">
          <QuickSets onSetTimer={onSetTimer} />
        </div>
      </div>
      
      {/* Right tab - TimerFlow */}
      <div className="absolute top-0 right-0">
        <Tooltip>
          <TooltipTrigger 
            asChild
            onMouseEnter={() => {
              // Ensure the sound plays on tooltip hover
              soundEffects.playHoverLogo();
            }}
          >
            <div 
              ref={timerFlowRef}
              className="px-6 py-2 bg-[#2A2A2A] rounded-bl-lg shadow-md flex items-center justify-center cursor-pointer hover:bg-[#333333] transition-colors"
              onClick={onOpenSettings}
              onMouseEnter={handleTimerFlowMouseEnter}
              onMouseLeave={handleTimerFlowMouseLeave}
              data-tooltip="settings"
            >
              <span className="text-sm font-black tracking-tight">The Timer</span>
            </div>
          </TooltipTrigger>
          <TooltipContent 
            className="max-w-xs text-sm bg-[#2A2A2A] text-white border-[#333333]"
            side="bottom"
            align="end"
          >
            <div className="space-y-3">
              <div>
                <p className="italic text-gray-400">The Timer™ — Just another minimalist timer app but built without 37 other components to go with it. Yet it still can't make you actually finish your work on time.</p>
              </div>
              
              <div>
                <p className="font-medium border-b border-gray-700 pb-1 mb-2">Keyboard Shortcuts</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  <div className="flex items-center gap-2">
                    <kbd className="px-2 py-0.5 bg-black/40 rounded text-xs font-mono">Space</kbd>
                    <span>Play/pause timer</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <kbd className="px-2 py-0.5 bg-black/40 rounded text-xs font-mono">R</kbd>
                    <span>Reset timer</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <kbd className="px-2 py-0.5 bg-black/40 rounded text-xs font-mono">C</kbd>
                    <span>Add custom time</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <kbd className="px-2 py-0.5 bg-black/40 rounded text-xs font-mono">Q</kbd>
                    <span>Quick presets</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <kbd className="px-2 py-0.5 bg-black/40 rounded text-xs font-mono">S</kbd>
                    <span>Settings</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <kbd className="px-2 py-0.5 bg-black/40 rounded text-xs font-mono">A</kbd>
                    <span>Analytics</span>
                  </div>
                </div>
              </div>

              <p className="italic text-xs text-gray-400">Press 'A' in settings to see just how bad you are at estimating time.</p>
            </div>
          </TooltipContent>
        </Tooltip>
      </div>
    </header>
  );
};

// Use React.memo to prevent unnecessary re-renders when parent component re-renders
export default React.memo(Header);
