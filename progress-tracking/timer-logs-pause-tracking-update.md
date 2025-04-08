# Timer Logs Pause Tracking Update

## Changes Made

1. Added pause tracking to timer logs
   - Added fields to TimerLog interface for tracking pauses:
     - `pauseCount`: number of times the timer was paused
     - `totalPauseDuration`: total duration of all pauses in seconds

2. Updated timer management to record pause information
   - Added state to track when a timer is paused
   - Added logic to calculate pause duration when resuming
   - Incremented pause count when pausing the timer
   - Accumulated total pause duration across multiple pauses

3. Enhanced timer log display in settings
   - Added a dedicated section to show pause information
   - Displayed both count of pauses and total pause duration
   - Used blue color to visually distinguish pause information

## Technical Implementation

### In types.ts:
- Added pause tracking fields to the TimerLog interface:
  ```typescript
  export interface TimerLog {
    // existing fields...
    pauseCount: number;      // number of times timer was paused
    totalPauseDuration: number; // total time spent paused in seconds
  }
  ```

### In Index.tsx:
- Added state to track pause timing:
  ```typescript
  const [lastPauseTime, setLastPauseTime] = useState<Date | null>(null);
  ```

- Enhanced handlePlayPause to track pauses:
  ```typescript
  // When pausing
  if (activeTimerLog) {
    setLastPauseTime(now);
    setActiveTimerLog(prev => ({
      ...prev,
      pauseCount: prev.pauseCount + 1
    }));
  }

  // When resuming
  if (activeTimerLog && lastPauseTime) {
    const pauseDuration = Math.floor((now.getTime() - lastPauseTime.getTime()) / 1000);
    setActiveTimerLog(prev => ({
      ...prev,
      totalPauseDuration: prev.totalPauseDuration + pauseDuration
    }));
    setLastPauseTime(null);
  }
  ```

### In TimerSettings.tsx:
- Added pause information display:
  ```tsx
  {log.pauseCount > 0 && (
    <div className="col-span-2 mt-1">
      <p className="text-blue-400">
        Paused: {log.pauseCount} {log.pauseCount === 1 ? 'time' : 'times'} 
        {log.totalPauseDuration > 0 && ` (${formatTime(log.totalPauseDuration)})`}
      </p>
    </div>
  )}
  ```

## User Experience Improvements

1. Users can now see how many times they paused a timer
2. The total pause duration is tracked and displayed
3. This data helps users analyze their time usage more accurately
4. Pause information is visually distinguished with blue text 