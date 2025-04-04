
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
    setResetTrigger(prev => prev + 1);
  }, []);
  
  // Update Header component to include the setTimer function
  const HeaderWithQuickSets = useCallback(() => (
    <Header onSetTimer={handleSetTimer} />
  ), [handleSetTimer]);
  
  return (
    <div className="min-h-screen bg-timer-background text-timer-text flex flex-col">
      <HeaderWithQuickSets />
      <Toaster position="top-center" />
      
      <main className="flex-1 flex flex-col items-center justify-center pb-20">
        <Timer 
          isRunning={isRunning} 
          onReset={resetTrigger} 
          initialTime={timerInitialTime}
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
