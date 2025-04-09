import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Toaster, toast } from 'sonner';
import Header from '@/components/Header';
import Timer from '@/components/Timer';
import TimerControls from '@/components/TimerControls';
import TimerSettings from '@/components/TimerSettings';
import { v4 as uuidv4 } from 'uuid';
import gsap from 'gsap';
import { TimerLog, TimeData, TimerEvent } from '@/lib/types';
import { soundEffects } from '@/lib/sounds/soundEffects';

// Helper function to analyze timer logs
const analyzeTimerLog = (log: TimerLog): TimerLog => {
  // Calculate total active time (exclude pauses)
  const totalActiveTime = log.actualDuration - (log.totalPauseDuration || 0);
  
  // Calculate efficiency (how close was actual time to planned time)
  // Only calculate if initial duration was set (not for count-up timers)
  const efficiency = log.initialDuration > 0 
    ? (log.initialDuration / totalActiveTime) * 100 
    : undefined;

  // Calculate average pause duration
  const averagePauseDuration = log.pauseCount > 0 
    ? log.totalPauseDuration / log.pauseCount 
    : undefined;
    
  // Calculate overage percentage (how much over the initial time)
  const overagePercentage = (log.initialDuration > 0 && log.overageTime > 0)
    ? (log.overageTime / log.initialDuration) * 100
    : undefined;

  return {
    ...log,
    analysis: {
      totalActiveTime,
      efficiency,
      averagePauseDuration,
      overagePercentage
    }
  };
};

// Helper function to show timer completion notification
const showTimerCompletionNotification = (timerName?: string) => {
  if (!('Notification' in window)) {
    console.warn("Browser does not support desktop notification");
    return;
  }

  const title = "Timer Complete!";
  const options: NotificationOptions = {
    body: timerName ? `Your timer "${timerName}" is up.` : "Your timer is up.",
    icon: '/favicon.svg', // Optional: Use your app's icon
    // tag: 'timer-complete', // Optional: Use a tag to prevent multiple notifications for the same event
    // renotify: true, // Optional: Vibrate/alert even if a notification with the same tag exists
  };

  if (Notification.permission === "granted") {
    new Notification(title, options);
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        new Notification(title, options);
      }
    });
  }
};

