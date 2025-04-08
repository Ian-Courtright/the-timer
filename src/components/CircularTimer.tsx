import React, { useRef, useEffect, useMemo, useState } from 'react';
import gsap from 'gsap';

interface CircularTimerProps {
  isRunning: boolean;
  progress: number; // 0-100 percentage
  isCountingUp?: boolean; // Add prop to directly control count up state
  isOverage?: boolean;
}

const CircularTimer: React.FC<CircularTimerProps> = ({ 
  isRunning, 
  progress,
  isCountingUp = false,
  isOverage = false
}) => {
  // Track previous states for animations
  const [prevProgress, setPrevProgress] = useState(progress);
  const [prevIsCountingUp, setPrevIsCountingUp] = useState(isCountingUp);
  const [prevIsOverage, setPrevIsOverage] = useState(isOverage);
  const [prevIsRunning, setPrevIsRunning] = useState(isRunning);
  
  // Refs for animation
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const pieRef = useRef<HTMLDivElement>(null);
  const countUpPulseRef = useRef<HTMLDivElement>(null);
  const overagePulseRef = useRef<HTMLDivElement>(null);
  const baseCircleRef = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef(true);
  const runningAnimationActive = useRef(false);
  const lastProgress = useRef(progress);
  const pieAnimationRef = useRef<gsap.core.Tween | null>(null);
  
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
  
  // Handle smooth animation when progress changes (initial timer set)
  useEffect(() => {
    // Only run when progress changes significantly and we're not in count-up or overage mode
    if (
      pieRef.current && 
      Math.abs(progress - prevProgress) > 2 && 
      progress > 0 && 
      !isCountingUp && 
      !isOverage &&
      !isRunning && 
      !prevIsRunning // Only play loading animation when timer wasn't already running
    ) {
      // Kill any existing animations
      if (pieAnimationRef.current) {
        pieAnimationRef.current.kill();
        pieAnimationRef.current = null;
      }

      // Animate in the pie chart with a reveal effect
      pieAnimationRef.current = gsap.fromTo(pieRef.current,
        { 
          backgroundImage: `conic-gradient(transparent 0deg, transparent 360deg, #ffffff 360deg, #ffffff 360deg)` 
        },
        {
          backgroundImage: `conic-gradient(transparent 0deg, transparent ${360 * ((100 - progress) / 100)}deg, #ffffff ${360 * ((100 - progress) / 100)}deg, #ffffff 360deg)`,
          duration: 0.6,
          ease: "power2.out"
        }
      );
      
      // Also animate the container for emphasis
      gsap.fromTo(containerRef.current,
        { scale: 0.95 },
        { scale: 1, duration: 0.4, ease: "back.out(1.7)" }
      );
    } else if (
      pieRef.current && 
      Math.abs(progress - prevProgress) > 2 && 
      progress > 0 && 
      !isCountingUp && 
      !isOverage &&
      (isRunning || prevIsRunning) // When adding time to a running timer
    ) {
      // Just set the new progress instantly without loading animation
      gsap.set(pieRef.current, {
        backgroundImage: `conic-gradient(transparent 0deg, transparent ${360 * ((100 - progress) / 100)}deg, #ffffff ${360 * ((100 - progress) / 100)}deg, #ffffff 360deg)`
      });
    }
    
    setPrevProgress(progress);
  }, [progress, isCountingUp, isOverage, prevProgress, isRunning, prevIsRunning]);
  
  // Handle transitions when timer starts/stops
  useEffect(() => {
    // Detect when timer starts running
    const isStarting = isRunning && !prevIsRunning;
    // Detect when timer stops running
    const isStopping = !isRunning && prevIsRunning;
    
    if (isStarting && pieRef.current && !isCountingUp && !isOverage) {
      // Starting a countdown timer
      // Set up a continuous animation that will run for the expected duration
      if (pieAnimationRef.current) {
        pieAnimationRef.current.kill();
      }
      
      const startDegrees = 360 * ((100 - progress) / 100);
      // Calculate remaining time percentage for a more accurate duration
      const remainingPercentage = progress / 100;
      const expectedDuration = remainingPercentage * (progress >= 5 ? 60 : 10); // Scale based on percentage
      
      pieAnimationRef.current = gsap.fromTo(pieRef.current,
        { 
          backgroundImage: `conic-gradient(transparent 0deg, transparent ${startDegrees}deg, #ffffff ${startDegrees}deg, #ffffff 360deg)` 
        },
        {
          backgroundImage: `conic-gradient(transparent 0deg, transparent 0deg, #ffffff 0deg, #ffffff 360deg)`,
          duration: expectedDuration,
          ease: "linear"
        }
      );
    } else if (isStopping && pieRef.current) {
      // Timer stopped - pause any running animation
      if (pieAnimationRef.current) {
        pieAnimationRef.current.pause();
      }
    } else if (isRunning && prevIsRunning && pieRef.current && pieAnimationRef.current && pieAnimationRef.current.paused()) {
      // Already running - ensure animation is also running
      pieAnimationRef.current.resume();
    }
    
    // Update container animation (bounce effect when starting)
    if (containerRef.current && isStarting) {
      gsap.to(containerRef.current, {
        scale: 1.05,
        duration: 0.3,
        ease: "back.out(1.7)",
        yoyo: true,
        repeat: 1
      });
    }
    
    setPrevIsRunning(isRunning);
  }, [isRunning, prevIsRunning, progress, isCountingUp, isOverage]);
  
  // Smoothly update progress while running
  useEffect(() => {
    // Only update progress if timer is running, not in overage, and not counting up
    if (isRunning && !isCountingUp && !isOverage && pieRef.current) {
      // Only restart animation if the progress has changed significantly
      if (Math.abs(progress - lastProgress.current) > 2) {
        // Kill existing animation if there is one
        if (pieAnimationRef.current) {
          pieAnimationRef.current.kill();
        }
        
        // Save current progress for next comparison
        lastProgress.current = progress;
        
        const currentDegrees = 360 * ((100 - progress) / 100);
        
        // Calculate the remaining time based on progress
        const remainingPercentage = progress / 100;
        const expectedDuration = remainingPercentage * (progress >= 5 ? 60 : 10);
        
        // Create a new animation from the current state to empty
        pieAnimationRef.current = gsap.fromTo(pieRef.current,
          { 
            backgroundImage: `conic-gradient(transparent 0deg, transparent ${currentDegrees}deg, #ffffff ${currentDegrees}deg, #ffffff 360deg)` 
          },
          {
            backgroundImage: `conic-gradient(transparent 0deg, transparent 0deg, #ffffff 0deg, #ffffff 360deg)`,
            duration: expectedDuration,
            ease: "linear"
          }
        );
      }
    }
  }, [progress, isRunning, isCountingUp, isOverage]);
  
  // Update animation when state changes (count up/overage transitions)
  useEffect(() => {
    // Transition from countdown to count-up or overage
    if ((isCountingUp && !prevIsCountingUp) || (isOverage && !prevIsOverage)) {
      // Cancel any existing pie chart animation
      if (pieAnimationRef.current) {
        pieAnimationRef.current.kill();
        pieAnimationRef.current = null;
      }
      
      // Hide the pie chart with animation
      if (progressRef.current) {
        gsap.to(progressRef.current, {
          opacity: 0,
          duration: 0.3
        });
      }
    }
    
    // Transition back to countdown mode
    if (!isCountingUp && prevIsCountingUp && !isOverage) {
      // Show the pie chart again
      if (progressRef.current) {
        gsap.to(progressRef.current, {
          opacity: 1,
          duration: 0.3
        });
      }
    }
  }, [isCountingUp, prevIsCountingUp, isOverage, prevIsOverage]);
  
  // Special animation for counting up state
  useEffect(() => {
    if (countUpPulseRef.current) {
      // Detect transition to counting up mode
      const isTransitioningToCountUp = isCountingUp && !prevIsCountingUp;
      
      if (isCountingUp && isRunning && !isOverage) {
        // If transitioning to count-up, use a special animation
        if (isTransitioningToCountUp) {
          // First fade in with emphasis
          gsap.fromTo(countUpPulseRef.current,
            { opacity: 0, scale: 0.5 },
            { 
              opacity: 0.8, 
              scale: 1.08,
              duration: 0.4, 
              ease: "back.out(1.7)",
              onComplete: () => {
                // Then start the pulsing animation
                gsap.to(countUpPulseRef.current, {
                  opacity: 0.8, // Increased opacity for more vivid pulsing
                  scale: 1.08, // Slightly more expansion
                  duration: 1,
                  repeat: -1,
                  yoyo: true,
                  ease: "sine.inOut"
                });
              }
            }
          );
        } else {
          // Regular pulsing animation for count-up mode
          gsap.to(countUpPulseRef.current, {
            opacity: 0.8, // Increased opacity for more vivid pulsing
            scale: 1.08, // Slightly more expansion
            duration: 1,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
          });
        }
        
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
        
        // Show regular pie progress if not in overage mode
        if (progressRef.current && !isOverage) {
          gsap.to(progressRef.current, {
            opacity: 1,
            duration: 0.3
          });
        }
      }
    }
    
    // Update previous state
    setPrevIsCountingUp(isCountingUp);
    
    return () => {
      if (countUpPulseRef.current) {
        gsap.killTweensOf(countUpPulseRef.current);
      }
    };
  }, [isCountingUp, isRunning, isOverage, prevIsCountingUp]);
  
  // Special animation for overage state
  useEffect(() => {
    if (overagePulseRef.current) {
      // Detect transition to overage mode
      const isTransitioningToOverage = isOverage && !prevIsOverage && isRunning;
      
      if (isOverage && isRunning) {
        // If transitioning to overage, use a special animation
        if (isTransitioningToOverage) {
          // First fade in with emphasis
          gsap.fromTo(overagePulseRef.current,
            { opacity: 0, scale: 0.5 },
            { 
              opacity: 0.9, 
              scale: 1.12,
              duration: 0.4, 
              ease: "back.out(1.7)",
              onComplete: () => {
                // Then start the pulsing animation - synced with timer (1 second duration)
                gsap.to(overagePulseRef.current, {
                  opacity: 0.9, // Higher opacity for more vivid red
                  scale: 1.12, // Increase expansion for more noticeable pulse
                  duration: 1, // Match the timer's 1-second pulse
                  repeat: -1,
                  yoyo: true,
                  ease: "sine.inOut"
                });
              }
            }
          );
        } else {
          // Regular pulsing animation for overage mode - synced with timer (1 second duration)
          gsap.to(overagePulseRef.current, {
            opacity: 0.9, // Higher opacity for more vivid red
            scale: 1.12, // Increase expansion for more noticeable pulse
            duration: 1, // Match the timer's 1-second pulse
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
          });
        }
        
        // Hide regular pie progress and green pulse
        if (progressRef.current) {
          gsap.to(progressRef.current, {
            opacity: 0,
            duration: 0.3
          });
        }
        
        // Ensure green count-up pulse is hidden
        if (countUpPulseRef.current) {
          gsap.killTweensOf(countUpPulseRef.current);
          gsap.to(countUpPulseRef.current, {
            opacity: 0,
            scale: 1,
            duration: 0.3
          });
        }
      } else {
        // Stop pulsing animation
        gsap.killTweensOf(overagePulseRef.current);
        gsap.to(overagePulseRef.current, {
          opacity: 0,
          scale: 1,
          duration: 0.3
        });
      }
    }
    
    // Update previous state
    setPrevIsOverage(isOverage);
    
    return () => {
      if (overagePulseRef.current) {
        gsap.killTweensOf(overagePulseRef.current);
      }
    };
  }, [isOverage, isRunning, prevIsOverage]);

  // Clean up animations when component unmounts
  useEffect(() => {
    return () => {
      if (pieAnimationRef.current) {
        pieAnimationRef.current.kill();
      }
    };
  }, []);

  return (
    <div ref={containerRef} className="relative w-28 h-28">
      {/* Base circle - now with a subtle border */}
      <div 
        ref={baseCircleRef}
        className="absolute inset-0 rounded-full flex items-center justify-center"
      >
        {/* Border ring - transparent background with only border */}
        <div className="w-[calc(100%-4px)] h-[calc(100%-4px)] rounded-full flex items-center justify-center border border-[#2A2A2A]"></div>
      </div>

      {/* Pie chart progress - only shown when not counting up */}
      <div 
        ref={progressRef}
        className="absolute inset-0 rounded-full overflow-hidden transition-opacity duration-300"
        style={{ opacity: isCountingUp || isOverage ? 0 : 1 }}
      >
        {/* Conic gradient creates the pie chart effect - flipped to show remaining time */}
        <div 
          ref={pieRef}
          className="w-full h-full rounded-full" 
          style={{ backgroundImage: `conic-gradient(transparent 0deg, transparent ${360 * ((100 - progress) / 100)}deg, #ffffff ${360 * ((100 - progress) / 100)}deg, #ffffff 360deg)` }}
        ></div>
      </div>

      {/* Green pulsing circle for count-up mode */}
      <div 
        ref={countUpPulseRef}
        className="absolute inset-0 rounded-full bg-green-600 opacity-0"
      ></div>
      
      {/* Red pulsing circle for overage mode */}
      <div 
        ref={overagePulseRef}
        className="absolute inset-0 rounded-full bg-red-600 opacity-0"
      ></div>
    </div>
  );
};

// Use React.memo to prevent unnecessary re-renders when parent component re-renders
export default React.memo(CircularTimer);
