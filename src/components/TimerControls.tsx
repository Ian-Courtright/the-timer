import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Settings, RotateCcw, Plus } from 'lucide-react';
import CustomTimerInput from './CustomTimerInput';
import gsap from 'gsap';

interface TimerControlsProps {
  isRunning: boolean;
  onPlayPause: () => void;
  onReset: () => void;
  onSetTimer: (hours: number, minutes: number, seconds: number) => void;
  onOpenSettings: () => void;
}

const TimerControls: React.FC<TimerControlsProps> = ({ 
  isRunning, 
  onPlayPause,
  onReset,
  onSetTimer,
  onOpenSettings
}) => {
  const [customTimerOpen, setCustomTimerOpen] = useState(false);
  
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
        backgroundColor: isRunning ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.2)',
        boxShadow: isRunning ? '0 0 25px rgba(255, 255, 255, 0.3)' : '0 0 0px rgba(255, 255, 255, 0)',
        duration: 0.4,
        ease: "power2.out"
      });
    }
  }, [isRunning]);
  
  // Handler for play/pause with animation
  const handlePlayPauseWithAnimation = () => {
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
    if (resetButtonRef.current) {
      // Rotate animation
      gsap.to(resetButtonRef.current, {
        rotation: "-=360",
        duration: 0.6,
        ease: "power1.out"
      });
    }
    onReset();
  };
  
  // Handler for settings with animation
  const handleSettingsWithAnimation = () => {
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
    if (plusButtonRef.current) {
      gsap.to(plusButtonRef.current, {
        scale: 0.9,
        duration: 0.1,
        ease: "power2.out",
        yoyo: true,
        repeat: 1
      });
    }
    setCustomTimerOpen(true);
  };

  return (
    <div ref={controlsContainerRef} className="fixed bottom-0 left-0 right-0 pb-8 pt-4">
      {/* Play/Pause Button (Center) */}
      <div className="flex justify-center mb-6">
        <button 
          ref={playPauseButtonRef}
          onClick={handlePlayPauseWithAnimation}
          className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-all duration-300"
          aria-label={isRunning ? "Pause" : "Play"}
        >
          {isRunning ? (
            <Pause className="w-12 h-12 text-white" />
          ) : (
            <Play className="w-12 h-12 text-white ml-2" />
          )}
        </button>
      </div>
      
      {/* Bottom Controls */}
      <div className="flex justify-between items-center px-8">
        {/* Reset Button (Left) */}
        <button 
          ref={resetButtonRef}
          onClick={handleResetWithAnimation}
          className="flex items-center justify-center p-3 rounded-full bg-red-500/20 hover:bg-red-500/40 transition-all"
          aria-label="Reset"
        >
          <RotateCcw className="w-6 h-6" />
        </button>
        
        {/* Plus Button (Center) */}
        <button
          ref={plusButtonRef}
          onClick={handlePlusWithAnimation}
          className="p-3 rounded-full bg-white/15 flex items-center justify-center hover:bg-white/25 transition-all"
          aria-label="Add Custom Timer"
        >
          <Plus className="w-6 h-6 text-white" />
        </button>
        
        {/* Settings Button (Right) */}
        <button 
          ref={settingsButtonRef}
          onClick={handleSettingsWithAnimation}
          className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all"
          aria-label="Settings"
        >
          <Settings className="w-6 h-6" />
        </button>
      </div>
      
      {/* Custom Timer Input Component */}
      <CustomTimerInput
        isOpen={customTimerOpen}
        onClose={() => setCustomTimerOpen(false)}
        onSetTimer={onSetTimer}
      />
    </div>
  );
};

export default TimerControls;