const Index: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [resetTrigger, setResetTrigger] = useState(0);
  const [timerInitialTime, setTimerInitialTime] = useState<TimeData>({ 
    hours: 0, minutes: 0, seconds: 0 
  });
  const [currentTime, setCurrentTime] = useState<TimeData>({
    hours: 0, minutes: 0, seconds: 0
  });
  const [progress, setProgress] = useState(100); // 100% initially (full circle)
  const [isCountingUp, setIsCountingUp] = useState(false);
  const [timerName, setTimerName] = useState("");
  const [isOverage, setIsOverage] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [customTimerOpen, setCustomTimerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("custom");
  
  // Timer logs state
  const [timerLogs, setTimerLogs] = useState<TimerLog[]>([]);
  const [activeTimerLog, setActiveTimerLog] = useState<TimerLog | null>(null);
  
  // Sound settings state
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [soundVolume, setSoundVolume] = useState<number>(0.8);
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(false);
  // Countdown sound settings
  const [countdownSoundEnabled, setCountdownSoundEnabled] = useState<boolean>(true);
  const [countdownSoundVolume, setCountdownSoundVolume] = useState<number>(0.8);
  
  // Refs for animations
  const pageRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  const isInitialMount = useRef(true);
  
  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore keyboard shortcuts when inputs are focused
      if (document.activeElement?.tagName === 'INPUT' || 
          document.activeElement?.tagName === 'TEXTAREA') {
        // Handle Enter key for form submission
        if (e.key === 'Enter' && customTimerOpen) {
          const applyButton = document.querySelector('button');
          if (applyButton && applyButton.textContent?.includes('Add Timer')) {
            applyButton.click();
          }
        }
        return;
      }
      
      switch (e.key) {
        case ' ': // Space bar
          e.preventDefault(); // Prevent page scroll
          handlePlayPause();
          break;
        case 'r': // r key
          handleReset();
          break;
        case 'c': // c key
          setCustomTimerOpen(prev => !prev);
          break;
        case 's': // s key
          if (!settingsOpen) {
            toggleSettings();
            setActiveTab("custom");
          } else if (activeTab !== "custom") {
            setActiveTab("custom");
          } else {
            toggleSettings();
          }
          break;
        case 'q': // q key
          // Toggle QuickSets
          const quickSetsButton = document.querySelector('[data-tooltip="quicksets"]');
          if (quickSetsButton) {
            (quickSetsButton as HTMLElement).click();
          }
          break;
        case 'a': // a key
          if (!settingsOpen) {
            toggleSettings();
            setActiveTab("logs");
          } else if (activeTab !== "logs") {
            setActiveTab("logs");
          } else {
            toggleSettings();
          }
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [customTimerOpen, settingsOpen, activeTab]);
  
  // Initial page animation - only run once on mount
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
    
    // Load timer logs from localStorage
    const savedLogs = localStorage.getItem('timerLogs');
    
    // If no logs exist, create a test log
    if (!savedLogs || savedLogs === '[]') {
      const testStartTime = new Date(Date.now() - 1000 * 60 * 15); // 15 minutes ago
      const testEndTime = new Date(Date.now() - 1000 * 60 * 5); // 5 minutes ago

      const testEvents: TimerEvent[] = [
        {
          type: 'start',
          timestamp: testStartTime,
          timeData: { hours: 0, minutes: 10, seconds: 0 }
        },
        {
          type: 'pause',
          timestamp: new Date(testStartTime.getTime() + 1000 * 60 * 3), // 3 minutes after start
          timeData: { hours: 0, minutes: 7, seconds: 0 }
        },
        {
          type: 'resume',
          timestamp: new Date(testStartTime.getTime() + 1000 * 60 * 4), // 1 minute pause
          timeData: { hours: 0, minutes: 7, seconds: 0 }
        },
        {
          type: 'pause',
          timestamp: new Date(testStartTime.getTime() + 1000 * 60 * 7), // 3 minutes after resume
          timeData: { hours: 0, minutes: 4, seconds: 0 }
        },
        {
          type: 'resume',
          timestamp: new Date(testStartTime.getTime() + 1000 * 60 * 8), // 1 minute pause
          timeData: { hours: 0, minutes: 4, seconds: 0 }
        },
        {
          type: 'complete',
          timestamp: testEndTime,
          timeData: { hours: 0, minutes: 0, seconds: 0 }
        }
      ];

      const testLog: TimerLog = {
        id: uuidv4(),
        timerName: "Test Timer",
        startTime: testStartTime,
        endTime: testEndTime,
        initialDuration: 600, // 10 minutes
        actualDuration: 600, // 10 minutes
        completed: true,
        canceled: false,
        overageTime: 0,
        pauseCount: 2,
        totalPauseDuration: 120, // 2 minutes
        events: testEvents
      };
      
      // Add analysis to test log
      const analyzedTestLog = analyzeTimerLog(testLog);
      
      console.log('Creating test log:', analyzedTestLog);
      setTimerLogs([analyzedTestLog]);
    } else if (savedLogs) {
      try {
        const parsedLogs = JSON.parse(savedLogs);
        // Convert string dates back to Date objects and ensure new fields exist
        const processedLogs = parsedLogs.map((log: any) => ({
          ...log,
          startTime: new Date(log.startTime),
          endTime: new Date(log.endTime),
          // Ensure pause tracking fields exist (backward compatibility)
          pauseCount: log.pauseCount || 0,
          totalPauseDuration: log.totalPauseDuration || 0,
          // Ensure events array exists and convert dates
          events: Array.isArray(log.events) 
            ? log.events.map((event: any) => ({
                ...event,
                timestamp: new Date(event.timestamp),
                timeData: event.timeData || { hours: 0, minutes: 0, seconds: 0 }
              }))
            : []
        }));

        // Add analysis to all logs
        const analyzedLogs = processedLogs.map(analyzeTimerLog);
        
        setTimerLogs(analyzedLogs);
        console.log('Loaded timer logs:', analyzedLogs); // Debug logs
      } catch (error) {
        console.error('Failed to load timer logs:', error);
        // If there's an error, clear localStorage and start fresh
        localStorage.removeItem('timerLogs');
      }
    }
  }, []);
  
  // Save timer logs to localStorage when they change, but throttled
  useEffect(() => {
    // Use a timeout to throttle localStorage writes
    const timeoutId = setTimeout(() => {
      try {
        // Limit the size of logs in localStorage to prevent space issues
        const logsToSave = timerLogs.slice(-20); // Keep only the most recent 20 logs
        localStorage.setItem('timerLogs', JSON.stringify(logsToSave));
      } catch (error) {
        console.error('Failed to save timer logs:', error);
        // If localStorage is full, try clearing it and saving only the most recent log
        try {
          localStorage.clear();
          const recentLog = timerLogs.length > 0 ? [timerLogs[timerLogs.length - 1]] : [];
          localStorage.setItem('timerLogs', JSON.stringify(recentLog));
        } catch (e) {
          console.error('Could not recover localStorage:', e);
        }
      }
    }, 1000); // Throttle to once per second
    
    return () => clearTimeout(timeoutId);
  }, [timerLogs]);
  
  // Background pulse animation based on timer state
  useEffect(() => {
    if (pageRef.current) {
      if (isRunning) {
        // Subtle pulsing background when timer is running
        gsap.to(pageRef.current, {
          backgroundColor: isCountingUp 
            ? isOverage 
              ? 'rgba(60, 20, 20, 1)' // Darker red for overage
              : 'rgba(40, 40, 40, 1)' 
            : 'rgba(34, 34, 34, 1)',
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
  }, [isRunning, isCountingUp, isOverage]);

  // Add event to active timer log
  const addEventToLog = useCallback((eventType: TimerEvent['type'], additionalData?: Partial<TimerEvent>) => {
    if (!activeTimerLog) return;
    
    const now = new Date();
    const newEvent: TimerEvent = {
      type: eventType,
      timestamp: now,
      timeData: { ...currentTime },
      ...additionalData
    };
    
    setActiveTimerLog(prev => {
      if (!prev) return null;
      return {
        ...prev,
        events: [...prev.events, newEvent]
      };
    });
    
    console.log(`Added ${eventType} event:`, newEvent);
  }, [activeTimerLog, currentTime]);

  // Handle start of a new timer
  const startNewTimerLog = useCallback(() => {
    if (!isRunning) {
      const initialSeconds = timerInitialTime.hours * 3600 + timerInitialTime.minutes * 60 + timerInitialTime.seconds;
      const now = new Date();
      
      // Create the start event
      const startEvent: TimerEvent = {
        type: 'start',
        timestamp: now,
        timeData: { ...timerInitialTime }
      };
      
      // Add set-timer event if timer was set to a specific time
      const setTimerEvent: TimerEvent[] = initialSeconds > 0 ? [{
        type: 'set-timer',
        timestamp: new Date(now.getTime() - 1), // Just before start
        timeData: { ...timerInitialTime },
        notes: `Timer set to ${initialSeconds} seconds`
      }] : [];
      
      // Create a log for any timer (count up or with duration)
      const newLog: TimerLog = {
        id: uuidv4(),
        timerName: timerName || "Unnamed Timer",
        startTime: now,
        endTime: now, // Will be updated when timer stops
        initialDuration: initialSeconds,
        actualDuration: 0, // Will be updated when timer stops
        completed: false,
        canceled: false,
        overageTime: 0,
        pauseCount: 0,
        totalPauseDuration: 0,
        events: [
          ...setTimerEvent,
          startEvent
        ]
      };
      
      console.log('Creating new timer log:', newLog);
      setActiveTimerLog(newLog);
    }
  }, [isRunning, timerInitialTime, timerName]);
  
  // Track pause time
  const [lastPauseTime, setLastPauseTime] = useState<Date | null>(null);
  
  // End active timer log
  const endTimerLog = useCallback((canceled: boolean = false) => {
    if (activeTimerLog) {
      const now = new Date();
      const actualDuration = Math.floor((now.getTime() - activeTimerLog.startTime.getTime()) / 1000);
      let overageTime = 0;
      
      // Calculate overage time if completed and went over
      if (!canceled && isOverage) {
        overageTime = currentTime.hours * 3600 + currentTime.minutes * 60 + currentTime.seconds;
      }
      
      // Add the appropriate event type
      const eventType = canceled ? 'reset' : 'complete';
      
      // Check if the last event is already of this type to prevent duplicates
      const hasExistingEventOfSameType = activeTimerLog.events && 
        activeTimerLog.events.length > 0 && 
        activeTimerLog.events[activeTimerLog.events.length - 1].type === eventType;
      
      // Create new event only if needed
      const newEvent = !hasExistingEventOfSameType ? [{
        type: eventType as 'reset' | 'complete',
        timestamp: now,
        timeData: { ...currentTime },
        notes: canceled ? 'Timer was reset' : 'Timer completed'
      }] : [];
      
      const updatedLog: TimerLog = {
        ...activeTimerLog,
        endTime: now,
        actualDuration,
        completed: !canceled,
        canceled,
        overageTime,
        // Ensure pause fields are included
        pauseCount: activeTimerLog.pauseCount || 0,
        totalPauseDuration: activeTimerLog.totalPauseDuration || 0,
        events: [
          ...(activeTimerLog.events || []),
          ...newEvent
        ]
      };
      
      // Add analysis to the log
      const analyzedLog = analyzeTimerLog(updatedLog);
      
      setTimerLogs(prevLogs => [...prevLogs, analyzedLog]);
      setActiveTimerLog(null);
      setLastPauseTime(null); // Reset pause tracking
    }
  }, [activeTimerLog, isOverage, currentTime]);
  
  const handlePlayPause = useCallback(() => {
    const now = new Date();
    
    // If starting timer
    if (!isRunning) {
      // If we have an active timer log with pauses, update pause duration and add resume event
      if (activeTimerLog && lastPauseTime) {
        const pauseDuration = Math.floor((now.getTime() - lastPauseTime.getTime()) / 1000);
        setActiveTimerLog(prev => {
          if (!prev) return null;
          return {
            ...prev,
            totalPauseDuration: (prev.totalPauseDuration || 0) + pauseDuration,
            events: [
              ...(prev.events || []),
              {
                type: 'resume',
                timestamp: now,
                timeData: { ...currentTime },
                notes: `Resumed after ${pauseDuration} seconds pause`
              }
            ]
          };
        });
        setLastPauseTime(null); // Reset pause time
      } else {
        // Start a new timer log when playing
        startNewTimerLog();
      }
      
      // If current time is 0 and timer is not running, we're about to start counting up
      if (currentTime.hours === 0 && currentTime.minutes === 0 && currentTime.seconds === 0) {
        setIsCountingUp(true);
        // But we're NOT in overage mode because we didn't count down to zero
        setIsOverage(false);
        
        // Ensure we have a log even for count-up timers with no initial duration
        if (!activeTimerLog) {
          startNewTimerLog();
        }
      } else if (currentTime.hours > 0 || currentTime.minutes > 0 || currentTime.seconds > 0) {
        // If we have time set, we're starting a countdown timer
        setIsCountingUp(false);
        setIsOverage(false);
      }
    } else {
      // If pausing, record the pause time and increment pause count
      if (activeTimerLog) {
        setLastPauseTime(now);
        setActiveTimerLog(prev => {
          if (!prev) return null;
          return {
            ...prev,
            pauseCount: (prev.pauseCount || 0) + 1,
            events: [
              ...(prev.events || []),
              {
                type: 'pause',
                timestamp: now,
                timeData: { ...currentTime },
                notes: `Paused with ${currentTime.hours}h ${currentTime.minutes}m ${currentTime.seconds}s remaining`
              }
            ]
          };
        });
      }
    }
    
    setIsRunning(prev => !prev);
  }, [isRunning, currentTime, startNewTimerLog, activeTimerLog, lastPauseTime]);
  
  const handleReset = useCallback(() => {
    // If timer is running, log it as canceled
    if (activeTimerLog) {
      endTimerLog(true);
    }
    
    setIsRunning(false);
    setIsCountingUp(false);
    setIsOverage(false);
    
    // Always reset to zero
    setTimerInitialTime({ hours: 0, minutes: 0, seconds: 0 });
    setCurrentTime({ hours: 0, minutes: 0, seconds: 0 });
    // Clear the timer name
    setTimerName("");
    
    setResetTrigger(prev => prev + 1);
  }, [activeTimerLog, endTimerLog]);
  
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
      
      // Log the time addition in the active timer
      if (activeTimerLog) {
        const now = new Date();
        setActiveTimerLog(prev => {
          if (!prev) return null;
          const updatedInitialDuration = prev.initialDuration + addedTotalSeconds;
          return {
            ...prev,
            initialDuration: updatedInitialDuration,
            events: [
              ...(prev.events || []),
              {
                type: 'add-time',
                timestamp: now,
                timeData: { hours, minutes, seconds },
                duration: addedTotalSeconds,
                notes: `Added ${hours}h ${minutes}m ${seconds}s to timer`
              }
            ]
          };
        });
      }
      
      // Notify user of added time
      toast.success(`Added ${hours > 0 ? `${hours}h ` : ''}${minutes > 0 ? `${minutes}m ` : ''}${seconds > 0 ? `${seconds}s` : ''} to timer`);
    } else {
      // If a timer was running, log it as canceled
      if (activeTimerLog) {
        endTimerLog(true);
      }
      
      // Add a set-timer event
      const totalSeconds = hours * 3600 + minutes * 60 + seconds;
      
      // Original behavior - replace timer with new value
      setIsRunning(false);
      setTimerInitialTime({ hours, minutes, seconds });
      setCurrentTime({ hours, minutes, seconds });
      setProgress(100); // Reset progress to 100% when setting a new timer
      setIsCountingUp(false);
      setIsOverage(false);
      setResetTrigger(prev => prev + 1);
    }
  }, [isRunning, isCountingUp, currentTime, activeTimerLog, endTimerLog]);
  
  const handleNameChange = useCallback((name: string) => {
    setTimerName(name);
    
    // Update active timer log name if exists
    if (activeTimerLog) {
      setActiveTimerLog(prev => prev ? { ...prev, timerName: name } : null);
    }
  }, [activeTimerLog]);
  
  const handleOverageChange = useCallback((overage: boolean) => {
    // Record overage start if it's a new overage state
    if (overage && !isOverage && activeTimerLog) {
      addEventToLog('overage-start', {
        notes: 'Timer exceeded initial duration'
      });
    }
    
    setIsOverage(overage);
  }, [isOverage, activeTimerLog, addEventToLog]);
  
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
    if (initialTotalSeconds > 0 && currentTotalSeconds === 0 && isRunning && activeTimerLog) {
      // Check if we already have a 'complete' event - prevent duplicates
      const hasCompleteEvent = activeTimerLog.events && 
        activeTimerLog.events.some(event => event.type === 'complete');
      
      if (!hasCompleteEvent) {
        setIsCountingUp(true);
        setIsOverage(true); // Ensure overage flag is set
        
        // Show notification if enabled
        if (notificationsEnabled) {
          showTimerCompletionNotification(activeTimerLog?.timerName);
        }

        // Log the overage/count-up event
        const now = new Date();
        setActiveTimerLog(prev => {
          if (!prev) return null;
          
          // Create the complete event with proper typing
          const completeEvent: TimerEvent = {
            type: 'complete',
            timestamp: now,
            timeData: { hours: 0, minutes: 0, seconds: 0 },
            notes: 'Timer completed initial duration'
          };
          
          const overageEvent: TimerEvent = {
            type: 'overage-start',
            timestamp: new Date(now.getTime() + 1), // Just after complete
            timeData: { hours: 0, minutes: 0, seconds: 0 },
            notes: 'Timer entered overage mode'
          };
          
          return {
            ...prev,
            events: [
              ...(prev.events || []),
              completeEvent,
              overageEvent
            ]
          };
        });
      }
    }
  }, [currentTime, timerInitialTime, isRunning, activeTimerLog, notificationsEnabled]);
  
  const toggleSettings = useCallback(() => {
    setSettingsOpen(prev => !prev);
  }, []);
  
  const handleClearLogs = useCallback(() => {
    localStorage.removeItem('timerLogs');
    setTimerLogs([]);
    
    // If there's an active timer log, keep it but don't clear it
    if (!activeTimerLog) {
      // Reset test log creation flag to allow new test log creation after clearing
      localStorage.setItem('timerLogsInitialized', 'false');
    }
    
    // No toast notification shown
  }, [activeTimerLog]);
  
  // Function to delete a single timer log by ID
  const handleDeleteLog = useCallback((logId: string) => {
    // Directly delete the log without confirmation
    setTimerLogs(prevLogs => {
      const updatedLogs = prevLogs.filter(log => log.id !== logId);
      
      // Save updated logs to localStorage
      localStorage.setItem('timerLogs', JSON.stringify(updatedLogs));
      
      return updatedLogs;
    });
    
    // Remove toast notification
  }, []);

  // Load sound settings from localStorage
  useEffect(() => {
    // Load sound settings from localStorage
    const savedSoundEnabled = localStorage.getItem('soundEnabled');
    const savedSoundVolume = localStorage.getItem('soundVolume');
    const savedNotificationsEnabled = localStorage.getItem('notificationsEnabled');
    const savedCountdownSoundEnabled = localStorage.getItem('countdownSoundEnabled');
    const savedCountdownSoundVolume = localStorage.getItem('countdownSoundVolume');
    
    if (savedSoundEnabled !== null) {
      setSoundEnabled(savedSoundEnabled === 'true');
    }
    
    if (savedSoundVolume !== null) {
      setSoundVolume(parseFloat(savedSoundVolume));
    }
    
    if (savedNotificationsEnabled !== null) {
      setNotificationsEnabled(savedNotificationsEnabled === 'true');
    }
    
    if (savedCountdownSoundEnabled !== null) {
      setCountdownSoundEnabled(savedCountdownSoundEnabled === 'true');
    }
    
    if (savedCountdownSoundVolume !== null) {
      setCountdownSoundVolume(parseFloat(savedCountdownSoundVolume));
    }
  }, []);
  
  // Save sound settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem('soundEnabled', soundEnabled.toString());
    localStorage.setItem('soundVolume', soundVolume.toString());
    localStorage.setItem('notificationsEnabled', notificationsEnabled.toString());
    localStorage.setItem('countdownSoundEnabled', countdownSoundEnabled.toString());
    localStorage.setItem('countdownSoundVolume', countdownSoundVolume.toString());
    
    // Update global sound settings
    soundEffects.setMuted(!soundEnabled);
    soundEffects.setVolume(soundVolume);
    soundEffects.setCountdownMuted(!countdownSoundEnabled);
    soundEffects.setCountdownVolume(countdownSoundVolume);
  }, [soundEnabled, soundVolume, notificationsEnabled, countdownSoundEnabled, countdownSoundVolume]);

  // Handle sound enabled toggle
  const handleSoundEnabledChange = useCallback((enabled: boolean) => {
    setSoundEnabled(enabled);
  }, []);
  
  // Handle sound volume change
  const handleSoundVolumeChange = useCallback((volume: number) => {
    setSoundVolume(volume);
  }, []);
  
  // Handle notifications enabled toggle
  const handleNotificationsEnabledChange = useCallback((enabled: boolean) => {
    setNotificationsEnabled(enabled);
    localStorage.setItem('notificationsEnabled', enabled.toString());
    if (enabled) {
      // Request permission proactively when the user enables the setting
      if ('Notification' in window && Notification.permission !== "granted" && Notification.permission !== "denied") {
        Notification.requestPermission().then(permission => {
          if (permission !== 'granted') {
            // Optionally inform the user if permission was denied
            toast.error("Notification permission denied. Please enable it in browser settings.");
            // Revert the setting if permission wasn't granted? Or leave it enabled but non-functional?
            // setNotificationsEnabled(false); 
            // localStorage.setItem('notificationsEnabled', 'false');
          } else {
            toast.success("Notifications enabled!");
          }
        });
      } else if (Notification.permission === "denied") {
        toast.error("Notification permission previously denied. Please enable it in browser settings.");
        // Prevent enabling if denied?
        // setNotificationsEnabled(false);
        // localStorage.setItem('notificationsEnabled', 'false');
      }
    }
  }, []);

  // Handle countdown sound enabled toggle
  const handleCountdownSoundEnabledChange = useCallback((enabled: boolean) => {
    setCountdownSoundEnabled(enabled);
  }, []);

  // Handle countdown sound volume change
  const handleCountdownSoundVolumeChange = useCallback((volume: number) => {
    setCountdownSoundVolume(volume);
  }, []);

  return (
    <div ref={pageRef} className="min-h-screen bg-[#222] text-white flex flex-col overflow-hidden">
      <Header 
        onSetTimer={handleSetTimer} 
        isRunning={isRunning}
        progress={progress}
        isCountingUp={isCountingUp}
        isOverage={isOverage}
        onOpenSettings={toggleSettings}
      />
      <Toaster position="top-center" />
      
      <main ref={mainRef} className="flex-1 flex items-center justify-center px-4 py-8 mt-2">
        <div className="flex flex-col items-center justify-center w-full mx-auto">
          <Timer 
            isRunning={isRunning} 
            onReset={resetTrigger} 
            initialTime={timerInitialTime}
            onTimeUpdate={setCurrentTime}
            timerName={timerName}
            onNameChange={handleNameChange}
            onOverageChange={handleOverageChange}
          />
        </div>
      </main>
      
      <TimerControls 
        isRunning={isRunning} 
        onPlayPause={handlePlayPause} 
        onReset={handleReset} 
        onSetTimer={handleSetTimer}
        onOpenSettings={toggleSettings}
        customTimerOpen={customTimerOpen}
        onCustomTimerOpenChange={setCustomTimerOpen}
      />
      
      <TimerSettings 
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        onSetTimer={handleSetTimer}
        timerLogs={timerLogs}
        onClearLogs={handleClearLogs}
        onDeleteLog={handleDeleteLog}
        title="Timer Settings"
        soundEnabled={soundEnabled}
        onSoundEnabledChange={handleSoundEnabledChange}
        soundVolume={soundVolume}
        onSoundVolumeChange={handleSoundVolumeChange}
        countdownSoundEnabled={countdownSoundEnabled}
        onCountdownSoundEnabledChange={handleCountdownSoundEnabledChange}
        countdownSoundVolume={countdownSoundVolume}
        onCountdownSoundVolumeChange={handleCountdownSoundVolumeChange}
        notificationsEnabled={notificationsEnabled}
        onNotificationsEnabledChange={handleNotificationsEnabledChange}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
    </div>
  );
};

export default Index;