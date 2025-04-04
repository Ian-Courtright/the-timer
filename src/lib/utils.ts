import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Get time in seconds
export const getTimeInSeconds = (time: { hours: number, minutes: number, seconds: number }) => {
  return time.hours * 3600 + time.minutes * 60 + time.seconds;
};

// Convert seconds to time format
export const secondsToTime = (totalSeconds: number): { hours: number, minutes: number, seconds: number } => {
  const absSeconds = Math.abs(totalSeconds);
  const hours = Math.floor(absSeconds / 3600);
  const minutes = Math.floor((absSeconds % 3600) / 60);
  const seconds = absSeconds % 60;
  
  return { hours, minutes, seconds };
};

// Format time for display
export const formatTime = (time: { hours: number, minutes: number, seconds: number }, showNegative = false): string => {
  const h = time.hours.toString().padStart(2, '0');
  const m = time.minutes.toString().padStart(2, '0');
  const s = time.seconds.toString().padStart(2, '0');
  
  return `${showNegative ? '-' : ''}${h}:${m}:${s}`;
};
