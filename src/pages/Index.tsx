import React, { useState, useCallback, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import Header from '../components/Header';
import Timer from '../components/Timer';
import TimerControls from '../components/TimerControls';
import TimerSettings from '../components/TimerSettings';
import gsap from 'gsap';
import { timerLogService } from '../lib/timerLogService';
import { getTimeInSeconds, secondsToTime } from '../lib/utils';
import { v4 as uuidv4 } from 'uuid';

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
  const [isCountingUp, setIsCountingUp] = useState(false);
  const [isOverTime, setIsOverTime] = useState(false);
  const [timerName, setTimerName] = useState<string>('');
  const [showSettings, setShowSettings] = useState(false);
  const [playSounds, setPlaySounds] = useState(true);
  const [showNotifications, setShowNotifications] = useState(true);
  
  // Refs for tracking timer state
  const timerStartTimeRef = useRef<Date | null>(null);
  const activeTimerIdRef = useRef<string | null>(null);
  
  // Refs for animations
  const pageRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  const isInitialMount = useRef(true);
  
  // Initial page animation - only on mount
  useEffect(() => {
    if (pageRef.current && mainRef.current && isInitialMount.current) {
      // Create a timeline for the initial animation
      const tl = gsap.timeline();
      
      tl.from(pageRef.current, {
        backgroundColor: '#111',
        duration: 1.5,
        ease: "power2.inOut"
      })
      .from(mainRef.current, {
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: "power3.out"
      }, "-=0.8");
      
      isInitialMount.current = false;
    }
  }, []);
  
  // Background pulse animation based on timer state
  useEffect(() => {
    if (pageRef.current) {
      if (isRunning) {
        // Subtle pulsing background when timer is running
        gsap.to(pageRef.current, {
          backgroundColor: isOverTime ? 'rgba(50, 30, 30, 1)' : isCountingUp ? 'rgba(40, 40, 40, 1)' : 'rgba(34, 34, 34, 1)',
          duration: 2,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut"
        });
      } else {
        // Stop the animation and reset background
        gsap.killTweensOf(pageRef.current);
        gsap.to(pageRef.current, {
          backgroundColor: '#222',
          duration: 0.5
        });
      }
    }
    
    return () => {
      if (pageRef.current) {
        gsap.killTweensOf(pageRef.current);
      }
    };
  }, [isRunning, isCountingUp, isOverTime]);
  
  // Save timer log when stopping or resetting a timer
  const saveTimerLog = useCallback((isCompleted: boolean) => {
    if (!activeTimerIdRef.current || !timerStartTimeRef.current) return;
    
    const initialTotalSeconds = getTimeInSeconds(timerInitialTime);
    const currentTotalSeconds = getTimeInSeconds(currentTime);
    
    // Determine if timer went into overtime
    const isOverTime = initialTotalSeconds > 0 && currentTotalSeconds === 0 && isCompleted;
    
    // Calculate overtime amount if applicable
    let overTimeAmount = null;
    if (isOverTime && isCountingUp) {
      overTimeAmount = secondsToTime(getTimeInSeconds(currentTime));
    }
    
    // Create and save the timer log
    const timerLog = {
      id: activeTimerIdRef.current,
      name: timerName,
      startTime: timerStartTimeRef.current,
      endTime: new Date(),
      initialHours: timerInitialTime.hours,
      initialMinutes: timerInitialTime.minutes,
      initialSeconds: timerInitialTime.seconds,
      finalHours: currentTime.hours,
      finalMinutes: currentTime.minutes,
      finalSeconds: currentTime.seconds,
      wasCompleted: isCompleted,
      overTime: isOverTime,
      overTimeAmount: overTimeAmount
    };
    
    timerLogService.saveLogs(timerLog);
    
    // Reset tracking refs
    activeTimerIdRef.current = null;
    timerStartTimeRef.current = null;
  }, [timerInitialTime, currentTime, isCountingUp, timerName]);
  
  const handlePlayPause = useCallback(() => {
    // Starting a timer
    if (!isRunning) {
      // If no active timer, create a new one
      if (!activeTimerIdRef.current) {
        activeTimerIdRef.current = uuidv4();
        timerStartTimeRef.current = new Date();
      }
      
      // If current time is 0 and timer is not running, we're about to start counting up
      if (currentTime.hours === 0 && currentTime.minutes === 0 && currentTime.seconds === 0) {
        setIsCountingUp(true);
      }
    } 
    // Stopping a timer - log it if we're stopping
    else {
      saveTimerLog(true);
    }
    
    setIsRunning(prev => !prev);
  }, [isRunning, currentTime, saveTimerLog]);
  
  const handleReset = useCallback(() => {
    // If timer was running, save a log that it was canceled
    if (isRunning && activeTimerIdRef.current) {
      saveTimerLog(false);
    }
    
    setIsRunning(false);
    setIsCountingUp(false);
    setIsOverTime(false);
    setTimerName('');
    
    // Always reset to zero
    setTimerInitialTime({ hours: 0, minutes: 0, seconds: 0 });
    setCurrentTime({ hours: 0, minutes: 0, seconds: 0 });
    
    // Clear tracking refs
    activeTimerIdRef.current = null;
    timerStartTimeRef.current = null;
    
    setResetTrigger(prev => prev + 1);
  }, [isRunning, saveTimerLog]);
  
  const handleSetTimer = useCallback((hours: number, minutes: number, seconds: number) => {
    // If timer is already running and not in counting up mode, add time instead of replacing
    if (isRunning && !isCountingUp) {
      // Calculate total seconds for easier addition
      const currentTotalSeconds = currentTime.hours * 3600 + currentTime.minutes * 60 + currentTime.seconds;
      const addedTotalSeconds = hours * 3600 + minutes * 60 + seconds;
      const newTotalSeconds = currentTotalSeconds + addedTotalSeconds;
      
      // Convert total seconds back to hours, minutes, seconds
      const newHours = Math.floor(newTotalSeconds / 3600);
      const newMinutes = Math.floor((newTotalSeconds % 3600) / 60);
      const newSeconds = newTotalSeconds % 60;
      
      // Update both current and initial times
      const newTime = { hours: newHours, minutes: newMinutes, seconds: newSeconds };
      setTimerInitialTime(newTime);
      setCurrentTime(newTime);
      
      // Notify user of added time
      toast.success(`Added ${hours > 0 ? `${hours}h ` : ''}${minutes > 0 ? `${minutes}m ` : ''}${seconds > 0 ? `${seconds}s` : ''} to timer`);
    } else {
      // If a timer was running before, save its log
      if (isRunning && activeTimerIdRef.current) {
        saveTimerLog(false);
      }
      
      // Original behavior - replace timer with new value
      setIsRunning(false);
      setTimerInitialTime({ hours, minutes, seconds });
      setCurrentTime({ hours, minutes, seconds });
      setProgress(100); // Reset progress to 100% when setting a new timer
      setIsCountingUp(false);
      setIsOverTime(false);
      
      // Create a new timer ID for tracking
      activeTimerIdRef.current = uuidv4();
      timerStartTimeRef.current = null; // Will be set when the timer starts
      
      setResetTrigger(prev => prev + 1);
    }
  }, [isRunning, isCountingUp, currentTime, saveTimerLog]);
  
  // Handle timer name changes
  const handleTimerNameChange = useCallback((name: string) => {
    setTimerName(name);
  }, []);

  // Toggle settings panel
  const handleToggleSettings = useCallback(() => {
    setShowSettings(prev => !prev);
  }, []);
  
  // Update progress based on current time vs initial time
  useEffect(() => {
    // If we're counting up, handle progress differently
    if (isCountingUp) {
      // For count-up mode, we'll use a different approach
      // We'll start at 0% and fill up to arbitrary amount (max 30 minutes = 100%)
      const totalSeconds = currentTime.hours * 3600 + currentTime.minutes * 60 + currentTime.seconds;
      // 30 minutes (1800 seconds) will represent 100% for count-up
      const maxCountUpSeconds = 1800;
      const newProgress = Math.min((totalSeconds / maxCountUpSeconds) * 100, 100);
      setProgress(newProgress);
    } else {
      // Standard countdown progress calculation
      const initialTotalSeconds = timerInitialTime.hours * 3600 + timerInitialTime.minutes * 60 + timerInitialTime.seconds;
      const currentTotalSeconds = currentTime.hours * 3600 + currentTime.minutes * 60 + currentTime.seconds;
      
      if (initialTotalSeconds > 0) {
        // Calculate progress percentage
        const newProgress = (currentTotalSeconds / initialTotalSeconds) * 100;
        setProgress(newProgress);
      } else {
        setProgress(100);
      }
    }
  }, [currentTime, timerInitialTime, isCountingUp]);

  // Detect when timer hits zero and switch to count up mode
  useEffect(() => {
    const initialTotalSeconds = timerInitialTime.hours * 3600 + timerInitialTime.minutes * 60 + timerInitialTime.seconds;
    const currentTotalSeconds = currentTime.hours * 3600 + currentTime.minutes * 60 + currentTime.seconds;
    
    // If we were counting down (had initial time > 0) and now we're at 0, we're about to count up
    if (initialTotalSeconds > 0 && currentTotalSeconds === 0 && isRunning) {
      setIsCountingUp(true);
      setIsOverTime(true);
    }
  }, [currentTime, timerInitialTime, isRunning]);
  
  return (
    <div ref={pageRef} className="min-h-screen bg-[#222] text-white flex flex-col overflow-hidden">
      <Header 
        onSetTimer={handleSetTimer} 
        isRunning={isRunning}
        progress={progress}
        isCountingUp={isCountingUp}
      />
      
      <main ref={mainRef} className="flex-1 flex items-center justify-center px-4 py-8 mt-2">
        <div className="flex flex-col items-center justify-center w-full max-w-5xl mx-auto">
          <Timer 
            isRunning={isRunning} 
            onReset={resetTrigger} 
            initialTime={timerInitialTime}
            onTimeUpdate={setCurrentTime}
            timerName={timerName}
            onTimerNameChange={handleTimerNameChange}
          />
        </div>
      </main>
      
      <TimerControls 
        isRunning={isRunning} 
        onPlayPause={handlePlayPause} 
        onReset={handleReset} 
        onSetTimer={handleSetTimer}
        onOpenSettings={handleToggleSettings}
      />

      {/* Settings Modal */}
      <TimerSettings
        isVisible={showSettings}
        onClose={handleToggleSettings}
        onSetTimer={handleSetTimer}
        playSounds={playSounds}
        setPlaySounds={setPlaySounds}
        showNotifications={showNotifications}
        setShowNotifications={setShowNotifications}
      />
    </div>
  );
};

export default Index;
