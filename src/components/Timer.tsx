
import React, { useState, useEffect } from 'react';

interface TimerProps {
  isRunning: boolean;
  onReset: () => void;
}

const Timer: React.FC<TimerProps> = ({ isRunning, onReset }) => {
  const [time, setTime] = useState({ hours: 0, minutes: 0, seconds: 0 });
  
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isRunning) {
      interval = setInterval(() => {
        setTime(prevTime => {
          const newSeconds = prevTime.seconds + 1;
          const newMinutes = prevTime.minutes + Math.floor(newSeconds / 60);
          const newHours = prevTime.hours + Math.floor(newMinutes / 60);
          
          return {
            hours: newHours,
            minutes: newMinutes % 60,
            seconds: newSeconds % 60
          };
        });
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning]);
  
  useEffect(() => {
    setTime({ hours: 0, minutes: 0, seconds: 0 });
  }, [onReset]);
  
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
