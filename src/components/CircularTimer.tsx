import React, { useRef, useEffect, useState } from 'react';
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
  const idleStateRef = useRef<HTMLDivElement>(null);
  const zeroStateRef = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef(true);
  const lastProgress = useRef(progress);
  const pieAnimationRef = useRef<gsap.core.Tween | null>(null);
  const isTransitioningToZero = useRef(false);
  const showZeroState = useRef(false);
  
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
          backgroundImage: `conic-gradient(#ffffff 0deg, #ffffff 360deg, #ffffff 360deg, #ffffff 360deg)` 
        },
        {
          backgroundImage: `conic-gradient(#ffffff 0deg, #ffffff ${360 * (progress / 100)}deg, transparent ${360 * (progress / 100)}deg, transparent 360deg)`,
          duration: 0.6,
          ease: "power2.out"
        }
      );
      
      // Also animate the container for emphasis
      gsap.fromTo(containerRef.current,
        { scale: 0.95 },
        { scale: 1, duration: 0.4, ease: "back.out(1.7)" }
      );

      // Hide idle state when we have a timer
      if (idleStateRef.current) {
        gsap.to(idleStateRef.current, {
          opacity: 0,
          duration: 0.3
        });
      }
      
      // Hide zero state if it's visible
      if (zeroStateRef.current) {
        gsap.killTweensOf(zeroStateRef.current);
        gsap.to(zeroStateRef.current, {
          opacity: 0,
          scale: 1,
          duration: 0.3
        });
        showZeroState.current = false;
      }
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
        backgroundImage: `conic-gradient(#ffffff 0deg, #ffffff ${360 * (progress / 100)}deg, transparent ${360 * (progress / 100)}deg, transparent 360deg)`
      });
      
      // Hide idle state
      if (idleStateRef.current) {
        gsap.to(idleStateRef.current, {
          opacity: 0,
          duration: 0.3
        });
      }
      
      // Hide zero state if it's visible
      if (zeroStateRef.current) {
        gsap.killTweensOf(zeroStateRef.current);
        gsap.to(zeroStateRef.current, {
          opacity: 0,
          scale: 1,
          duration: 0.3
        });
        showZeroState.current = false;
      }
    }
    
    // Show idle state when no timer is set
    if (progress === 0 && !isRunning && !isCountingUp && !isOverage) {
      if (idleStateRef.current) {
        gsap.to(idleStateRef.current, {
          opacity: 1,
          duration: 0.3
        });
      }
      
      // Hide zero state if we're in idle
      if (zeroStateRef.current) {
        gsap.killTweensOf(zeroStateRef.current);
        gsap.to(zeroStateRef.current, {
          opacity: 0,
          scale: 1,
          duration: 0.3
        });
        showZeroState.current = false;
      }
    }
    
    // Handle the transition to zero specifically for countdown timer
    if (progress === 0 && isRunning && !isOverage && !isCountingUp && prevProgress > 0) {
      // This is the key transition - countdown reached zero but not yet in overage
      isTransitioningToZero.current = true;
      showZeroState.current = true;
      
      // Show the zero state with animation
      if (zeroStateRef.current && progressRef.current) {
        // Make sure no other states are visible
        // Hide the pie chart
        gsap.to(progressRef.current, {
          opacity: 0,
          duration: 0.3
        });
        
        // Make sure count-up is hidden
        if (countUpPulseRef.current) {
          gsap.killTweensOf(countUpPulseRef.current);
          gsap.to(countUpPulseRef.current, {
            opacity: 0,
            scale: 1,
            duration: 0.3
          });
        }
        
        // Make sure overage is hidden
        if (overagePulseRef.current) {
          gsap.killTweensOf(overagePulseRef.current);
          gsap.to(overagePulseRef.current, {
            opacity: 0,
            scale: 1,
            duration: 0.3
          });
        }
        
        // Then show and animate the zero state
        gsap.fromTo(zeroStateRef.current, 
          { opacity: 0, scale: 0.5 },
          { 
            opacity: 1, 
            scale: 1.1,
            duration: 0.5,
            ease: "back.out(1.7)",
            onComplete: () => {
              // Only start pulse if we should still show zero state
              if (showZeroState.current) {
                // Pulse animation for zero state
                gsap.to(zeroStateRef.current, {
                  scale: 1.05,
                  opacity: 0.9,
                  duration: 0.8,
                  repeat: -1,
                  yoyo: true,
                  ease: "sine.inOut"
                });
              }
            }
          }
        );
      }
    }
    
    setPrevProgress(progress);
  }, [progress, isCountingUp, isOverage, prevProgress, isRunning, prevIsRunning]);
  
  // Handle transitions when timer starts/stops
  useEffect(() => {
    // Detect when timer starts running
    const isStarting = isRunning && !prevIsRunning;
    // Detect when timer stops running
    const isStopping = !isRunning && prevIsRunning;
    
    if (isStarting && pieRef.current && !isCountingUp && !isOverage && progress > 0) {
      // Starting a countdown timer
      // Set up a continuous animation that will run for the expected duration
      if (pieAnimationRef.current) {
        pieAnimationRef.current.kill();
        pieAnimationRef.current = null;
      }
      
      const startAngle = 360 * (progress / 100);
      // Calculate remaining time percentage for a more accurate duration
      const remainingPercentage = progress / 100;
      const expectedDuration = remainingPercentage * (progress >= 5 ? 60 : 10); // Scale based on percentage
      
      pieAnimationRef.current = gsap.fromTo(pieRef.current,
        { 
          backgroundImage: `conic-gradient(#ffffff 0deg, #ffffff ${startAngle}deg, transparent ${startAngle}deg, transparent 360deg)` 
        },
        {
          backgroundImage: `conic-gradient(#ffffff 0deg, #ffffff 0deg, transparent 0deg, transparent 360deg)`,
          duration: expectedDuration,
          ease: "linear",
          onComplete: () => {
            // Ensure clean state after animation completes
            if (pieRef.current) {
              gsap.set(pieRef.current, {
                backgroundImage: `conic-gradient(#ffffff 0deg, #ffffff 0deg, transparent 0deg, transparent 360deg)`
              });
            }
          }
        }
      );
    }

    if (isStopping) {
      // Kill any running animations when timer stops
      if (pieAnimationRef.current) {
        pieAnimationRef.current.kill();
        pieAnimationRef.current = null;
      }
      
      // Stop all pulsing animations
      if (zeroStateRef.current) {
        gsap.killTweensOf(zeroStateRef.current);
      }
      
      if (countUpPulseRef.current) {
        gsap.killTweensOf(countUpPulseRef.current);
      }
      
      if (overagePulseRef.current) {
        gsap.killTweensOf(overagePulseRef.current);
      }
      
      // Reset state flags
      isTransitioningToZero.current = false;
      showZeroState.current = false;
    }

    // Update previous state
    setPrevIsRunning(isRunning);

    // Cleanup on unmount or when dependencies change
    return () => {
      if (pieAnimationRef.current) {
        pieAnimationRef.current.kill();
        pieAnimationRef.current = null;
      }
    };
  }, [isRunning, prevIsRunning, isCountingUp, isOverage, progress]);
  
  // Smoothly update progress while running
  useEffect(() => {
    // Only update progress if timer is running, not in overage, and not counting up
    if (isRunning && !isCountingUp && !isOverage && pieRef.current && progress > 0) {
      // Only restart animation if the progress has changed significantly
      if (Math.abs(progress - lastProgress.current) > 2) {
        // Kill existing animation if there is one
        if (pieAnimationRef.current) {
          pieAnimationRef.current.kill();
          pieAnimationRef.current = null;
        }
        
        // Save current progress for next comparison
        lastProgress.current = progress;
        
        const currentAngle = 360 * (progress / 100);
        
        // Calculate the remaining time based on progress
        const remainingPercentage = progress / 100;
        const expectedDuration = remainingPercentage * (progress >= 5 ? 60 : 10);
        
        // Create a new animation from the current state to empty
        pieAnimationRef.current = gsap.fromTo(pieRef.current,
          { 
            backgroundImage: `conic-gradient(#ffffff 0deg, #ffffff ${currentAngle}deg, transparent ${currentAngle}deg, transparent 360deg)` 
          },
          {
            backgroundImage: `conic-gradient(#ffffff 0deg, #ffffff 0deg, transparent 0deg, transparent 360deg)`,
            duration: expectedDuration,
            ease: "linear",
            onComplete: () => {
              // Ensure clean state after animation completes
              if (pieRef.current) {
                gsap.set(pieRef.current, {
                  backgroundImage: `conic-gradient(#ffffff 0deg, #ffffff 0deg, transparent 0deg, transparent 360deg)`
                });
              }
            }
          }
        );
      }
    }

    return () => {
      if (pieAnimationRef.current) {
        pieAnimationRef.current.kill();
        pieAnimationRef.current = null;
      }
    };
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
      
      // Hide zero state when transitioning to overage or count-up
      if (zeroStateRef.current) {
        gsap.killTweensOf(zeroStateRef.current);
        gsap.to(zeroStateRef.current, {
          opacity: 0,
          scale: 1,
          duration: 0.3
        });
        showZeroState.current = false;
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
      
      // This is the key condition - show count-up visual whenever isCountingUp flag is true
      // and the timer is running and not in overage
      if (isCountingUp && isRunning && !isOverage) {
        // First make sure other states are hidden
        // Hide zero state if it's showing
        if (zeroStateRef.current) {
          gsap.killTweensOf(zeroStateRef.current);
          gsap.to(zeroStateRef.current, {
            opacity: 0,
            scale: 1,
            duration: 0.3
          });
          showZeroState.current = false;
        }
        
        // Hide pie chart
        if (progressRef.current) {
          gsap.to(progressRef.current, {
            opacity: 0,
            duration: 0.3
          });
        }
        
        // If transitioning to count-up, use a special animation
        if (isTransitioningToCountUp) {
          // First fade in with emphasis
          gsap.fromTo(countUpPulseRef.current,
            { opacity: 0, scale: 0.5 },
            { 
              opacity: 1, 
              scale: 1.08,
              duration: 0.4, 
              ease: "back.out(1.7)",
              onComplete: () => {
                // Then start the pulsing animation
                gsap.to(countUpPulseRef.current, {
                  opacity: 0.85,
                  scale: 1.05,
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
            opacity: 0.85,
            scale: 1.05,
            duration: 1,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
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
          // Hide zero state first if it's showing
          if (zeroStateRef.current) {
            gsap.killTweensOf(zeroStateRef.current);
            gsap.to(zeroStateRef.current, {
              opacity: 0,
              scale: 1,
              duration: 0.3
            });
            showZeroState.current = false;
          }
          
          // Hide count-up state as well
          if (countUpPulseRef.current) {
            gsap.killTweensOf(countUpPulseRef.current);
            gsap.to(countUpPulseRef.current, {
              opacity: 0,
              scale: 1,
              duration: 0.3
            });
          }
          
          // First fade in with emphasis
          gsap.fromTo(overagePulseRef.current,
            { opacity: 0, scale: 0.5 },
            { 
              opacity: 1, 
              scale: 1.08,
              duration: 0.4, 
              ease: "back.out(1.7)",
              onComplete: () => {
                // Then start the pulsing animation - synced with timer (1 second duration)
                gsap.to(overagePulseRef.current, {
                  opacity: 0.9,
                  scale: 1.08,
                  duration: 1,
                  repeat: -1,
                  yoyo: true,
                  ease: "sine.inOut"
                });
              }
            }
          );
        } else {
          // Regular pulsing animation for overage mode
          gsap.to(overagePulseRef.current, {
            opacity: 0.9,
            scale: 1.08,
            duration: 1,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
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

  return (
    <div ref={containerRef} className="relative w-28 h-28">
      {/* Base circle with slight shadow for depth */}
      <div 
        ref={baseCircleRef}
        className="absolute inset-0 rounded-full flex items-center justify-center"
      >
        {/* Background shape - subtle shadow for depth */}
        <div className="w-full h-full rounded-full bg-[#1A1A1A] shadow-inner"></div>
      </div>

      {/* Idle state - filled white circle */}
      <div 
        ref={idleStateRef}
        className="absolute inset-0 rounded-full bg-white opacity-1 transition-opacity duration-300"
        style={{ opacity: !isRunning && progress === 0 && !isCountingUp && !isOverage ? 1 : 0 }}
      ></div>
      
      {/* Zero state - briefly shown when countdown reaches exactly zero */}
      <div 
        ref={zeroStateRef}
        className="absolute inset-0 rounded-full bg-white opacity-0"
      ></div>

      {/* Pie chart progress - only shown when not counting up and not at zero */}
      <div 
        ref={progressRef}
        className="absolute inset-0 rounded-full overflow-hidden transition-opacity duration-300"
        style={{ opacity: isCountingUp || isOverage || (progress === 0 && isRunning) ? 0 : 1 }}
      >
        {/* Conic gradient creates the pie chart effect - now showing filled time left */}
        <div 
          ref={pieRef}
          className="w-full h-full rounded-full" 
          style={{ backgroundImage: `conic-gradient(#ffffff 0deg, #ffffff ${360 * (progress / 100)}deg, transparent ${360 * (progress / 100)}deg, transparent 360deg)` }}
        ></div>
      </div>

      {/* Green pulsing circle for count-up mode */}
      <div 
        ref={countUpPulseRef}
        className="absolute inset-0 rounded-full bg-green-500 opacity-0"
      ></div>
      
      {/* Red pulsing circle for overage mode */}
      <div 
        ref={overagePulseRef}
        className="absolute inset-0 rounded-full bg-red-500 opacity-0"
      ></div>
    </div>
  );
};

// Use React.memo to prevent unnecessary re-renders when parent component re-renders
export default React.memo(CircularTimer);
