import React, { useState, useEffect, useMemo } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  X, Clock, Trash2, PlayCircle, PauseCircle, RefreshCw, CheckCircle, 
  PlusCircle, AlertCircle, BarChart3, ChevronDown, ChevronUp, Timer,
  Volume2, VolumeX, Volume1, Bell, ChevronLeft, Settings, XCircle, FileEdit
} from 'lucide-react';
import { TimerLog, TimerEvent } from '@/lib/types';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Slider } from "@/components/ui/slider";

interface TimerSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSetTimer: (hours: number, minutes: number, seconds: number) => void;
  timerLogs?: TimerLog[];
  onClearLogs?: () => void;
  onDeleteLog?: (logId: string) => void;
  onUpdateLogName?: (logId: string, newName: string) => void;
  title?: string;
  // Sound settings props
  soundEnabled?: boolean;
  onSoundEnabledChange?: (enabled: boolean) => void;
  soundVolume?: number;
  onSoundVolumeChange?: (volume: number) => void;
  // Countdown sound settings props
  countdownSoundEnabled?: boolean;
  onCountdownSoundEnabledChange?: (enabled: boolean) => void;
  countdownSoundVolume?: number;
  onCountdownSoundVolumeChange?: (volume: number) => void;
  // Notification settings props
  notificationsEnabled?: boolean;
  onNotificationsEnabledChange?: (enabled: boolean) => void;
  // Tab control
  activeTab?: string;
  setActiveTab?: React.Dispatch<React.SetStateAction<string>>;
}

