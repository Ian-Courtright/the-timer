import React, { useState, useEffect } from 'react';
import { Check, Clock, Cloud, Loader2, Trash, Undo2, X } from 'lucide-react';
import { formatTime } from '../lib/utils';
import { timerLogService, type TimerLog } from '../lib/timerLogService';
import { toast } from 'sonner';

// Component props
interface TimerSettingsProps {
  onClose: () => void;
  onSetTimer: (hours: number, minutes: number, seconds: number) => void;
  isVisible: boolean;
  playSounds: boolean;
  setPlaySounds: (value: boolean) => void;
  showNotifications: boolean;
  setShowNotifications: (value: boolean) => void;
}

const TimerSettings: React.FC<TimerSettingsProps> = ({
  onClose,
  onSetTimer,
  isVisible,
  playSounds,
  setPlaySounds,
  showNotifications,
  setShowNotifications,
}) => {
  // State management
  const [hours, setHours] = useState<number>(0);
  const [minutes, setMinutes] = useState<number>(0);
  const [seconds, setSeconds] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'settings' | 'logs'>('settings');
  const [timerLogs, setTimerLogs] = useState<TimerLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  
  // Load timer logs when the component mounts or becomes visible
  useEffect(() => {
    if (isVisible && activeTab === 'logs') {
      loadTimerLogs();
    }
  }, [isVisible, activeTab]);
  
  // Function to load timer logs
  const loadTimerLogs = async () => {
    setIsLoading(true);
    try {
      const logs = await timerLogService.getLogs();
      setTimerLogs(logs);
    } catch (error) {
      console.error('Error loading timer logs:', error);
      toast.error('Failed to load timer logs');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSetTimer(hours, minutes, seconds);
    onClose();
  };
  
  // Function to handle clearing timer logs
  const handleClearLogs = async () => {
    if (window.confirm('Are you sure you want to clear all timer logs? This action cannot be undone.')) {
      try {
        await timerLogService.clearLogs();
        setTimerLogs([]);
        toast.success('Timer logs cleared successfully');
      } catch (error) {
        console.error('Error clearing timer logs:', error);
        toast.error('Failed to clear timer logs');
      }
    }
  };
  
  // Function to migrate local logs to Supabase
  const handleMigrateLocalLogs = async () => {
    setIsSyncing(true);
    try {
      await timerLogService.migrateLocalLogs();
      await loadTimerLogs(); // Reload logs after migration
      toast.success('Timer logs migrated to cloud successfully');
    } catch (error) {
      console.error('Error migrating timer logs:', error);
      toast.error('Failed to migrate timer logs to cloud');
    } finally {
      setIsSyncing(false);
    }
  };
  
  // Function to format date
  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-[#121212] rounded-lg p-6 w-full max-w-2xl shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Timer Settings</h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>
        
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-700 mb-6">
          <button
            className={`pb-2 px-4 font-medium ${activeTab === 'settings' 
              ? 'text-white border-b-2 border-white' 
              : 'text-gray-400 hover:text-gray-200'}`}
            onClick={() => setActiveTab('settings')}
          >
            Settings
          </button>
          <button
            className={`pb-2 px-4 font-medium ${activeTab === 'logs' 
              ? 'text-white border-b-2 border-white' 
              : 'text-gray-400 hover:text-gray-200'}`}
            onClick={() => setActiveTab('logs')}
          >
            Timer History
          </button>
        </div>
        
        {activeTab === 'settings' ? (
          <>
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <h3 className="text-xl font-medium mb-4">Set Timer</h3>
                <div className="flex gap-2">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Hours</label>
                    <input 
                      type="number" 
                      min="0"
                      max="99"
                      value={hours}
                      onChange={(e) => setHours(parseInt(e.target.value) || 0)}
                      className="bg-[#1e1e1e] text-white p-2 rounded w-full border border-gray-700"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Minutes</label>
                    <input 
                      type="number" 
                      min="0"
                      max="59"
                      value={minutes}
                      onChange={(e) => setMinutes(parseInt(e.target.value) || 0)}
                      className="bg-[#1e1e1e] text-white p-2 rounded w-full border border-gray-700"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Seconds</label>
                    <input 
                      type="number" 
                      min="0"
                      max="59"
                      value={seconds}
                      onChange={(e) => setSeconds(parseInt(e.target.value) || 0)}
                      className="bg-[#1e1e1e] text-white p-2 rounded w-full border border-gray-700"
                    />
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-xl font-medium mb-4">Notifications</h3>
                <div className="flex items-center mb-4">
                  <input 
                    type="checkbox" 
                    id="play-sounds" 
                    checked={playSounds}
                    onChange={(e) => setPlaySounds(e.target.checked)}
                    className="mr-2 h-5 w-5 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="play-sounds" className="text-white">Play Sounds</label>
                </div>
                <div className="flex items-center">
                  <input 
                    type="checkbox" 
                    id="show-notifications" 
                    checked={showNotifications}
                    onChange={(e) => setShowNotifications(e.target.checked)}
                    className="mr-2 h-5 w-5 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="show-notifications" className="text-white">Show Browser Notifications</label>
                </div>
              </div>
              
              <div className="flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={onClose}
                  className="px-4 py-2 bg-transparent text-gray-300 border border-gray-600 rounded hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Start Timer
                </button>
              </div>
            </form>
          </>
        ) : (
          // Timer Logs Tab
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-medium">Timer History</h3>
              <div className="flex gap-2">
                <button
                  onClick={handleMigrateLocalLogs}
                  className="flex items-center gap-1 px-3 py-1 bg-purple-700 text-white rounded hover:bg-purple-800"
                  disabled={isSyncing}
                >
                  {isSyncing ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Cloud size={16} />
                  )}
                  Sync to Cloud
                </button>
                <button
                  onClick={loadTimerLogs}
                  className="flex items-center gap-1 px-3 py-1 bg-blue-700 text-white rounded hover:bg-blue-800"
                >
                  <Undo2 size={16} />
                  Refresh
                </button>
                <button
                  onClick={handleClearLogs}
                  className="flex items-center gap-1 px-3 py-1 bg-red-700 text-white rounded hover:bg-red-800"
                >
                  <Trash size={16} />
                  Clear All
                </button>
              </div>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 size={32} className="animate-spin text-gray-400" />
                <span className="ml-2 text-gray-400">Loading timer logs...</span>
              </div>
            ) : timerLogs.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Clock size={48} className="mx-auto mb-4 opacity-30" />
                <p>No timer logs found</p>
                <p className="text-sm mt-2">Start and stop some timers to see your history here.</p>
              </div>
            ) : (
              <div className="max-h-[400px] overflow-y-auto pr-2">
                {timerLogs.map((log) => (
                  <div key={log.id} className="border border-gray-700 rounded p-3 mb-3 bg-[#1e1e1e]">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium">
                        {log.name || 'Unnamed Timer'}
                      </h4>
                      <div className="flex items-center gap-2">
                        {log.wasCompleted ? (
                          <span className="px-2 py-0.5 bg-green-900/60 text-green-300 text-xs rounded-full flex items-center gap-1">
                            <Check size={12} /> Completed
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-orange-900/60 text-orange-300 text-xs rounded-full flex items-center gap-1">
                            <X size={12} /> Canceled
                          </span>
                        )}
                        
                        {log.overTime && (
                          <span className="px-2 py-0.5 bg-red-900/60 text-red-300 text-xs rounded-full">
                            Overtime
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-300">
                      <div>
                        <p className="text-gray-400">Start:</p>
                        <p>{formatDate(log.startTime)}</p>
                      </div>
                      
                      <div>
                        <p className="text-gray-400">End:</p>
                        <p>{log.endTime ? formatDate(log.endTime) : 'N/A'}</p>
                      </div>
                      
                      <div>
                        <p className="text-gray-400">Initial Time:</p>
                        <p>{formatTime({ 
                          hours: log.initialHours, 
                          minutes: log.initialMinutes, 
                          seconds: log.initialSeconds 
                        })}</p>
                      </div>
                      
                      <div>
                        <p className="text-gray-400">Final Time:</p>
                        <p className={log.overTime ? 'text-red-400' : ''}>
                          {formatTime({ 
                            hours: log.finalHours, 
                            minutes: log.finalMinutes, 
                            seconds: log.finalSeconds 
                          }, log.overTime)}
                        </p>
                      </div>
                      
                      {log.overTime && log.overTimeAmount && (
                        <div className="col-span-2">
                          <p className="text-gray-400">Overtime Amount:</p>
                          <p className="text-red-400">{formatTime(log.overTimeAmount)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TimerSettings;
