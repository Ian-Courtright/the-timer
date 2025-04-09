import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import gsap from 'gsap';
import { TimeData } from '@/lib/types';
import { soundEffects } from '@/lib/sounds/soundEffects';

interface TimerProps {
  isRunning: boolean;
  onReset: number; // Used as a trigger for reset
  initialTime?: TimeData;
  onTimeUpdate?: (time: TimeData) => void;
  timerName?: string;
  onNameChange?: (name: string) => void;
  onOverageChange?: (isOverage: boolean) => void;
}

const Timer: React.FC<TimerProps> = ({ 
  isRunning, 
  onReset, 
  initialTime, 
  onTimeUpdate, 
  timerName = "", 
  onNameChange,
  onOverageChange 
}) => {
  const [time, setTime] = useState<TimeData>({ hours: 0, minutes: 0, seconds: 0 });
  const [hasCompleted, setHasCompleted] = useState(false);
  const [countingUp, setCountingUp] = useState(false);
  const [name, setName] = useState(timerName);
  const [isOverage, setIsOverage] = useState(false);
  
  // Refs for animation
  const timerRef = useRef<HTMLDivElement>(null);
  const hoursRef = useRef<HTMLSpanElement>(null);
  const minutesRef = useRef<HTMLSpanElement>(null);
  const secondsRef = useRef<HTMLSpanElement>(null);
  const countingUpRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const timeDisplayRef = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef(true);
  
  // Add a reference to track the last second we played a sound for
  const lastSoundSecondRef = useRef<number | null>(null);
  
  // Add a flag to track if this is a fresh start or reset
  const isFreshStartRef = useRef(true);
  
  // Handle initial time set
  useEffect(() => {
    if (initialTime) {
      setTime(initialTime);
      setHasCompleted(false);
      setCountingUp(false);
      setIsOverage(false);
    }
  }, [initialTime]);
  
  // Update name when timerName prop changes
  useEffect(() => {
    setName(timerName);
  }, [timerName]);
  
  // Update progress based on current time vs initial time
  useEffect(() => {
    // Report current time to parent component
    if (onTimeUpdate) {
      onTimeUpdate(time);
    }
  }, [time, onTimeUpdate]);

  // Report overage state to parent component
  useEffect(() => {
    if (onOverageChange) {
      onOverageChange(isOverage);
    }
    
    // Ensure count-up mode is properly distinguished from overage mode
    // If there was no initialTime with non-zero value, it should never be in overage mode
    if (isOverage && initialTime && initialTime.hours === 0 && initialTime.minutes === 0 && initialTime.seconds === 0) {
      // If this was a timer that started from 0, it should not be in overage mode
      setIsOverage(false);
    }
  }, [isOverage, onOverageChange, initialTime]);
  
  // Initial animation setup - only on first mount
  useEffect(() => {
    if (timerRef.current && isInitialMount.current) {
      gsap.from(timerRef.current, {
        opacity: 0,
        scale: 0.9,
        duration: 1.2,
        ease: "power3.out"
      });
      isInitialMount.current = false;
    }
  }, []);
  
  // Animation for timer changes - we only want to animate when seconds change, not on every render
  useEffect(() => {
    if (hoursRef.current && minutesRef.current && secondsRef.current) {
      // Only animate the specific digit that changed to avoid unnecessary animations
      const elements = [];
      
      if (hoursRef.current) elements.push(hoursRef.current);
      if (minutesRef.current) elements.push(minutesRef.current);
      if (secondsRef.current) elements.push(secondsRef.current);
      
      // Pulse animation on digit change
      gsap.fromTo(elements, 
        { scale: 1 },
        { 
          scale: 1.03, 
          duration: 0.2, 
          ease: "power2.out",
          yoyo: true,
          repeat: 1,
          overwrite: true
        }
      );
    }
  }, [time.seconds]); // Only trigger when seconds change
  
  // Animation for running state
  useEffect(() => {
    if (timerRef.current) {
      if (isRunning) {
        gsap.to(timerRef.current, { 
          color: "#ffffff", 
          textShadow: "none",
          duration: 0.5 
        });
      } else {
        gsap.to(timerRef.current, { 
          color: "#ffffff", 
          textShadow: "none",
          duration: 0.5 
        });
      }
    }
  }, [isRunning]);
  
  // Animation for counting up state
  useEffect(() => {
    if (countingUpRef.current) {
      if (countingUp) {
        gsap.fromTo(countingUpRef.current,
          { opacity: 0, y: 20 },
          { opacity: 0.8, y: 0, duration: 0.5, ease: "power2.out" }
        );
      } else {
        gsap.to(countingUpRef.current, { opacity: 0, duration: 0.3 });
      }
    }
  }, [countingUp]);

  // Overage animation (pulsing red)
  useEffect(() => {
    if (timeDisplayRef.current) {
      if (isOverage && countingUp) {
        // Create pulsing red text animation
        gsap.to(timeDisplayRef.current, {
          color: "#ff3333",
          textShadow: "0 0 8px rgba(255, 51, 51, 0.7)",
          duration: 1,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut"
        });
      } else {
        // Stop pulsing animation
        gsap.killTweensOf(timeDisplayRef.current);
        gsap.to(timeDisplayRef.current, {
          color: "#ffffff",
          textShadow: "none",
          duration: 0.5
        });
      }
    }

    return () => {
      if (timeDisplayRef.current) {
        gsap.killTweensOf(timeDisplayRef.current);
      }
    };
  }, [isOverage, countingUp]);
  
  // Add this effect specifically for handling countdown sounds
  useEffect(() => {
    // Only play sounds when timer is running and we're in countdown mode (not counting up)
    // AND only if we have hours, minutes, and seconds all defined properly
    if (isRunning && !countingUp && time.seconds !== undefined) {
      // Strict condition for countdown beep - ONLY for the last 10 seconds (10, 9, 8, 7, 6, 5, 4, 3, 2, 1)
      // Make sure we're in the last minute too - no hours, no other minutes
      if (time.hours === 0 && time.minutes === 0 && time.seconds <= 10 && time.seconds > 0) {
        // Only play if we haven't already played for this second
        if (lastSoundSecondRef.current !== time.seconds) {
          console.log(`Playing countdown beep for second: ${time.seconds}`);
          soundEffects.playCountdownBeep();
          lastSoundSecondRef.current = time.seconds;
        }
      }
      
      // Strict condition for finished beep - ONLY at exactly 0:00:00
      // AND only if this isn't the very first state (i.e., we didn't just press play from a fresh start at 0)
      if (time.hours === 0 && time.minutes === 0 && time.seconds === 0) {
        // Only play if:
        // 1. We haven't already played the sound for 0
        // 2. This isn't a fresh start or reset
        if (lastSoundSecondRef.current !== 0 && !isFreshStartRef.current) {
          console.log('Playing countdown finished beep at zero');
          soundEffects.playCountdownFinished();
          lastSoundSecondRef.current = 0;
        }
      }
    } else if (!isRunning || countingUp) {
      // Reset the last sound second when timer is not running or when in counting up mode
      // This ensures we don't have any leftover state
      lastSoundSecondRef.current = null;
    }
  }, [time.seconds, isRunning, countingUp, time.hours, time.minutes, initialTime]);
  
  // Handle timer counting
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isRunning) {
      // Check if we should start counting up immediately
      if (!countingUp && time.hours === 0 && time.minutes === 0 && time.seconds === 0) {
        setCountingUp(true);
        // Note: We're now playing the sound in the dedicated sound effect above
        // Only set overage if we initially had a countdown timer
        // Check initialTime to determine if this was a countdown timer or just a count-up timer
        if (initialTime && (initialTime.hours > 0 || initialTime.minutes > 0 || initialTime.seconds > 0)) {
          setIsOverage(true);
        }
      }
      
      interval = setInterval(() => {
        setTime(prevTime => {
          // Count down logic
          if (!countingUp) {
            // Note: We've moved the sound playing logic to a dedicated effect above
            
            // If timer reaches 0, switch to counting up
            if (prevTime.hours === 0 && prevTime.minutes === 0 && prevTime.seconds === 0) {
              // Show completion notification only once
              if (!hasCompleted) {
                // Note: We're now playing the sound in the dedicated effect above
                // Remove toast notification
                setHasCompleted(true);
                setCountingUp(true);
                // Set overage flag only if this was a countdown timer (initialTime > 0)
                if (initialTime && (initialTime.hours > 0 || initialTime.minutes > 0 || initialTime.seconds > 0)) {
                  setIsOverage(true);
                }
              }
              
              // Start counting up from 0
              return { hours: 0, minutes: 0, seconds: 1 };
            }
            
            let newSeconds = prevTime.seconds - 1;
            let newMinutes = prevTime.minutes;
            let newHours = prevTime.hours;
            
            if (newSeconds < 0) {
              newSeconds = 59;
              newMinutes -= 1;
            }
            
            if (newMinutes < 0) {
              newMinutes = 59;
              newHours -= 1;
            }
            
            return {
              hours: newHours,
              minutes: newMinutes,
              seconds: newSeconds
            };
          } 
          // Count up logic
          else {
            let newSeconds = prevTime.seconds + 1;
            let newMinutes = prevTime.minutes;
            let newHours = prevTime.hours;
            
            if (newSeconds > 59) {
              newSeconds = 0;
              newMinutes += 1;
            }
            
            if (newMinutes > 59) {
              newMinutes = 0;
              newHours += 1;
            }
            
            return {
              hours: newHours,
              minutes: newMinutes,
              seconds: newSeconds
            };
          }
        });
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, hasCompleted, countingUp, time.hours, time.minutes, time.seconds, initialTime]);
  
  // Handle reset - now reset will always set the time to 0:00:00 from the parent component
  useEffect(() => {
    // Rely on initialTime which will now be set to 0 from the parent on reset
    setTime(initialTime || { hours: 0, minutes: 0, seconds: 0 });
    setHasCompleted(false);
    setCountingUp(false);
    setIsOverage(false);
    
    // Animation for reset
    if (timerRef.current) {
      gsap.fromTo(timerRef.current,
        { scale: 0.95, opacity: 0.7 },
        { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(1.7)" }
      );
    }
    
    // Reset text color
    if (timeDisplayRef.current) {
      gsap.killTweensOf(timeDisplayRef.current);
      gsap.to(timeDisplayRef.current, {
        color: "#ffffff",
        textShadow: "none",
        duration: 0.3
      });
    }
  }, [onReset, initialTime]);
  
  // Track reset events
  useEffect(() => {
    // When reset happens, mark as a fresh start
    isFreshStartRef.current = true;
    
    // Also clear the last sound played
    lastSoundSecondRef.current = null;
  }, [onReset]);

  // Effect to handle running state changes
  useEffect(() => {
    if (isRunning) {
      // Clear fresh start flag after a short delay when timer starts running
      setTimeout(() => {
        isFreshStartRef.current = false;
      }, 100);
    } else {
      // When timer stops, check if it's at zero and mark as fresh start
      if (time.hours === 0 && time.minutes === 0 && time.seconds === 0) {
        isFreshStartRef.current = true;
      }
    }
  }, [isRunning, time.hours, time.minutes, time.seconds]);
  
  const formatTimeDigit = (digit: number): string => {
    return digit.toString().padStart(2, '0');
  };
  
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    if (onNameChange) {
      onNameChange(newName);
    }
  };
  
  const handleNameFocus = () => {
    if (nameInputRef.current) {
      gsap.to(nameInputRef.current, {
        opacity: 0.9,
        duration: 0.3
      });
    }
  };
  
  const handleNameBlur = () => {
    if (nameInputRef.current) {
      gsap.to(nameInputRef.current, {
        opacity: 0.5,
        duration: 0.3
      });
    }
  };
  
  return (
    <div ref={timerRef} className="timer-display text-center w-full px-4">
      <div>
        <input
          ref={nameInputRef}
          type="text"
          value={name}
          onChange={handleNameChange}
          onFocus={handleNameFocus}
          onBlur={handleNameBlur}
          placeholder="Name your timer..."
          className="bg-transparent border-none text-center text-white text-lg opacity-50 hover:opacity-80 focus:opacity-90 transition-opacity outline-none w-full max-w-xs mx-auto"
          aria-label="Timer name"
        />
      </div>
      
      {/* Unified layout for all screen sizes */}
      <h1 
        ref={timeDisplayRef}
        className={`font-black tracking-tighter leading-none w-full ${isOverage && countingUp ? 'text-red-500' : 'text-white'}`}
      >
        <div className="flex flex-row items-center justify-center text-[15vw] leading-[0.9] w-full">
          {isOverage && countingUp && <span className="mr-2">-</span>}
          <span ref={hoursRef} className="inline-block">{formatTimeDigit(time.hours)}</span>
          <span className="inline-block">:</span>
          <span ref={minutesRef} className="inline-block">{formatTimeDigit(time.minutes)}</span>
          <span className="inline-block">:</span>
          <span ref={secondsRef} className="inline-block">{formatTimeDigit(time.seconds)}</span>
        </div>
      </h1>
      
      <div ref={countingUpRef} className={`text-xl mt-4 opacity-0 font-bold ${isOverage ? 'text-red-500' : 'text-green-400'}`}>
        {countingUp && (isOverage ? "Over Time" : "Counting Up")}
      </div>
    </div>
  );
};

export default Timer;