const TimerSettings: React.FC<TimerSettingsProps> = ({ 
  open, 
  onOpenChange,
  onSetTimer,
  timerLogs = [],
  onClearLogs,
  onDeleteLog,
  onUpdateLogName,
  title = "Timer Settings",
  // Sound settings with defaults
  soundEnabled = true,
  onSoundEnabledChange = () => {},
  soundVolume = 0.8,
  onSoundVolumeChange = () => {},
  // Countdown sound settings with defaults
  countdownSoundEnabled = true,
  onCountdownSoundEnabledChange = () => {},
  countdownSoundVolume = 0.8,
  onCountdownSoundVolumeChange = () => {},
  // Notification settings with defaults
  notificationsEnabled = false,
  onNotificationsEnabledChange = () => {},
  // Tab control
  activeTab = "custom",
  setActiveTab = () => {}
}) => {
  const [hours, setHours] = useState<number>(0);
  const [minutes, setMinutes] = useState<number>(0);
  const [seconds, setSeconds] = useState<number>(0);
  const [expandedLogs, setExpandedLogs] = useState<Record<string, boolean>>({});
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string>('');
  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  
  // Set active tab based on props or URL
  useEffect(() => {
    // If opened directly to logs, switch to logs tab
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get('tab') === 'logs') {
      setActiveTab('logs');
    }
  }, []);

  const handleApplySettings = () => {
    onSetTimer(hours, minutes, seconds);
    onOpenChange(false);
  };

  // Format seconds into HH:MM:SS
  const formatTime = (totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // Format seconds into human-readable time
  const formatHumanTime = (totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    const parts = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);
    
    return parts.join(' ');
  };
  
  // Format date into readable string
  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleString();
  };

  // Format short time
  const formatShortTime = (date: Date): string => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Get time elapsed between two dates
  const getTimeElapsed = (start: Date, end: Date): string => {
    const diffInSeconds = Math.round((end.getTime() - start.getTime()) / 1000);
    return formatTime(diffInSeconds);
  };
  
  // Toggle expanded state for a log
  const toggleExpandLog = (logId: string) => {
    setExpandedLogs(prev => ({
      ...prev,
      [logId]: !prev[logId]
    }));
  };

  // Handle selecting a log for detailed view
  const handleSelectLog = (logId: string) => {
    setSelectedLogId(selectedLogId === logId ? null : logId);
  };

  // Get event icon based on event type
  const getEventIcon = (eventType: TimerEvent['type']) => {
    switch (eventType) {
      case 'start':
        return <PlayCircle className="w-4 h-4 text-green-400" />;
      case 'pause':
        return <PauseCircle className="w-4 h-4 text-yellow-400" />;
      case 'resume':
        return <PlayCircle className="w-4 h-4 text-blue-400" />;
      case 'reset':
        return <RefreshCw className="w-4 h-4 text-red-400" />;
      case 'complete':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'add-time':
        return <PlusCircle className="w-4 h-4 text-blue-500" />;
      case 'overage-start':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'set-timer':
        return <Clock className="w-4 h-4 text-purple-400" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  // Get event background color based on event type
  const getEventColor = (eventType: TimerEvent['type']): string => {
    switch (eventType) {
      case 'start':
        return 'bg-green-500/10 border-green-500/30';
      case 'pause':
        return 'bg-yellow-500/10 border-yellow-500/30';
      case 'resume':
        return 'bg-blue-500/10 border-blue-500/30';
      case 'reset':
        return 'bg-red-500/10 border-red-500/30';
      case 'complete':
        return 'bg-green-600/10 border-green-600/30';
      case 'add-time':
        return 'bg-blue-400/10 border-blue-400/30';
      case 'overage-start':
        return 'bg-red-600/10 border-red-600/30';
      case 'set-timer':
        return 'bg-purple-500/10 border-purple-500/30';
      default:
        return 'bg-white/5 border-white/10';
    }
  };

  // Format event type for display
  const formatEventType = (eventType: TimerEvent['type']): string => {
    switch (eventType) {
      case 'start':
        return 'Started';
      case 'pause':
        return 'Paused';
      case 'resume':
        return 'Resumed';
      case 'reset':
        return 'Reset';
      case 'complete':
        return 'Completed';
      case 'add-time':
        return 'Added Time';
      case 'overage-start':
        return 'Overage Started';
      case 'set-timer':
        return 'Timer Set';
      default:
        // This handles the 'never' type case with a type assertion
        const type = eventType as string;
        return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };
  
  // Calculate total statistics for all logs
  const logStats = useMemo(() => {
    const validLogs = Array.isArray(timerLogs) ? timerLogs : [];
    
    const totalTimers = validLogs.length;
    const completedTimers = validLogs.filter(log => log.completed && !log.canceled).length;
    const canceledTimers = validLogs.filter(log => log.canceled).length;
    const overageTimers = validLogs.filter(log => log.overageTime > 0).length;
    
    const totalPlannedTime = validLogs.reduce((sum, log) => sum + log.initialDuration, 0);
    const totalActualTime = validLogs.reduce((sum, log) => sum + log.actualDuration, 0);
    const totalOverageTime = validLogs.reduce((sum, log) => sum + log.overageTime, 0);
    const totalPauseTime = validLogs.reduce((sum, log) => sum + (log.totalPauseDuration || 0), 0);
    
    const averageEfficiency = validLogs.filter(log => log.analysis?.efficiency !== undefined)
      .reduce((sum, log) => sum + (log.analysis?.efficiency || 0), 0) / 
      validLogs.filter(log => log.analysis?.efficiency !== undefined).length || 0;
    
    return {
      totalTimers,
      completedTimers,
      canceledTimers,
      overageTimers,
      totalPlannedTime,
      totalActualTime,
      totalOverageTime,
      totalPauseTime,
      averageEfficiency
    };
  }, [timerLogs]);
  
  // Ensure timerLogs is always an array, even if undefined
  const validTimerLogs = Array.isArray(timerLogs) ? timerLogs : [];
  
  // Get selected log
  const selectedLog = useMemo(() => {
    if (!selectedLogId) return null;
    return validTimerLogs.find(log => log.id === selectedLogId) || null;
  }, [selectedLogId, validTimerLogs]);

  // Format volume for display
  const formatVolumePercent = (volume: number): string => {
    return `${Math.round(volume * 100)}%`;
  };

  // Get volume icon based on volume level
  const getVolumeIcon = () => {
    if (!soundEnabled) return <VolumeX className="w-5 h-5" />;
    if (soundVolume < 0.3) return <Volume1 className="w-5 h-5" />;
    return <Volume2 className="w-5 h-5" />;
  };

  // Get countdown volume icon based on volume level
  const getCountdownVolumeIcon = () => {
    if (!countdownSoundEnabled) return <VolumeX className="w-5 h-5" />;
    if (countdownSoundVolume < 0.3) return <Volume1 className="w-5 h-5" />;
    return <Volume2 className="w-5 h-5" />;
  };

  // Function to handle starting the name edit
  const handleStartEditName = (currentName: string) => {
    setEditingName(currentName);
    setIsEditingName(true);
  };
  
  // Function to handle saving the edited name
  const handleSaveEditName = (logId: string) => {
    if (onUpdateLogName && editingName.trim() !== '') {
      onUpdateLogName(logId, editingName.trim());
    }
    setIsEditingName(false);
  };
  
  // Function to handle canceling the name edit
  const handleCancelEditName = () => {
    setIsEditingName(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="bg-[#1A1A1A] text-white border-none max-w-md w-full overflow-y-auto p-0" hideCloseButton>
        <div className="bg-[#1A1A1A] px-6 py-4 border-b border-white/5">
          <SheetHeader className="mb-0">
            <div className="flex justify-between items-center">
              <SheetTitle className="text-white text-lg flex items-center gap-2">
                <Settings className="w-5 h-5 text-white/70" />
                {title}
              </SheetTitle>
              <button 
                onClick={() => onOpenChange(false)}
                className="text-white/60 hover:text-white p-1.5 hover:bg-white/5 rounded-full transition-colors"
                aria-label="Close settings"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </SheetHeader>
        </div>

        <div className="px-5 py-5 space-y-5">
          <Tabs 
            defaultValue="custom" 
            value={activeTab} 
            onValueChange={setActiveTab} 
            className="w-full"
          >
            <TabsList className="grid grid-cols-2 bg-black/20 rounded-full p-0.5 mb-5 w-full">
              <TabsTrigger 
                value="custom" 
                onClick={() => setActiveTab("custom")}
                className="rounded-full py-1.5 text-white/60 data-[state=active]:bg-white/10 data-[state=active]:text-white transition-all"
              >
                <Clock className="w-4 h-4 mr-2" />
                Settings
              </TabsTrigger>
              
              <TabsTrigger 
                value="logs" 
                onClick={() => setActiveTab("logs")}
                className="rounded-full py-1.5 text-white/60 data-[state=active]:bg-white/10 data-[state=active]:text-white transition-all"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Timer Analytics
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="custom" className="space-y-5">
              <div className="bg-black/20 p-5 rounded-lg space-y-5">
                <h3 className="text-base font-normal flex items-center gap-2 text-white/90">
                  <Timer className="w-4 h-4 text-white/50" />
                  <span>Custom Timer</span>
                </h3>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="hours" className="text-white/50 text-sm">Hours</label>
                    <input 
                      id="hours"
                      type="number" 
                      min="0"
                      max="23"
                      value={hours}
                      onChange={(e) => setHours(Number(e.target.value))}
                      className="w-full bg-black/30 border border-white/5 rounded-md px-3 py-2 text-white focus:outline-none focus:border-white/20 transition-colors"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="minutes" className="text-white/50 text-sm">Minutes</label>
                    <input 
                      id="minutes"
                      type="number" 
                      min="0"
                      max="59"
                      value={minutes}
                      onChange={(e) => setMinutes(Number(e.target.value))}
                      className="w-full bg-black/30 border border-white/5 rounded-md px-3 py-2 text-white focus:outline-none focus:border-white/20 transition-colors"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="seconds" className="text-white/50 text-sm">Seconds</label>
                    <input 
                      id="seconds"
                      type="number" 
                      min="0"
                      max="59"
                      value={seconds}
                      onChange={(e) => setSeconds(Number(e.target.value))}
                      className="w-full bg-black/30 border border-white/5 rounded-md px-3 py-2 text-white focus:outline-none focus:border-white/20 transition-colors"
                    />
                  </div>
                </div>

                <button 
                  onClick={handleApplySettings}
                  className="w-full mt-2 py-2 bg-black/30 hover:bg-black/40 border border-white/5 rounded-md transition-colors font-normal flex items-center justify-center gap-2 text-white/80"
                >
                  <Clock className="w-4 h-4" />
                  Set Timer
                </button>
              </div>

              <div className="bg-black/20 p-5 rounded-lg space-y-5">
                <h3 className="text-base font-normal flex items-center gap-2 text-white/90">
                  <Volume2 className="w-4 h-4 text-white/50" />
                  <span>Audio Settings</span>
                </h3>
                
                <div className="space-y-4">
                  <div className="bg-black/30 rounded-md p-3 space-y-4">
                    <div className="flex justify-between items-center">
                      <label className="inline-flex items-center space-x-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="rounded bg-black/50 border-white/10 w-4 h-4 accent-white/20 focus:ring-0 focus:ring-offset-0"
                          checked={soundEnabled}
                          onChange={(e) => onSoundEnabledChange(e.target.checked)}
                        />
                        <span className="text-white/80">System sounds</span>
                      </label>
                      <div className="text-white/60">
                        <button 
                          onClick={() => onSoundEnabledChange(!soundEnabled)}
                          className="p-1.5 rounded-full hover:bg-black/20 cursor-pointer"
                          aria-label={soundEnabled ? "Mute system sounds" : "Unmute system sounds"}
                        >
                          {getVolumeIcon()}
                        </button>
                      </div>
                    </div>
                    
                    {soundEnabled && (
                      <div className="pl-6 space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-white/50">Volume</span>
                          <span className="text-xs text-white/50">{formatVolumePercent(soundVolume)}</span>
                        </div>
                        <Slider
                          defaultValue={[soundVolume * 100]}
                          max={100}
                          step={5}
                          onValueChange={(values) => onSoundVolumeChange(values[0] / 100)}
                          className="w-full"
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="bg-black/30 rounded-md p-3 space-y-4">
                    <div className="flex justify-between items-center">
                      <label className="inline-flex items-center space-x-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="rounded bg-black/50 border-white/10 w-4 h-4 accent-white/20 focus:ring-0 focus:ring-offset-0"
                          checked={countdownSoundEnabled}
                          onChange={(e) => onCountdownSoundEnabledChange(e.target.checked)}
                        />
                        <span className="text-white/80">Countdown sounds</span>
                      </label>
                      <div className="text-white/60">
                        <button 
                          onClick={() => onCountdownSoundEnabledChange(!countdownSoundEnabled)}
                          className="p-1.5 rounded-full hover:bg-black/20 cursor-pointer"
                          aria-label={countdownSoundEnabled ? "Mute countdown sounds" : "Unmute countdown sounds"}
                        >
                          {getCountdownVolumeIcon()}
                        </button>
                      </div>
                    </div>
                    
                    {countdownSoundEnabled && (
                      <div className="pl-6 space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-white/50">Volume</span>
                          <span className="text-xs text-white/50">{formatVolumePercent(countdownSoundVolume)}</span>
                        </div>
                        <Slider
                          defaultValue={[countdownSoundVolume * 100]}
                          max={100}
                          step={5}
                          onValueChange={(values) => onCountdownSoundVolumeChange(values[0] / 100)}
                          className="w-full"
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="bg-black/30 rounded-md p-3">
                    <label className="inline-flex items-center space-x-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="rounded bg-black/50 border-white/10 w-4 h-4 accent-white/20 focus:ring-0 focus:ring-offset-0"
                        checked={notificationsEnabled}
                        onChange={(e) => onNotificationsEnabledChange(e.target.checked)}
                      />
                      <span className="flex items-center gap-2 text-white/80">
                        <Bell className="w-4 h-4 text-white/50" />
                        <span>Show notifications</span>
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="logs" className="space-y-5">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-base font-normal flex items-center gap-2 text-white/90">
                  <BarChart3 className="w-4 h-4 text-white/50" />
                  {selectedLog ? selectedLog.timerName : "Timer Analytics"}
                </h3>
                {validTimerLogs.length > 0 && !selectedLog && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button 
                        onClick={onClearLogs}
                        className="p-1.5 text-white/50 hover:text-white hover:bg-white/5 rounded-full transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Clear all logs</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>

              {/* Show back button when viewing timer details */}
              {selectedLog && (
                <button 
                  onClick={() => setSelectedLogId(null)}
                  className="flex items-center text-sm text-white/50 hover:text-white transition-colors mb-4 bg-black/30 px-3 py-1.5 rounded-md"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Back to Timer List
                </button>
              )}

              {/* Empty state */}
              {validTimerLogs.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-white/50 bg-black/20 p-4 rounded-lg">
                  <Clock className="w-12 h-12 mb-4 opacity-30" />
                  <p className="text-center">No timer logs yet.</p>
                  <p className="text-center text-sm mt-1">Start a timer to track your time.</p>
                </div>
              )}

              {/* Overall statistics - only show when no timer is selected */}
              {validTimerLogs.length > 0 && !selectedLog && (
                <div className="bg-black/20 p-4 rounded-lg mb-4">
                  <h4 className="text-sm font-normal mb-3 text-white/70 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Overall Timer Statistics
                  </h4>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                    <div>
                      <p className="text-white/50 text-xs">Total Timers</p>
                      <p className="font-normal">{logStats.totalTimers}</p>
                    </div>
                    <div>
                      <p className="text-white/50 text-xs">Completed</p>
                      <p className="font-normal text-green-400">{logStats.completedTimers}</p>
                    </div>
                    <div>
                      <p className="text-white/50 text-xs">Canceled</p>
                      <p className="font-normal text-yellow-400">{logStats.canceledTimers}</p>
                    </div>
                    <div>
                      <p className="text-white/50 text-xs">Over Time</p>
                      <p className="font-normal text-red-400">{logStats.overageTimers}</p>
                    </div>
                    <div className="col-span-2 pt-1 border-t border-white/5">
                      <p className="text-white/50 text-xs">Total Planned Time</p>
                      <p className="font-normal">{formatHumanTime(logStats.totalPlannedTime)}</p>
                    </div>
                    <div>
                      <p className="text-white/50 text-xs">Total Actual Time</p>
                      <p className="font-normal">{formatHumanTime(logStats.totalActualTime)}</p>
                    </div>
                    <div>
                      <p className="text-white/50 text-xs">Total Paused Time</p>
                      <p className="font-normal text-blue-400">{formatHumanTime(logStats.totalPauseTime)}</p>
                    </div>
                    {logStats.totalOverageTime > 0 && (
                      <div className="col-span-2">
                        <p className="text-white/50 text-xs">Total Overage Time</p>
                        <p className="font-normal text-red-400">{formatHumanTime(logStats.totalOverageTime)}</p>
                      </div>
                    )}
                    {logStats.averageEfficiency > 0 && (
                      <div className="col-span-2">
                        <p className="text-white/50 text-xs">Average Efficiency</p>
                        <p className="font-normal text-blue-400">{logStats.averageEfficiency.toFixed(1)}%</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Timer list - only show when no timer is selected */}
              {validTimerLogs.length > 0 && !selectedLog && (
                <div className="space-y-2">
                  {validTimerLogs.slice().reverse().map((log) => (
                    <div 
                      key={log.id} 
                      className={`p-3 rounded-lg transition-colors hover:bg-black/30 bg-black/20 border ${
                        log.canceled ? 'border-yellow-500/20' :
                        log.overageTime > 0 ? 'border-red-500/20' :
                        'border-green-500/20'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <h4 className="font-normal flex items-center cursor-pointer" onClick={() => handleSelectLog(log.id)}>
                          <Timer className="w-4 h-4 mr-2 opacity-50" />
                          {log.timerName}
                        </h4>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            log.canceled ? 'bg-yellow-500/10 text-yellow-300' :
                            log.overageTime > 0 ? 'bg-red-500/10 text-red-300' :
                            'bg-green-500/10 text-green-300'
                          }`}>
                            {log.canceled ? 'Canceled' : log.overageTime > 0 ? 'Over Time' : 'Completed'}
                          </span>
                          {onDeleteLog && (
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteLog(log.id);
                              }}
                              className="text-white/40 hover:text-white/70 p-1 hover:bg-black/30 rounded-full transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 mt-2 text-sm cursor-pointer" onClick={() => handleSelectLog(log.id)}>
                        <div>
                          <p className="text-white/50 text-xs">Set / Actual</p>
                          <p className="font-normal font-mono text-sm">
                            {formatTime(log.initialDuration)} / {formatTime(log.actualDuration)}
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-white/50 text-xs">Events</p>
                          <div className="flex gap-1 mt-1">
                            {Array.from(new Set(log.events.map(e => e.type))).slice(0, 4).map((type, i) => (
                              <div key={i} className="w-4 h-4">{getEventIcon(type)}</div>
                            ))}
                            {log.events.length > 4 && <span className="text-xs text-white/40">+{log.events.length - 4}</span>}
                          </div>
                        </div>
                      </div>

                      <div className="col-span-2 mt-1 text-xs text-white/40 flex justify-between">
                        <span>{formatDate(log.startTime).split(',')[0]}</span>
                        <span>{log.analysis?.efficiency ? `${log.analysis.efficiency.toFixed(0)}% efficient` : ''}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Timer detail view - only show when a timer is selected */}
              {selectedLog && (
                <div 
                  className={`p-4 rounded-lg ${
                    selectedLog.canceled ? 'bg-black/20 border border-yellow-500/20' : 
                    selectedLog.overageTime > 0 ? 'bg-black/20 border border-red-500/20' : 
                    'bg-black/20 border border-green-500/20'
                  }`}
                >
                  <div className="flex justify-between items-center mb-4">
                    {isEditingName ? (
                      <div className="w-full">
                        <div className="flex flex-col gap-3 w-full">
                          <input
                            type="text"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            className="bg-black/30 border border-white/10 rounded-md px-3 py-2.5 text-base font-normal w-full focus:outline-none focus:border-white/30"
                            autoFocus
                            placeholder="Timer name"
                          />
                          <div className="flex items-center gap-3 justify-end">
                            <span className={`text-xs px-2 py-0.5 rounded-full ml-auto ${
                              selectedLog.canceled ? 'bg-yellow-500/10 text-yellow-300' :
                              selectedLog.overageTime > 0 ? 'bg-red-500/10 text-red-300' :
                              'bg-green-500/10 text-green-300'
                            }`}>
                              {selectedLog.canceled ? 'Canceled' : selectedLog.overageTime > 0 ? 'Over Time' : 'Completed'}
                            </span>
                            
                            <button 
                              onClick={() => handleSaveEditName(selectedLog.id)}
                              className="bg-white/10 hover:bg-white/20 text-white rounded-md px-4 py-2 text-sm font-medium transition-colors min-w-[80px]"
                            >
                              Save
                            </button>
                            <button 
                              onClick={handleCancelEditName}
                              className="bg-black/30 hover:bg-black/40 text-white/70 rounded-md px-4 py-2 text-sm font-medium transition-colors min-w-[80px]"
                            >
                              Cancel
                            </button>
                            
                            {onDeleteLog && (
                              <button 
                                onClick={() => {
                                  onDeleteLog(selectedLog.id);
                                  setSelectedLogId(null);
                                }}
                                className="text-white/40 hover:text-white/70 p-2 hover:bg-black/30 rounded-full transition-colors"
                                title="Delete timer log"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-normal">{selectedLog.timerName}</h3>
                        <button 
                          onClick={() => handleStartEditName(selectedLog.timerName)}
                          className="text-white/40 hover:text-white/70 p-1 hover:bg-black/30 rounded-full transition-colors"
                          title="Edit timer name"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 20h9"></path>
                            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="text-xs text-white/60 mb-4 bg-black/30 p-2 rounded-lg">
                    <div className="flex justify-between">
                      <span>Started: {formatDate(selectedLog.startTime)}</span>
                      <span>Ended: {formatDate(selectedLog.endTime)}</span>
                    </div>
                    <div className="mt-1">
                      Total Duration: {getTimeElapsed(selectedLog.startTime, selectedLog.endTime)}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-black/30 p-3 rounded-lg">
                      <p className="text-white/70 text-xs">Set Time</p>
                      <p className="text-lg font-mono font-medium">{formatTime(selectedLog.initialDuration)}</p>
                    </div>
                    <div className="bg-black/30 p-3 rounded-lg">
                      <p className="text-white/70 text-xs">Actual Time</p>
                      <p className="text-lg font-mono font-medium">{formatTime(selectedLog.actualDuration)}</p>
                    </div>
                  </div>

                  {selectedLog.analysis && (
                    <div className="bg-black/30 p-3 rounded-lg mb-4">
                      <h4 className="flex items-center gap-1 mb-2 text-white/80 font-medium">
                        <BarChart3 className="w-4 h-4" />
                        Analytics
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-blue-400 text-xs">Initial Time</p>
                          <p className="font-mono">{formatTime(selectedLog.analysis.initialCountdownTime)}</p>
                        </div>
                        <div>
                          <p className="text-blue-400 text-xs">Actual Time</p>
                          <p className="font-mono">{formatTime(selectedLog.analysis.actualTimeSpent)}</p>
                        </div>
                        <div>
                          <p className="text-blue-400 text-xs">Active Time</p>
                          <p className="font-mono">{formatTime(selectedLog.analysis.totalActiveTime)}</p>
                        </div>
                        <div>
                          <p className="text-blue-400 text-xs">Paused Time</p>
                          <p className="font-mono">{formatTime(selectedLog.totalPauseDuration)}</p>
                        </div>
                        {selectedLog.analysis.averagePauseDuration !== undefined && (
                          <div>
                            <p className="text-blue-400 text-xs">Avg Pause</p>
                            <p className="font-mono">{formatTime(selectedLog.analysis.averagePauseDuration)}</p>
                          </div>
                        )}
                        {selectedLog.analysis.efficiency !== undefined && (
                          <div>
                            <p className="text-blue-400 text-xs">Efficiency</p>
                            <p className="font-mono">{selectedLog.analysis.efficiency.toFixed(1)}%</p>
                          </div>
                        )}
                        {selectedLog.analysis.overagePercentage !== undefined && (
                          <div>
                            <p className="text-red-400 text-xs">Overage %</p>
                            <p className="font-mono">{selectedLog.analysis.overagePercentage.toFixed(1)}%</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {selectedLog.pauseCount > 0 && (
                    <div className="bg-black/30 p-3 rounded-lg mb-4">
                      <h4 className="flex items-center gap-1 mb-2 text-white/80 font-medium">
                        <PauseCircle className="w-4 h-4 text-blue-400" />
                        Pause Details
                      </h4>
                      <div className="text-sm">
                        <p>
                          Paused {selectedLog.pauseCount} {selectedLog.pauseCount === 1 ? 'time' : 'times'} 
                          for a total of {formatTime(selectedLog.totalPauseDuration)}
                        </p>
                        
                        {selectedLog.pauseDetails && selectedLog.pauseDetails.length > 0 && (
                          <div className="mt-2 space-y-2">
                            <p className="text-white/70 text-xs">Individual Pauses:</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {selectedLog.pauseDetails.map((pause, idx) => (
                                <div key={idx} className="bg-blue-500/10 border border-blue-500/20 rounded-md p-2 text-xs">
                                  <div className="flex justify-between">
                                    <span className="text-white/70">Pause {idx + 1}</span>
                                    <span className="text-blue-400 font-mono">
                                      {pause.duration ? formatTime(pause.duration) : 'Unknown'}
                                    </span>
                                  </div>
                                  <div className="text-white/50 mt-1">
                                    {formatShortTime(pause.startTime)} - {pause.endTime ? formatShortTime(pause.endTime) : 'End'}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {selectedLog.overageTime > 0 && (
                    <div className="flex items-center bg-red-500/10 p-2 rounded-lg border border-red-500/20 mb-4">
                      <AlertCircle className="w-4 h-4 text-red-400 mr-2" />
                      <p className="text-sm text-red-400">
                        Went over by {formatTime(selectedLog.overageTime)}
                      </p>
                    </div>
                  )}

                  {/* Timer Status/Outcome */}
                  <div className="flex items-center mb-4">
                    <div className={`rounded-full px-3 py-1 text-sm font-medium flex items-center gap-1 ${
                      selectedLog.outcome === 'completed' ? 'bg-green-500/20 text-green-400' :
                      selectedLog.outcome === 'cancelled' ? 'bg-yellow-500/20 text-yellow-400' :
                      selectedLog.outcome === 'scrapped' ? 'bg-red-500/20 text-red-400' :
                      selectedLog.outcome === 'other' ? 'bg-blue-500/20 text-blue-400' :
                      selectedLog.completed ? 'bg-green-500/20 text-green-400' :
                      selectedLog.canceled ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-white/20 text-white/70'
                    }`}>
                      {selectedLog.outcome === 'completed' || (!selectedLog.outcome && selectedLog.completed) ? (
                        <>
                          <CheckCircle className="w-3 h-3" /> 
                          <span>Completed</span>
                        </>
                      ) : selectedLog.outcome === 'cancelled' || (!selectedLog.outcome && selectedLog.canceled) ? (
                        <>
                          <XCircle className="w-3 h-3" /> 
                          <span>Cancelled</span>
                        </>
                      ) : selectedLog.outcome === 'scrapped' ? (
                        <>
                          <Trash2 className="w-3 h-3" /> 
                          <span>Scrapped</span>
                        </>
                      ) : selectedLog.outcome === 'other' ? (
                        <>
                          <FileEdit className="w-3 h-3" /> 
                          <span>Other</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-3 h-3" />
                          <span>Unspecified</span>
                        </>
                      )}
                    </div>
                    
                    {selectedLog.outcomeNote && (
                      <div className="ml-2 px-3 py-1 bg-white/10 rounded-full text-xs text-white/70">
                        Note: {selectedLog.outcomeNote}
                      </div>
                    )}
                  </div>

                  <div className="mt-4">
                    <h4 className="flex items-center gap-2 mb-3 text-white/80 font-medium">
                      <Clock className="w-4 h-4" />
                      Timeline of Events
                    </h4>
                    
                    <div className="relative pl-6 border-l border-white/20 space-y-4">
                      {selectedLog.events.map((event, index) => (
                        <div key={index} className="relative">
                          <div className="absolute left-0 top-0 w-5 h-5 -ml-[13px] flex items-center justify-center rounded-full bg-timer-background border border-white/20">
                            {getEventIcon(event.type)}
                          </div>
                          
                          <div className={`rounded-lg p-3 ml-2 border ${getEventColor(event.type)}`}>
                            <div className="flex justify-between items-start">
                              <p className="font-medium">{formatEventType(event.type)}</p>
                              <p className="text-xs text-white/60 bg-black/20 px-1.5 py-0.5 rounded-full">{formatShortTime(event.timestamp)}</p>
                            </div>
                            
                            <div className="mt-1 text-sm">
                              {event.timeData && (
                                <p className="text-white/70 text-xs">
                                  Time: {event.timeData.hours}h {event.timeData.minutes}m {event.timeData.seconds}s
                                </p>
                              )}
                              
                              {event.duration && (
                                <p className="text-blue-400 text-xs">
                                  Added: {Math.floor(event.duration / 3600)}h {Math.floor((event.duration % 3600) / 60)}m {event.duration % 60}s
                                </p>
                              )}
                              
                              {event.type === 'resume' && event.pauseDuration && (
                                <p className="text-blue-400 text-xs">
                                  Paused for: {formatTime(event.pauseDuration)}
                                </p>
                              )}
                              
                              {event.notes && (
                                <p className="text-white/80 text-xs mt-1">{event.notes}</p>
                              )}
                              
                              {index > 0 && (
                                <p className="text-white/40 text-xs mt-1">
                                  {getTimeElapsed(selectedLog.events[index-1].timestamp, event.timestamp)} after previous
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default TimerSettings;
