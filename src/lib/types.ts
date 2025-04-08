export interface TimerEvent {
  type: 'start' | 'pause' | 'resume' | 'reset' | 'add-time' | 'complete' | 'overage-start' | 'set-timer';
  timestamp: Date;
  timeData?: TimeData;
  duration?: number; // Only for add-time events
  notes?: string; // Optional notes about the event
}

export interface TimerLog {
  id: string;
  timerName: string;
  startTime: Date;
  endTime: Date;
  initialDuration: number; // in seconds
  actualDuration: number; // in seconds
  completed: boolean;
  canceled: boolean;
  overageTime: number; // in seconds, > 0 if went over
  pauseCount: number; // number of times timer was paused
  totalPauseDuration: number; // total time spent paused in seconds
  events: TimerEvent[]; // Array of all timer events
  analysis?: {
    totalActiveTime: number; // Total time spent actively on timer (excludes pauses)
    efficiency?: number; // Ratio of initial duration to actual duration (%)
    averagePauseDuration?: number; // Average duration of pauses
    overagePercentage?: number; // Percentage of overage compared to initial time
  };
}

export interface TimeData {
  hours: number;
  minutes: number;
  seconds: number;
} 