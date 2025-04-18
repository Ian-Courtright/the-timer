export interface TimerEvent {
  type: 'start' | 'pause' | 'resume' | 'reset' | 'add-time' | 'complete' | 'overage-start' | 'set-timer';
  timestamp: Date;
  timeData?: TimeData;
  duration?: number; // Only for add-time events
  pauseDuration?: number; // Duration of a pause in seconds (for 'resume' events)
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
  outcome?: 'completed' | 'cancelled' | 'scrapped' | 'other'; // New outcome field
  outcomeNote?: string; // Optional note for the outcome
  overageTime: number; // in seconds, > 0 if went over
  pauseCount: number; // number of times timer was paused
  totalPauseDuration: number; // total time spent paused in seconds
  pauseDetails?: Array<{startTime: Date, endTime?: Date, duration?: number}>; // Detailed pause information
  events: TimerEvent[]; // Array of all timer events
  analysis?: {
    totalActiveTime: number; // Total time spent actively on timer (excludes pauses)
    efficiency?: number; // Ratio of active time to total time (%)
    averagePauseDuration?: number; // Average duration of pauses
    overagePercentage?: number; // Percentage of overage compared to initial time
    initialCountdownTime: number; // Initial time set for the countdown in seconds
    actualTimeSpent: number; // Total time spent including pauses
    activePeriods?: Array<{startTime: Date, endTime: Date, duration: number}>; // Detailed active periods
  };
}

export interface TimeData {
  hours: number;
  minutes: number;
  seconds: number;
} 