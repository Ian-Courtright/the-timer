
import React, { useState, useCallback } from 'react';
import Header from '@/components/Header';
import Timer from '@/components/Timer';
import TimerControls from '@/components/TimerControls';

const Index: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [resetTrigger, setResetTrigger] = useState(0);
  
  const handlePlayPause = useCallback(() => {
    setIsRunning(prev => !prev);
  }, []);
  
  const handleReset = useCallback(() => {
    setIsRunning(false);
    setResetTrigger(prev => prev + 1);
  }, []);
  
  return (
    <div className="min-h-screen bg-timer-background text-timer-text flex flex-col">
      <Header />
      
      <main className="flex-1 flex flex-col items-center justify-center pb-20">
        <Timer isRunning={isRunning} onReset={resetTrigger} />
        <TimerControls 
          isRunning={isRunning} 
          onPlayPause={handlePlayPause} 
          onReset={handleReset} 
        />
      </main>
    </div>
  );
};

export default Index;
