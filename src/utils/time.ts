import type { AVAILABILITY_TYPES } from '@/constants/app.constants'

/**
 * Convert a time string (HH:mm or HH:mm AM/PM) to total minutes from midnight
 * @param timeStr - Time string to convert
 * @returns Total minutes from midnight (0-1439)
 */
export const timeToMinutes = (timeStr: string): number => {
  if (!timeStr) return 0;

  const is12h = timeStr.toUpperCase().includes('AM') || timeStr.toUpperCase().includes('PM');

  if (is12h) {
    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);

    if (hours === 12) hours = 0;
    if (modifier.toUpperCase() === 'PM') hours += 12;

    return hours * 60 + (minutes || 0);
  } else {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + (minutes || 0);
  }
};

/**
 * Convert minutes from midnight to time string
 * @param minutes - Total minutes from midnight (0-1439)
 * @param format - Time format (12h or 24h)
 * @returns Formatted time string
 */
export const minutesToTime = (
  minutes: number,
  format: '12h' | '24h' = '24h'
): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (format === '12h') {
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${mins.toString().padStart(2, '0')} ${period}`;
  }

  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

/**
 * Get current time in minutes since midnight
 * @returns Current time in minutes (0-1439)
 */
export const getCurrentTimeMinutes = (): number => {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
};

/**
 * Format time for display
 * @param timeStr - Time string to format
 * @returns Formatted time string
 */
export const formatTimeDisplay = (timeStr: string): string => {
  if (!timeStr) return '--:--';

  const is12h = timeStr.toUpperCase().includes('AM') || timeStr.toUpperCase().includes('PM');
  if (is12h) {
    return timeStr;
  }

  const [hours, minutes] = timeStr.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
};

/**
 * Parse time availability into human-readable format
 * @param availability - Time availability configuration
 * @returns Human-readable description
 */
export const formatAvailability = (availability: {
  type: keyof typeof AVAILABILITY_TYPES;
  time?: string;
  endTime?: string;
}): string => {
  const { type, time, endTime } = availability;

  switch (type) {
    case 'full':
      return 'Full day';
    case 'before':
      return `Before ${formatTimeDisplay(time || '')}`;
    case 'after':
      return `After ${formatTimeDisplay(time || '')}`;
    case 'between':
      return `${formatTimeDisplay(time || '')} - ${formatTimeDisplay(endTime || '')}`;
    default:
      return 'Full day';
  }
};

/**
 * Check if current time is within availability range
 * @param availability - Time availability configuration
 * @returns True if currently within availability
 */
export const isWithinAvailability = (availability: {
  type: keyof typeof AVAILABILITY_TYPES;
  time?: string;
  endTime?: string;
}): boolean => {
  const currentTime = getCurrentTimeMinutes();
  const { type, time, endTime } = availability;

  switch (type) {
    case 'full':
      return true;
    case 'before': {
      const limitTime = timeToMinutes(time || '00:00');
      return currentTime < limitTime;
    }
    case 'after': {
      const limitTime = timeToMinutes(time || '00:00');
      return currentTime >= limitTime;
    }
    case 'between': {
      const startTime = timeToMinutes(time || '00:00');
      const endTimeMinutes = timeToMinutes(endTime || '23:59');
      return currentTime >= startTime && currentTime <= endTimeMinutes;
    }
    default:
      return true;
  }
};
