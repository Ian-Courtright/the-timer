import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Settings, RotateCcw, Plus } from 'lucide-react';
import CustomTimerInput from './CustomTimerInput';
import gsap from 'gsap';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { soundEffects } from '@/lib/sounds/soundEffects';

interface TimerControlsProps {
  isRunning: boolean;
  onPlayPause: () => void;
  onReset: () => void;
  onSetTimer: (hours: number, minutes: number, seconds: number) => void;
  onOpenSettings: () => void;
  customTimerOpen?: boolean;
  onCustomTimerOpenChange?: (open: boolean) => void;
}

const TimerControls: React.FC<TimerControlsProps> = ({ 
  isRunning, 
  onPlayPause,
  onReset,
  onSetTimer,
  onOpenSettings,
  customTimerOpen = false,
  onCustomTimerOpenChange = () => {}
}) => {
  // Refs for animation
  const controlsContainerRef = useRef<HTMLDivElement>(null);
  const playPauseButtonRef = useRef<HTMLButtonElement>(null);
  const resetButtonRef = useRef<HTMLButtonElement>(null);
  const settingsButtonRef = useRef<HTMLButtonElement>(null);
  const plusButtonRef = useRef<HTMLButtonElement>(null);
  
  // Initial animation setup
  useEffect(() => {
    if (controlsContainerRef.current) {
      gsap.from(controlsContainerRef.current, {
        y: 50,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        delay: 0.3
      });
    }
  }, []);
  
  // Play/Pause button animation
  useEffect(() => {
    if (playPauseButtonRef.current) {
      gsap.to(playPauseButtonRef.current, {
        scale: isRunning ? 0.95 : 1,
        boxShadow: isRunning ? '0 0 25px rgba(255, 255, 255, 0.6)' : '0 0 10px rgba(255, 255, 255, 0.3)',
        duration: 0.4,
        ease: "power2.out"
      });
    }
  }, [isRunning]);
  
  // Handler for play/pause with animation
  const handlePlayPauseWithAnimation = () => {
    soundEffects.playPlayPause();
    
    if (playPauseButtonRef.current) {
      // Click effect
      gsap.timeline()
        .to(playPauseButtonRef.current, {
          scale: 0.9,
          duration: 0.1,
          ease: "power2.out"
        })
        .to(playPauseButtonRef.current, {
          scale: isRunning ? 0.95 : 1,
          duration: 0.3,
          ease: "elastic.out(1, 0.5)"
        });
    }
    onPlayPause();
  };
  
  // Handler for reset with animation
  const handleResetWithAnimation = () => {
    soundEffects.playReset();
    
    if (resetButtonRef.current) {
      // Scale & rotate animation for triangle button
      gsap.timeline()
        .to(resetButtonRef.current, {
          scale: 0.9,
          rotation: "-=360", 
          duration: 0.6,
          ease: "power1.out"
        })
        .to(resetButtonRef.current, {
          scale: 1,
          duration: 0.3,
          ease: "elastic.out"
        });
    }
    onReset();
  };
  
  // Handler for settings with animation
  const handleSettingsWithAnimation = () => {
    soundEffects.playSettingsPlusQuickset();
    
    if (settingsButtonRef.current) {
      gsap.to(settingsButtonRef.current, {
        rotation: "+=30",
        duration: 0.3,
        ease: "power1.out",
        yoyo: true,
        repeat: 1
      });
    }
    onOpenSettings();
  };
  
  // Handler for plus button with animation
  const handlePlusWithAnimation = () => {
    soundEffects.playSettingsPlusQuickset();
    
    if (plusButtonRef.current) {
      gsap.to(plusButtonRef.current, {
        scale: 0.9,
        duration: 0.1,
        ease: "power2.out",
        yoyo: true,
        repeat: 1
      });
    }
    onCustomTimerOpenChange(true);
  };

  return (
    <div ref={controlsContainerRef} className="fixed bottom-0 left-0 right-0 pb-8 pt-4 flex flex-col items-center">
      {/* Play/Pause Button */}
      <div className="mb-6">
        <Tooltip>
          <TooltipTrigger asChild>
            <button 
              ref={playPauseButtonRef}
              onClick={handlePlayPauseWithAnimation}
              className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-white flex items-center justify-center hover:bg-white/90 transition-all duration-300"
              aria-label={isRunning ? "Pause" : "Play"}
            >
              {isRunning ? (
                <Pause className="w-7 h-7 md:w-8 md:h-8 text-[#1A1A1A] fill-current" strokeWidth={0} />
              ) : (
                <Play className="w-7 h-7 md:w-8 md:h-8 text-[#1A1A1A] fill-current ml-1" strokeWidth={0} />
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent className="bg-[#2A2A2A] text-white border-[#333333]">
            <p>Space: {isRunning ? "Pause" : "Start"} the timer</p>
          </TooltipContent>
        </Tooltip>
      </div>
      
      {/* Controls Row - With reset at far left and settings at far right */}
      <div className="flex justify-between items-center w-full px-4">
        {/* Reset Button - Left Side */}
        <div className="flex items-center">
          <Tooltip>
            <TooltipTrigger asChild>
              <button 
                ref={resetButtonRef}
                onClick={handleResetWithAnimation}
                className="w-12 h-12 md:w-12 md:h-12 rounded-full hover:bg-white/10 transition-all flex items-center justify-center"
                aria-label="Reset"
              >
                <RotateCcw className="w-6 h-6 md:w-6 md:h-6" />
              </button>
            </TooltipTrigger>
            <TooltipContent className="bg-[#2A2A2A] text-white border-[#333333]">
              <p>R: Reset timer (for when you've given up)</p>
            </TooltipContent>
          </Tooltip>
        </div>
        
        {/* Plus Button - Center, Same size as others */}
        <div className="flex items-center">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                ref={plusButtonRef}
                onClick={handlePlusWithAnimation}
                className="w-12 h-12 md:w-12 md:h-12 rounded-full hover:bg-white/10 transition-all flex items-center justify-center"
                aria-label="Add Custom Timer"
              >
                <Plus className="w-6 h-6 md:w-6 md:h-6" />
              </button>
            </TooltipTrigger>
            <TooltipContent className="bg-[#2A2A2A] text-white border-[#333333]">
              <p>C: Add custom time (when you're hopelessly behind)</p>
            </TooltipContent>
          </Tooltip>
        </div>
        
        {/* Settings Button - Right Side */}
        <div className="flex items-center">
          <Tooltip>
            <TooltipTrigger asChild>
              <button 
                ref={settingsButtonRef}
                onClick={handleSettingsWithAnimation}
                className="w-12 h-12 md:w-12 md:h-12 rounded-full hover:bg-white/10 transition-all flex items-center justify-center"
                aria-label="Settings"
              >
                <Settings className="w-6 h-6 md:w-6 md:h-6" />
              </button>
            </TooltipTrigger>
            <TooltipContent className="bg-[#2A2A2A] text-white border-[#333333]">
              <p>S: Settings & Timer Analytics</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
      
      {/* Custom Timer Input Component */}
      <CustomTimerInput
        isOpen={customTimerOpen}
        onClose={() => onCustomTimerOpenChange(false)}
        onSetTimer={onSetTimer}
      />
    </div>
  );
};

export default TimerControls;
