import React, { useRef, useEffect } from 'react';
import QuickSets from './QuickSets';
import CircularTimer from './CircularTimer';
import gsap from 'gsap';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface HeaderProps {
  onSetTimer: (hours: number, minutes: number, seconds: number) => void;
  isRunning: boolean;
  progress: number; // Add progress prop
  isCountingUp?: boolean; // Add isCountingUp prop as optional
}

const Header: React.FC<HeaderProps> = ({ onSetTimer, isRunning, progress, isCountingUp = false }) => {
  const headerRef = useRef<HTMLElement>(null);
  const timerFlowRef = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef(true);
  
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
  
  // TimerFlow hover animation - set up only once
  useEffect(() => {
    if (timerFlowRef.current) {
      // Create hover effect timeline but pause it
      const tl = gsap.timeline({ paused: true });
      const spanElement = timerFlowRef.current.querySelector('span');
      
      if (spanElement) {
        tl.to(spanElement, {
          scale: 1.05,
          duration: 0.3,
          ease: "power2.out"
        }, 0);
        
        // Add event listeners with proper function references to allow removal
        const onEnter = () => tl.play();
        const onLeave = () => tl.reverse();
        
        timerFlowRef.current.addEventListener('mouseenter', onEnter);
        timerFlowRef.current.addEventListener('mouseleave', onLeave);
        
        // Cleanup
        return () => {
          if (timerFlowRef.current) {
            timerFlowRef.current.removeEventListener('mouseenter', onEnter);
            timerFlowRef.current.removeEventListener('mouseleave', onLeave);
          }
        };
      }
    }
  }, []); // Empty dependency array means this only runs once

  return (
    <header 
      ref={headerRef} 
      className="fixed top-0 left-0 right-0 flex justify-between items-center w-full py-3 px-6 backdrop-blur-sm z-10"
    >
      {/* Left side with CircularTimer */}
      <div className="flex items-center justify-center ml-2">
        <CircularTimer isRunning={isRunning} progress={progress} isCountingUp={isCountingUp} />
      </div>
      
      {/* Center QuickSets */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2">
        <div className="px-2 py-1 bg-[#2A2A2A] rounded-b-lg shadow-md">
          <QuickSets onSetTimer={onSetTimer} />
        </div>
      </div>
      
      {/* Right side with TimerFlow - Repositioned as a tab */}
      <div className="absolute top-0 right-0">
        <Tooltip>
          <TooltipTrigger asChild>
            <div 
              ref={timerFlowRef}
              className="px-4 py-2 bg-[#2A2A2A] rounded-bl-lg shadow-md flex items-center justify-center cursor-pointer hover:bg-[#333333] transition-colors"
            >
              <span className="text-sm font-black tracking-tight">TimerFlow</span>
            </div>
          </TooltipTrigger>
          <TooltipContent 
            className="max-w-xs text-sm bg-[#2A2A2A] text-white border-[#333333]"
            side="bottom"
            align="end"
          >
            <p>This timer was designed to be... a timer</p>
            <p className="mt-1">Nothing over the top or too fancy that you don&apos;t need. You want a simple timer that does the thing and doesn&apos;t look sh*t.</p>
            <p className="mt-1">Add time while it&apos;s counting down if you&apos;re locked in. See your timer records in the settings menu to see how accurate you were telling your client that you could do it in &quot;less than an hour&quot;, and see when you go over.</p>
            <p className="mt-1">Turn the sounds off if you&apos;re over it, doesn&apos;t bother me.</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </header>
  );
};

// Use React.memo to prevent unnecessary re-renders when parent component re-renders
export default React.memo(Header);
