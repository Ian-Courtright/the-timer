import { v4 as uuidv4 } from 'uuid';
import { supabase } from './supabase';
import type { Tables, TablesInsert } from './supabase.types';

// Types
export interface TimerLog {
  id: string;
  name: string;
  startTime: Date;
  endTime: Date | null;
  initialHours: number;
  initialMinutes: number;
  initialSeconds: number;
  finalHours: number;
  finalMinutes: number;
  finalSeconds: number;
  wasCompleted: boolean;
  overTime: boolean;
  overTimeAmount: { hours: number, minutes: number, seconds: number } | null;
}

export interface TimerLogService {
  saveLogs: (log: TimerLog) => Promise<void>;
  getLogs: () => Promise<TimerLog[]>;
  clearLogs: () => Promise<void>;
  migrateLocalLogs: () => Promise<void>;
}

// Local storage key (for migration and fallback)
const TIMER_LOGS_KEY = 'timerflow_logs';

// Convert TimerLog to Supabase format
const convertToSupabaseFormat = (log: TimerLog): TablesInsert<'timer_logs'> => {
  return {
    id: log.id,
    name: log.name,
    start_time: log.startTime.toISOString(),
    end_time: log.endTime ? log.endTime.toISOString() : null,
    initial_hours: log.initialHours,
    initial_minutes: log.initialMinutes,
    initial_seconds: log.initialSeconds,
    final_hours: log.finalHours,
    final_minutes: log.finalMinutes,
    final_seconds: log.finalSeconds,
    was_completed: log.wasCompleted,
    over_time: log.overTime,
    over_time_amount: log.overTimeAmount
  };
};

// Convert from Supabase format to TimerLog
const convertFromSupabaseFormat = (record: Tables<'timer_logs'>): TimerLog => {
  return {
    id: record.id,
    name: record.name,
    startTime: new Date(record.start_time),
    endTime: record.end_time ? new Date(record.end_time) : null,
    initialHours: record.initial_hours,
    initialMinutes: record.initial_minutes,
    initialSeconds: record.initial_seconds,
    finalHours: record.final_hours,
    finalMinutes: record.final_minutes,
    finalSeconds: record.final_seconds,
    wasCompleted: record.was_completed,
    overTime: record.over_time,
    overTimeAmount: record.over_time_amount as { hours: number, minutes: number, seconds: number } | null
  };
};

// Get logs from local storage (for migration)
const getLocalLogs = (): TimerLog[] => {
  const logsStr = localStorage.getItem(TIMER_LOGS_KEY);
  if (!logsStr) return [];
  
  try {
    const logs = JSON.parse(logsStr);
    return Array.isArray(logs) ? logs : [];
  } catch (e) {
    console.error('Error parsing timer logs:', e);
    return [];
  }
};

// TimerLogService implementation with Supabase
export const timerLogService: TimerLogService = {
  saveLogs: async (log: TimerLog) => {
    try {
      const supabaseLog = convertToSupabaseFormat(log);
      
      const { error } = await supabase
        .from('timer_logs')
        .insert(supabaseLog);
        
      if (error) {
        console.error('Error saving timer log to Supabase:', error);
        // Fallback to local storage if Supabase fails
        const currentLogs = getLocalLogs();
        const updatedLogs = [log, ...currentLogs];
        localStorage.setItem(TIMER_LOGS_KEY, JSON.stringify(updatedLogs));
      }
    } catch (e) {
      console.error('Error in saveLogs:', e);
      // Fallback to local storage
      const currentLogs = getLocalLogs();
      const updatedLogs = [log, ...currentLogs];
      localStorage.setItem(TIMER_LOGS_KEY, JSON.stringify(updatedLogs));
    }
  },
  
  getLogs: async (): Promise<TimerLog[]> => {
    try {
      const { data, error } = await supabase
        .from('timer_logs')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching timer logs from Supabase:', error);
        // Fallback to local storage
        return getLocalLogs();
      }
      
      return data.map(convertFromSupabaseFormat);
    } catch (e) {
      console.error('Error in getLogs:', e);
      // Fallback to local storage
      return getLocalLogs();
    }
  },
  
  clearLogs: async () => {
    try {
      const { error } = await supabase
        .from('timer_logs')
        .delete()
        .neq('id', 'NONE'); // Delete all logs
        
      if (error) {
        console.error('Error clearing timer logs from Supabase:', error);
      }
      
      // Clear local storage as well
      localStorage.removeItem(TIMER_LOGS_KEY);
    } catch (e) {
      console.error('Error in clearLogs:', e);
      // At least clear local storage
      localStorage.removeItem(TIMER_LOGS_KEY);
    }
  },
  
  migrateLocalLogs: async () => {
    try {
      const localLogs = getLocalLogs();
      
      if (localLogs.length === 0) {
        return; // Nothing to migrate
      }
      
      const supabaseLogs = localLogs.map(convertToSupabaseFormat);
      
      // Insert all local logs to Supabase
      const { error } = await supabase
        .from('timer_logs')
        .insert(supabaseLogs);
        
      if (error) {
        console.error('Error migrating local logs to Supabase:', error);
        return;
      }
      
      // Clear local storage after successful migration
      localStorage.removeItem(TIMER_LOGS_KEY);
      console.log(`Successfully migrated ${localLogs.length} logs to Supabase`);
    } catch (e) {
      console.error('Error in migrateLocalLogs:', e);
    }
  }
}; 