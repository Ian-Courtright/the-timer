
import React, { useState, useCallback, useEffect } from 'react';
import { Toaster } from 'sonner';
import Header from '@/components/Header';
import Timer from '@/components/Timer';
import TimerControls from '@/components/TimerControls';

const Index: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [resetTrigger, setResetTrigger] = useState(0);
  const [timerInitialTime, setTimerInitialTime] = useState<{ hours: number, minutes: number, seconds: number }>({ 
    hours: 0, minutes: 0, seconds: 0 
  });
  const [currentTime, setCurrentTime] = useState<{ hours: number, minutes: number, seconds: number }>({
    hours: 0, minutes: 0, seconds: 0
  });
  const [progress, setProgress] = useState(100); // 100% initially (full circle)
  
  const handlePlayPause = useCallback(() => {
    setIsRunning(prev => !prev);
  }, []);
  
  const handleReset = useCallback(() => {
    setIsRunning(false);
    setResetTrigger(prev => prev + 1);
  }, []);
  
  const handleSetTimer = useCallback((hours: number, minutes: number, seconds: number) => {
    setIsRunning(false);
    setTimerInitialTime({ hours, minutes, seconds });
    setCurrentTime({ hours, minutes, seconds });
    setProgress(100); // Reset progress to 100% when setting a new timer
    setResetTrigger(prev => prev + 1);
  }, []);
  
  // Update progress based on current time vs initial time
  useEffect(() => {
    // Calculate total seconds for initial and current time
    const initialTotalSeconds = timerInitialTime.hours * 3600 + timerInitialTime.minutes * 60 + timerInitialTime.seconds;
    const currentTotalSeconds = currentTime.hours * 3600 + currentTime.minutes * 60 + currentTime.seconds;
    
    if (initialTotalSeconds > 0) {
      // Calculate progress percentage
      const newProgress = (currentTotalSeconds / initialTotalSeconds) * 100;
      setProgress(newProgress);
    } else {
      setProgress(100);
    }
  }, [currentTime, timerInitialTime]);
  
  // Update Header component to include the setTimer function and timer state
  const HeaderWithTimerState = useCallback(() => (
    <Header 
      onSetTimer={handleSetTimer} 
      isRunning={isRunning}
      progress={progress}
    />
  ), [handleSetTimer, isRunning, progress]);
  
  return (
    <div className="min-h-screen bg-timer-background text-timer-text flex flex-col">
      <HeaderWithTimerState />
      <Toaster position="top-center" />
      
      <main className="flex-1 flex flex-col items-center justify-center pb-20">
        <Timer 
          isRunning={isRunning} 
          onReset={resetTrigger} 
          initialTime={timerInitialTime}
          onTimeUpdate={setCurrentTime}
        />
        <TimerControls 
          isRunning={isRunning} 
          onPlayPause={handlePlayPause} 
          onReset={handleReset} 
          onSetTimer={handleSetTimer}
        />
      </main>
    </div>
  );
};

export default Index;
