/**
 * Date and time utility functions for accurate attendance tracking,
 * shift calculations, and live timers.
 */

/**
 * Returns the current or provided date formatted as YYYY-MM-DD in the local timezone.
 */
export function getLocalDateString(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Formats a Date or time string into a 12-hour display string with AM/PM.
 * Example: "09:15:23 AM" or "09:15 AM".
 */
export function formatTimeDisplay(
  input: Date | string,
  includeSeconds: boolean = true
): string {
  if (!input) return '—';

  let dateObj: Date;

  if (input instanceof Date) {
    dateObj = input;
  } else if (typeof input === 'string') {
    // If it's already in 12-hour format like "09:15:23 AM", return directly or adjust seconds
    if (/^\d{1,2}:\d{2}(:\d{2})?\s*(AM|PM)$/i.test(input.trim())) {
      return input.trim();
    }

    // If it's a 24-hour time string like "08:55" or "17:35"
    const timeMatch = input.trim().match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
    if (timeMatch) {
      let h = parseInt(timeMatch[1], 10);
      const m = parseInt(timeMatch[2], 10);
      const s = timeMatch[3] ? parseInt(timeMatch[3], 10) : 0;
      const meridiem = h >= 12 ? 'PM' : 'AM';
      h = h % 12 || 12;
      const hStr = String(h).padStart(2, '0');
      const mStr = String(m).padStart(2, '0');
      if (includeSeconds && timeMatch[3] !== undefined) {
        const sStr = String(s).padStart(2, '0');
        return `${hStr}:${mStr}:${sStr} ${meridiem}`;
      }
      return `${hStr}:${mStr} ${meridiem}`;
    }

    // Try parsing as ISO string or generic date string
    const parsed = new Date(input);
    if (!isNaN(parsed.getTime())) {
      dateObj = parsed;
    } else {
      return input;
    }
  } else {
    return '—';
  }

  return dateObj.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: includeSeconds ? '2-digit' : undefined,
    hour12: true,
  });
}

/**
 * Converts any time representation (ISO string, "HH:MM", "HH:MM:SS AM/PM") into a valid Date object.
 */
export function parseTimeToDate(timeStr: string, baseDate: Date = new Date()): Date {
  if (!timeStr) return new Date(baseDate);

  // Check if it's an ISO timestamp
  const asIso = new Date(timeStr);
  if (!isNaN(asIso.getTime()) && timeStr.includes('T')) {
    return asIso;
  }

  const d = new Date(baseDate);
  const trimmed = timeStr.trim();

  // Match 12-hour or 24-hour: e.g. "09:15:30 AM", "17:35", "8:55"
  const match = trimmed.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(am|pm)?$/i);
  if (match) {
    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const seconds = match[3] ? parseInt(match[3], 10) : 0;
    const meridiem = match[4]?.toLowerCase();

    if (meridiem === 'pm' && hours < 12) {
      hours += 12;
    } else if (meridiem === 'am' && hours === 12) {
      hours = 0;
    }

    d.setHours(hours, minutes, seconds, 0);
    return d;
  }

  return d;
}

/**
 * Calculates the elapsed time in seconds from a start timestamp/time string to now or end.
 */
export function calculateElapsedSeconds(
  start: Date | string,
  end?: Date | string
): number {
  if (!start) return 0;
  const startDate = start instanceof Date ? start : parseTimeToDate(start);
  const endDate = end ? (end instanceof Date ? end : parseTimeToDate(end)) : new Date();
  const diffMs = endDate.getTime() - startDate.getTime();
  return Math.max(0, Math.floor(diffMs / 1000));
}

/**
 * Formats a duration in seconds to a digital stopwatch timer string: HH:MM:SS.
 * Example: 75 seconds -> "00:01:15"
 */
export function formatLiveTimer(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(s / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const seconds = s % 60;

  const hStr = String(hours).padStart(2, '0');
  const mStr = String(minutes).padStart(2, '0');
  const sStr = String(seconds).padStart(2, '0');

  return `${hStr}:${mStr}:${sStr}`;
}

/**
 * Formats decimal hours into a user-friendly readable string with minutes or hours.
 * Examples:
 *   0.02 -> "1 min (0.02h)"
 *   0.5  -> "30 mins (0.50h)"
 *   7.5  -> "7.5 hrs"
 */
export function formatWorkingHoursDisplay(hours?: number): string {
  if (hours === undefined || hours === null || isNaN(hours) || hours <= 0) {
    return '—';
  }

  if (hours < 1) {
    const mins = Math.max(1, Math.round(hours * 60));
    return `${mins} min${mins === 1 ? '' : 's'} (${hours.toFixed(2)}h)`;
  }

  return `${hours.toFixed(1)} hrs`;
}

/**
 * Derives whether a check-in is considered late based on the standard grace period:
 * Check-in after 09:15 AM is late.
 */
export function isLateCheckIn(date: Date = new Date()): boolean {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  return hours > 9 || (hours === 9 && minutes > 15);
}
