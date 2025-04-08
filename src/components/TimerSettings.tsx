import React, { useState, useEffect, useMemo } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  X, Clock, Trash2, PlayCircle, PauseCircle, RefreshCw, CheckCircle, 
  PlusCircle, AlertCircle, BarChart3, ChevronDown, ChevronUp, Timer,
  Volume2, VolumeX, Volume1, Bell, ChevronLeft
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
}

const TimerSettings: React.FC<TimerSettingsProps> = ({ 
  open, 
  onOpenChange,
  onSetTimer,
  timerLogs = [],
  onClearLogs,
  onDeleteLog,
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
  onNotificationsEnabledChange = () => {}
}) => {
  const [hours, setHours] = useState<number>(0);
  const [minutes, setMinutes] = useState<number>(0);
  const [seconds, setSeconds] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<string>("custom");
  const [expandedLogs, setExpandedLogs] = useState<Record<string, boolean>>({});
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
  
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

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="bg-timer-background text-timer-text border-timer-background max-w-md w-full overflow-y-auto">
        <SheetHeader className="border-b border-white/10 pb-4">
          <div className="flex justify-between items-center">
            <SheetTitle className="text-white text-xl">{title}</SheetTitle>
            <button 
              onClick={() => onOpenChange(false)}
              className="rounded-full p-1 hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </SheetHeader>

        <Tabs 
          defaultValue="custom" 
          value={activeTab} 
          onValueChange={setActiveTab} 
          className="mt-6"
        >
          <TabsList className="grid grid-cols-2 bg-black/30 rounded-xl p-1 mb-6">
            <Tooltip>
              <TooltipTrigger asChild>
                <TabsTrigger 
                  value="custom" 
                  onClick={() => setActiveTab("custom")}
                  className="rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:shadow"
                >
                  Custom Timer
                </TabsTrigger>
              </TooltipTrigger>
              <TooltipContent className="bg-[#2A2A2A] text-white border-[#333333]">
                <p>Set custom timer values</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <TabsTrigger 
                  value="logs" 
                  onClick={() => setActiveTab("logs")}
                  className="rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:shadow"
                >
                  Timer Analytics
                </TabsTrigger>
              </TooltipTrigger>
              <TooltipContent className="bg-[#2A2A2A] text-white border-[#333333]">
                <p>Press 'A' to view your long history of procrastination</p>
              </TooltipContent>
            </Tooltip>
          </TabsList>
          
          <TabsContent value="custom" className="space-y-6">
            <div className="space-y-4 bg-black/20 p-5 rounded-xl border border-white/5">
              <h3 className="text-lg font-medium">Set Custom Timer</h3>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label htmlFor="hours" className="text-sm text-white/70">Hours</label>
                  <input 
                    id="hours"
                    type="number" 
                    min="0"
                    max="23"
                    value={hours}
                    onChange={(e) => setHours(Number(e.target.value))}
                    className="w-full bg-white/10 border border-white/20 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white/30"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="minutes" className="text-sm text-white/70">Minutes</label>
                  <input 
                    id="minutes"
                    type="number" 
                    min="0"
                    max="59"
                    value={minutes}
                    onChange={(e) => setMinutes(Number(e.target.value))}
                    className="w-full bg-white/10 border border-white/20 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white/30"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="seconds" className="text-sm text-white/70">Seconds</label>
                  <input 
                    id="seconds"
                    type="number" 
                    min="0"
                    max="59"
                    value={seconds}
                    onChange={(e) => setSeconds(Number(e.target.value))}
                    className="w-full bg-white/10 border border-white/20 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white/30"
                  />
                </div>
              </div>

              <button 
                onClick={handleApplySettings}
                className="w-full mt-4 py-3 bg-white/20 hover:bg-white/30 rounded-md transition-colors font-medium"
              >
                Apply Settings
              </button>
            </div>

            <div className="space-y-5 pt-4 bg-black/20 p-5 rounded-xl border border-white/5">
              <h3 className="text-lg font-medium">Timer Appearance</h3>
              
              <div className="space-y-6">
                {/* System sound settings */}
                <div className="space-y-5">
                  <div className="flex justify-between items-center">
                    <label className="inline-flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        className="rounded bg-white/10 border-white/20 w-4 h-4"
                        checked={soundEnabled}
                        onChange={(e) => onSoundEnabledChange(e.target.checked)}
                      />
                      <span>System sounds</span>
                    </label>
                    {getVolumeIcon()}
                  </div>
                  
                  {soundEnabled && (
                    <div className="pl-6 space-y-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-white/70">Volume</span>
                        <span className="text-sm text-white/70">{formatVolumePercent(soundVolume)}</span>
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
                
                {/* Countdown sound settings */}
                <div className="space-y-5 border-t border-white/10 pt-5">
                  <div className="flex justify-between items-center">
                    <label className="inline-flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        className="rounded bg-white/10 border-white/20 w-4 h-4"
                        checked={countdownSoundEnabled}
                        onChange={(e) => onCountdownSoundEnabledChange(e.target.checked)}
                      />
                      <span>Countdown sounds</span>
                    </label>
                    {getCountdownVolumeIcon()}
                  </div>
                  
                  {countdownSoundEnabled && (
                    <div className="pl-6 space-y-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-white/70">Volume</span>
                        <span className="text-sm text-white/70">{formatVolumePercent(countdownSoundVolume)}</span>
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
                
                {/* Notification settings */}
                <div className="border-t border-white/10 pt-5">
                  <label className="inline-flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      className="rounded bg-white/10 border-white/20 w-4 h-4"
                      checked={notificationsEnabled}
                      onChange={(e) => onNotificationsEnabledChange(e.target.checked)}
                    />
                    <span className="flex items-center gap-2">
                      <Bell className="w-4 h-4 opacity-70" />
                      <span>Show notifications</span>
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="logs" className="space-y-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Timer Analytics
              </h3>
              {validTimerLogs.length > 0 && (
                <button 
                  onClick={onClearLogs}
                  className="p-2 text-white/70 hover:text-white/90 hover:bg-white/10 rounded-md"
                  title="Clear all logs"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Overall Analytics Summary */}
            {validTimerLogs.length > 0 && !selectedLog && (
              <div className="bg-white/5 rounded-lg p-4 border border-white/10 mb-4">
                <h4 className="text-sm font-medium mb-3 text-white/80 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Overall Timer Statistics
                </h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                  <div>
                    <p className="text-white/60">Total Timers</p>
                    <p className="font-medium">{logStats.totalTimers}</p>
                  </div>
                  <div>
                    <p className="text-white/60">Completed</p>
                    <p className="font-medium text-green-400">{logStats.completedTimers}</p>
                  </div>
                  <div>
                    <p className="text-white/60">Canceled</p>
                    <p className="font-medium text-yellow-400">{logStats.canceledTimers}</p>
                  </div>
                  <div>
                    <p className="text-white/60">Over Time</p>
                    <p className="font-medium text-red-400">{logStats.overageTimers}</p>
                  </div>
                  <div className="col-span-2 pt-1 border-t border-white/10">
                    <p className="text-white/60">Total Planned Time</p>
                    <p className="font-medium">{formatHumanTime(logStats.totalPlannedTime)}</p>
                  </div>
                  <div>
                    <p className="text-white/60">Total Actual Time</p>
                    <p className="font-medium">{formatHumanTime(logStats.totalActualTime)}</p>
                  </div>
                  <div>
                    <p className="text-white/60">Total Paused Time</p>
                    <p className="font-medium text-blue-400">{formatHumanTime(logStats.totalPauseTime)}</p>
                  </div>
                  {logStats.totalOverageTime > 0 && (
                    <div className="col-span-2">
                      <p className="text-white/60">Total Overage Time</p>
                      <p className="font-medium text-red-400">{formatHumanTime(logStats.totalOverageTime)}</p>
                    </div>
                  )}
                  {logStats.averageEfficiency > 0 && (
                    <div className="col-span-2">
                      <p className="text-white/60">Average Efficiency</p>
                      <p className="font-medium text-blue-400">{logStats.averageEfficiency.toFixed(1)}%</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Back button for detailed view */}
            {selectedLog && (
              <button 
                onClick={() => setSelectedLogId(null)}
                className="flex items-center text-sm text-white/70 hover:text-white transition-colors mb-2"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back to Timer List
              </button>
            )}
            
            {validTimerLogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-white/50">
                <Clock className="w-12 h-12 mb-4 opacity-50" />
                <p className="text-center">No timer logs yet.</p>
                <p className="text-center text-sm mt-1">Start a timer to track your time.</p>
              </div>
            ) : selectedLog ? (
              // Detailed log view
              <div 
                className={`p-4 rounded-lg ${
                  selectedLog.canceled ? 'bg-yellow-500/10 border border-yellow-500/20' : 
                  selectedLog.overageTime > 0 ? 'bg-red-500/10 border border-red-500/20' : 
                  'bg-white/10 border border-white/20'
                }`}
              >
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-medium">{selectedLog.timerName}</h3>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm px-2 py-0.5 rounded-full ${
                      selectedLog.canceled ? 'bg-yellow-500/20 text-yellow-300' :
                      selectedLog.overageTime > 0 ? 'bg-red-500/20 text-red-300' :
                      'bg-green-500/20 text-green-300'
                    }`}>
                      {selectedLog.canceled ? 'Canceled' : selectedLog.overageTime > 0 ? 'Over Time' : 'Completed'}
                    </span>
                    {onDeleteLog && (
                      <button 
                        onClick={() => {
                          onDeleteLog(selectedLog.id);
                          setSelectedLogId(null); // Return to list view after deleting
                        }}
                        className="text-white/50 hover:text-white/80 p-1 hover:bg-white/10 rounded-full transition-colors"
                        title="Delete this timer log"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Date and time information */}
                <div className="text-xs text-white/60 mb-4">
                  <div className="flex justify-between">
                    <span>Started: {formatDate(selectedLog.startTime)}</span>
                    <span>Ended: {formatDate(selectedLog.endTime)}</span>
                  </div>
                  <div className="mt-1">
                    Total Duration: {getTimeElapsed(selectedLog.startTime, selectedLog.endTime)}
                  </div>
                </div>

                {/* Core timer metrics */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-white/5 p-3 rounded-md">
                    <p className="text-white/70 text-xs">Set Time</p>
                    <p className="text-lg font-mono font-medium">{formatTime(selectedLog.initialDuration)}</p>
                  </div>
                  <div className="bg-white/5 p-3 rounded-md">
                    <p className="text-white/70 text-xs">Actual Time</p>
                    <p className="text-lg font-mono font-medium">{formatTime(selectedLog.actualDuration)}</p>
                  </div>
                </div>

                {/* Analytics section */}
                {selectedLog.analysis && (
                  <div className="bg-white/5 p-3 rounded-md mb-4">
                    <h4 className="flex items-center gap-1 mb-2 text-white/80 font-medium">
                      <BarChart3 className="w-4 h-4" />
                      Analytics
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-blue-400 text-xs">Active Time</p>
                        <p className="font-mono">{formatTime(selectedLog.analysis.totalActiveTime)}</p>
                      </div>
                      {selectedLog.analysis.efficiency !== undefined && (
                        <div>
                          <p className="text-blue-400 text-xs">Efficiency</p>
                          <p className="font-mono">{selectedLog.analysis.efficiency.toFixed(1)}%</p>
                        </div>
                      )}
                      {selectedLog.analysis.averagePauseDuration !== undefined && (
                        <div>
                          <p className="text-blue-400 text-xs">Avg Pause</p>
                          <p className="font-mono">{formatTime(selectedLog.analysis.averagePauseDuration)}</p>
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
                  <div className="flex items-center bg-blue-500/10 p-2 rounded-md border border-blue-500/20 mb-4">
                    <PauseCircle className="w-4 h-4 text-blue-400 mr-2" />
                    <p className="text-sm">
                      Paused {selectedLog.pauseCount} {selectedLog.pauseCount === 1 ? 'time' : 'times'} 
                      {selectedLog.totalPauseDuration > 0 && ` (${formatTime(selectedLog.totalPauseDuration)})`}
                    </p>
                  </div>
                )}
                
                {selectedLog.overageTime > 0 && (
                  <div className="flex items-center bg-red-500/10 p-2 rounded-md border border-red-500/20 mb-4">
                    <AlertCircle className="w-4 h-4 text-red-400 mr-2" />
                    <p className="text-sm text-red-400">
                      Went over by {formatTime(selectedLog.overageTime)}
                    </p>
                  </div>
                )}

                {/* Timeline view */}
                <div className="mt-4">
                  <h4 className="flex items-center gap-2 mb-3 text-white/80 font-medium">
                    <Clock className="w-4 h-4" />
                    Timeline of Events
                  </h4>
                  
                  {/* Visual timeline */}
                  <div className="relative pl-6 border-l border-white/20 space-y-4">
                    {selectedLog.events.map((event, index) => (
                      <div key={index} className="relative">
                        {/* Timeline dot */}
                        <div className="absolute left-0 top-0 w-5 h-5 -ml-[13px] flex items-center justify-center rounded-full bg-timer-background border border-white/20">
                          {getEventIcon(event.type)}
                        </div>
                        
                        {/* Event card */}
                        <div className={`rounded-md p-3 ml-2 border ${getEventColor(event.type)}`}>
                          <div className="flex justify-between items-start">
                            <p className="font-medium">{formatEventType(event.type)}</p>
                            <p className="text-xs text-white/60">{formatShortTime(event.timestamp)}</p>
                          </div>
                          
                          {/* Event details */}
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
            ) : (
              // Timer logs list view
              <div className="space-y-3">
                {validTimerLogs.slice().reverse().map((log) => (
                  <div 
                    key={log.id} 
                    className={`p-3 rounded-lg transition-colors hover:bg-white/5 border ${
                      log.canceled ? 'border-yellow-500/30' :
                      log.overageTime > 0 ? 'border-red-500/30' :
                      'border-green-500/30'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium flex items-center cursor-pointer" onClick={() => handleSelectLog(log.id)}>
                        <Timer className="w-4 h-4 mr-2 opacity-60" />
                        {log.timerName}
                      </h4>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          log.canceled ? 'bg-yellow-500/20 text-yellow-300' :
                          log.overageTime > 0 ? 'bg-red-500/20 text-red-300' :
                          'bg-green-500/20 text-green-300'
                        }`}>
                          {log.canceled ? 'Canceled' : log.overageTime > 0 ? 'Over Time' : 'Completed'}
                        </span>
                        {onDeleteLog && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteLog(log.id);
                            }}
                            className="text-white/50 hover:text-white/80 p-1 hover:bg-white/10 rounded-full transition-colors"
                            title="Delete this timer log"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 mt-2 text-sm cursor-pointer" onClick={() => handleSelectLog(log.id)}>
                      <div>
                        <p className="text-white/60 text-xs">Set / Actual</p>
                        <p className="font-mono text-sm">
                          {formatTime(log.initialDuration)} / {formatTime(log.actualDuration)}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-white/60 text-xs">Events</p>
                        <div className="flex gap-1 mt-1">
                          {Array.from(new Set(log.events.map(e => e.type))).slice(0, 4).map((type, i) => (
                            <div key={i} className="w-4 h-4">{getEventIcon(type)}</div>
                          ))}
                          {log.events.length > 4 && <span className="text-xs text-white/50">+{log.events.length - 4}</span>}
                        </div>
                        </div>
                      
                      <div className="col-span-2 mt-1 text-xs text-white/50 flex justify-between">
                        <span>{formatDate(log.startTime).split(',')[0]}</span>
                        <span>{log.analysis?.efficiency ? `${log.analysis.efficiency.toFixed(0)}% efficient` : ''}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
};

export default TimerSettings;
