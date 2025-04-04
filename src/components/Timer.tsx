import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import gsap from 'gsap';

interface TimerProps {
  isRunning: boolean;
  onReset: number; // Used as a trigger for reset
  initialTime?: { hours: number, minutes: number, seconds: number };
  onTimeUpdate?: (time: { hours: number, minutes: number, seconds: number }) => void;
  timerName?: string;
  onTimerNameChange?: (name: string) => void;
}

const Timer: React.FC<TimerProps> = ({ 
  isRunning, 
  onReset, 
  initialTime, 
  onTimeUpdate,
  timerName = '',
  onTimerNameChange = () => {}
}) => {
  const [time, setTime] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [hasCompleted, setHasCompleted] = useState(false);
  const [countingUp, setCountingUp] = useState(false);
  const [isOverTime, setIsOverTime] = useState(false);
  const [name, setName] = useState(timerName);
  
  // Refs for animation
  const timerRef = useRef<HTMLDivElement>(null);
  const hoursRef = useRef<HTMLSpanElement>(null);
  const minutesRef = useRef<HTMLSpanElement>(null);
  const secondsRef = useRef<HTMLSpanElement>(null);
  const countingUpRef = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef(true);
  const overtimeRef = useRef<HTMLDivElement>(null);
  
  // Handle initial time set
  useEffect(() => {
    if (initialTime) {
      setTime(initialTime);
      setHasCompleted(false);
      setCountingUp(false);
      setIsOverTime(false);
    }
  }, [initialTime]);
  
  // Handle timer name updates
  useEffect(() => {
    setName(timerName);
  }, [timerName]);
  
  // Report current time to parent component
  useEffect(() => {
    if (onTimeUpdate) {
      onTimeUpdate(time);
    }
  }, [time, onTimeUpdate]);
  
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
          color: isOverTime ? "#ff3333" : "#ffffff", 
          textShadow: "none",
          duration: 0.5 
        });
      } else {
        gsap.to(timerRef.current, { 
          color: isOverTime ? "#ff3333" : "#ffffff", 
          textShadow: "none",
          duration: 0.5 
        });
      }
    }
  }, [isRunning, isOverTime]);
  
  // Animation for overtime state
  useEffect(() => {
    if (timerRef.current && overtimeRef.current) {
      if (isOverTime) {
        // Set timer text to red
        gsap.to(timerRef.current, {
          color: "#ff3333",
          duration: 0.3
        });
        
        // Create pulsing effect for overtime
        gsap.to(overtimeRef.current, {
          opacity: 0.8,
          scale: 1.02,
          duration: 0.8,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut"
        });
      } else {
        // Reset timer text color
        gsap.to(timerRef.current, {
          color: "#ffffff",
          duration: 0.3
        });
        
        // Stop pulsing animation
        gsap.killTweensOf(overtimeRef.current);
        gsap.to(overtimeRef.current, {
          opacity: 0,
          scale: 1,
          duration: 0.3
        });
      }
    }
  }, [isOverTime]);
  
  // Animation for counting up state
  useEffect(() => {
    if (countingUpRef.current) {
      if (countingUp && !isOverTime) {
        gsap.fromTo(countingUpRef.current,
          { opacity: 0, y: 20 },
          { opacity: 0.8, y: 0, duration: 0.5, ease: "power2.out" }
        );
      } else {
        gsap.to(countingUpRef.current, { opacity: 0, duration: 0.3 });
      }
    }
  }, [countingUp, isOverTime]);
  
  // Handle timer counting
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isRunning) {
      // Check if we should start counting up immediately
      if (!countingUp && time.hours === 0 && time.minutes === 0 && time.seconds === 0) {
        setCountingUp(true);
      }
      
      interval = setInterval(() => {
        setTime(prevTime => {
          // Count down logic
          if (!countingUp) {
            // If timer reaches 0, we need to determine if it's becoming negative time (overtime)
            if (prevTime.hours === 0 && prevTime.minutes === 0 && prevTime.seconds === 0) {
              // Show completion notification only once
              if (!hasCompleted) {
                toast.success("Timer completed!");
                setHasCompleted(true);
                setIsOverTime(true); // Mark as overtime since we're going negative
                
                // We'll still count up, but we're in overtime mode
                return { hours: 0, minutes: 0, seconds: 1 };
              }
              
              // Start counting up from 0 (showing as negative)
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
          // Count up logic (either normal count up or overtime)
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
  }, [isRunning, hasCompleted, countingUp, time.hours, time.minutes, time.seconds]);
  
  // Handle reset - now reset will always set the time to 0:00:00 from the parent component
  useEffect(() => {
    // Rely on initialTime which will now be set to 0 from the parent on reset
    setTime(initialTime || { hours: 0, minutes: 0, seconds: 0 });
    setHasCompleted(false);
    setCountingUp(false);
    setIsOverTime(false);
    
    // Animation for reset
    if (timerRef.current) {
      gsap.fromTo(timerRef.current,
        { scale: 0.95, opacity: 0.7 },
        { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(1.7)" }
      );
    }
  }, [onReset, initialTime]);
  
  const formatTimeDigit = (digit: number): string => {
    return digit.toString().padStart(2, '0');
  };
  
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    onTimerNameChange(newName);
  };
  
  return (
    <div className="timer-display text-center w-full max-w-4xl px-4">
      {/* Timer name input */}
      <div className="mb-4">
        <input
          type="text"
          value={name}
          onChange={handleNameChange}
          placeholder="Timer name (optional)"
          className="w-full max-w-xs mx-auto bg-transparent border-0 border-b border-white/10 text-white/50 text-center py-1 focus:outline-none focus:border-white/30 focus:ring-0 placeholder:text-white/30 text-lg"
        />
      </div>
      
      {/* Timer display with overtime indicator */}
      <div ref={timerRef} className="relative">
        {/* Overlay for red pulsing effect when in overtime */}
        {isOverTime && (
          <div 
            ref={overtimeRef}
            className="absolute inset-0 bg-red-500/10 rounded-xl z-0"
          ></div>
        )}
        
        {/* Single line layout on desktop, stacked on mobile */}
        <h1 
          className="text-[10rem] font-black tracking-tighter leading-none flex flex-col md:flex-row justify-center items-center relative z-10"
        >
          {isOverTime && <span className="absolute -left-12 text-red-500">-</span>}
          <div className="flex items-center">
            <span ref={hoursRef} className="inline-block">{formatTimeDigit(time.hours)}</span>
            <span className="inline-block">:</span>
            <span ref={minutesRef} className="inline-block">{formatTimeDigit(time.minutes)}</span>
            <span className="inline-block">:</span>
          </div>
          <div className="md:mt-0 -mt-6">
            <span ref={secondsRef} className="inline-block">{formatTimeDigit(time.seconds)}</span>
          </div>
        </h1>
      </div>
      
      <div ref={countingUpRef} className="text-xl mt-4 text-green-400 opacity-0 font-bold">
        {countingUp && !isOverTime && "Counting Up"}
        {isOverTime && "OVERTIME"}
      </div>
    </div>
  );
};

export default Timer;
