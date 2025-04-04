
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface TimerProps {
  isRunning: boolean;
  onReset: number; // Used as a trigger for reset
  initialTime?: { hours: number, minutes: number, seconds: number };
}

const Timer: React.FC<TimerProps> = ({ isRunning, onReset, initialTime }) => {
  const [time, setTime] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [hasCompleted, setHasCompleted] = useState(false);
  
  // Handle initial time set
  useEffect(() => {
    if (initialTime) {
      setTime(initialTime);
      setHasCompleted(false);
    }
  }, [initialTime]);
  
  // Handle timer counting
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isRunning) {
      interval = setInterval(() => {
        setTime(prevTime => {
          // If timer reaches 0, don't go negative
          if (prevTime.hours === 0 && prevTime.minutes === 0 && prevTime.seconds === 0) {
            if (interval) clearInterval(interval);
            
            // Show completion notification only once
            if (!hasCompleted) {
              toast.success("Timer completed!");
              setHasCompleted(true);
            }
            
            return prevTime;
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
        });
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, hasCompleted]);
  
  // Handle reset
  useEffect(() => {
    if (initialTime) {
      setTime(initialTime);
    } else {
      setTime({ hours: 0, minutes: 0, seconds: 0 });
    }
    setHasCompleted(false);
  }, [onReset, initialTime]);
  
  const formatTimeDigit = (digit: number): string => {
    return digit.toString().padStart(2, '0');
  };
  
  return (
    <div className="timer-display text-center mt-20">
      <h1 className="text-9xl font-bold tracking-wider">
        {formatTimeDigit(time.hours)}:{formatTimeDigit(time.minutes)}:{formatTimeDigit(time.seconds)}
      </h1>
    </div>
  );
};

export default Timer;
