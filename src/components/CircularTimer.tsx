import React, { useRef, useEffect, useMemo } from 'react';
import gsap from 'gsap';

interface CircularTimerProps {
  isRunning: boolean;
  progress: number; // 0-100 percentage
  isCountingUp?: boolean; // Add prop to directly control count up state
}

const CircularTimer: React.FC<CircularTimerProps> = ({ 
  isRunning, 
  progress,
  isCountingUp = false
}) => {
  // Refs for animation
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const pieRef = useRef<HTMLDivElement>(null);
  const countUpPulseRef = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef(true);
  const runningAnimationActive = useRef(false);
  const lastProgress = useRef(progress);
  
  // Initial animation - only run once on mount
  useEffect(() => {
    if (containerRef.current && isInitialMount.current) {
      gsap.from(containerRef.current, {
        rotation: -90,
        opacity: 0,
        duration: 1,
        ease: "elastic.out(1, 0.5)",
        delay: 0.3
      });
      isInitialMount.current = false;
    }
  }, []);
  
  // Smoothly animate the progress change
  useEffect(() => {
    if (pieRef.current && isRunning) {
      // Calculate the target degrees
      const targetDegrees = 360 * ((100 - progress) / 100);
      
      // Smoothly animate to the new degrees
      gsap.to(pieRef.current, {
        backgroundImage: `conic-gradient(transparent 0deg, transparent ${targetDegrees}deg, #ffffff ${targetDegrees}deg, #ffffff 360deg)`,
        duration: 0.5, // Smooth transition duration
        ease: "linear"
      });
    } else if (pieRef.current) {
      // Update without animation when not running
      const targetDegrees = 360 * ((100 - progress) / 100);
      pieRef.current.style.backgroundImage = `conic-gradient(transparent 0deg, transparent ${targetDegrees}deg, #ffffff ${targetDegrees}deg, #ffffff 360deg)`;
    }
    
    lastProgress.current = progress;
  }, [progress, isRunning]);
  
  // Animation for running state - prevent setup of duplicate animations
  useEffect(() => {
    if (containerRef.current) {
      if (isRunning && !runningAnimationActive.current) {
        // Animate container when timer starts
        gsap.to(containerRef.current, {
          scale: 1.05,
          duration: 0.3,
          ease: "back.out(1.7)",
          yoyo: true,
          repeat: 1
        });
        
        runningAnimationActive.current = true;
      } else if (!isRunning && runningAnimationActive.current) {
        runningAnimationActive.current = false;
      }
    }
  }, [isRunning, isCountingUp]);
  
  // Special animation for counting up state
  useEffect(() => {
    if (countUpPulseRef.current) {
      if (isCountingUp && isRunning) {
        // Create pulsing red animation for count-up mode
        // Duration of 1 second with yoyo creates a full 2-second cycle to sync with timer
        gsap.to(countUpPulseRef.current, {
          opacity: 0.8, // Increased opacity for more vivid pulsing
          scale: 1.08, // Slightly more expansion
          duration: 1,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut"
        });
        
        // Hide regular pie progress
        if (progressRef.current) {
          gsap.to(progressRef.current, {
            opacity: 0,
            duration: 0.3
          });
        }
      } else {
        // Stop pulsing animation
        gsap.killTweensOf(countUpPulseRef.current);
        gsap.to(countUpPulseRef.current, {
          opacity: 0,
          scale: 1,
          duration: 0.3
        });
        
        // Show regular pie progress
        if (progressRef.current) {
          gsap.to(progressRef.current, {
            opacity: 1,
            duration: 0.3
          });
        }
      }
    }
    
    return () => {
      if (countUpPulseRef.current) {
        gsap.killTweensOf(countUpPulseRef.current);
      }
    };
  }, [isCountingUp, isRunning]);

  return (
    <div ref={containerRef} className="relative w-28 h-28">
      {/* Base circle - now fully transparent */}
      <div className="absolute inset-0 rounded-full flex items-center justify-center">
        {/* Border ring - transparent background with only border */}
        <div className="w-[calc(100%-4px)] h-[calc(100%-4px)] rounded-full flex items-center justify-center border border-[#2A2A2A]"></div>
      </div>

      {/* Pie chart progress - only shown when not counting up */}
      <div 
        ref={progressRef}
        className="absolute inset-0 rounded-full overflow-hidden"
        style={{ opacity: isCountingUp ? 0 : 1 }}
      >
        {/* Conic gradient creates the pie chart effect - flipped to show remaining time */}
        <div 
          ref={pieRef}
          className="w-full h-full rounded-full" 
          style={{ backgroundImage: `conic-gradient(transparent 0deg, transparent ${360 * ((100 - progress) / 100)}deg, #ffffff ${360 * ((100 - progress) / 100)}deg, #ffffff 360deg)` }}
        ></div>
      </div>

      {/* Red pulsing circle for count-up mode */}
      <div 
        ref={countUpPulseRef}
        className="absolute inset-0 rounded-full bg-red-600 opacity-0"
      ></div>
    </div>
  );
};

// Use React.memo to prevent unnecessary re-renders when parent component re-renders
export default React.memo(CircularTimer);
