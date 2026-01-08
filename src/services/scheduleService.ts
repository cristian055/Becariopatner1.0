import type { WeeklyShift, WeeklyAssignment } from '../types'
import type { WeeklyShiftInput } from '../types/store.types'
import { ERROR_CODES } from '../constants/app.constants'
import { timeToMinutes, sortShiftsByTime } from '../utils'
import { logger } from '../utils'
import type { ValidationResult } from '../types/store.types'
/**
 * ScheduleService - Handles weekly scheduling operations
 * Includes shift management, assignment generation, and schedule statistics
 */
class ScheduleService {
  /**
   * Validate shift input
   */
  validateShift(shift: WeeklyShiftInput): ValidationResult {
    logger.debug('Validating shift input', 'ScheduleService');

    const errors: string[] = [];

    if (!shift.day.trim()) {
      errors.push('Day is required');
    }

    if (!shift.time.trim()) {
      errors.push('Time is required');
    }

    if (!shift.requirements || shift.requirements.length === 0) {
      errors.push('At least one category requirement is needed');
    }

    shift.requirements.forEach(req => {
      if (req.count < 1) {
        errors.push(`Category ${req.category} must require at least 1 caddie`);
      }

      if (req.count > 20) {
        errors.push(`Category ${req.category} cannot require more than 20 caddies`);
      }
    });

    const valid = errors.length === 0;
    if (!valid) {
      logger.warn('Validation failed', errors, 'ScheduleService');
    }

    return { valid, errors };
  }

  /**
   * Create new shift
   */
  async createShift(shift: WeeklyShiftInput): Promise<WeeklyShift> {
    logger.action('createShift', shift, 'ScheduleService');

    // Validate input
    const validation = this.validateShift(shift);
    if (!validation.valid) {
      throw new ServiceError(
        'Validation failed: ' + validation.errors.join(', '),
        ERROR_CODES.VALIDATION_ERROR,
        validation.errors
      );
    }

    // Simulate async operation (for future API integration)
    await new Promise(resolve => setTimeout(resolve, 100));

    const newShift: WeeklyShift = {
      id: shift.id,
      day: shift.day,
      time: shift.time,
      requirements: shift.requirements,
    };

    logger.info(`Shift created successfully: ${shift.id}`, 'ScheduleService');
    return newShift;
  }

  /**
   * Delete shift
   */
  async deleteShift(id: string): Promise<void> {
    logger.action('deleteShift', { id }, 'ScheduleService');

    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 50));

    logger.info(`Shift deleted successfully: ${id}`, 'ScheduleService');
  }

  /**
   * Generate weekly draw (assignment algorithm)
   * This is now handled in ScheduleStore, but we keep helper methods here
   */
  async generateWeeklyDraw(
    day: string,
    shifts: WeeklyShift[],
    caddies: any[]
  ): Promise<WeeklyAssignment[]> {
    logger.action('generateWeeklyDraw', { day, shiftsCount: shifts.length, caddiesCount: caddies.length }, 'ScheduleService');

    // Sort shifts by time
    const sortedShifts = sortShiftsByTime(shifts);

    const newAssignments: WeeklyAssignment[] = [];

    // This logic is now in ScheduleStore, this method is kept for service layer consistency
    logger.info(`Generating weekly draw for ${day}`, 'ScheduleService');

    return newAssignments;
  }

  /**
   * Validate time format
   */
  validateTimeFormat(timeStr: string): boolean {
    if (!timeStr) return false;

    // Check 24h format (HH:mm)
    const time24hRegex = /^([01]?[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;
    if (time24hRegex.test(timeStr)) return true;

    // Check 12h format (h:mm AM/PM)
    const time12hRegex = /^([1-9]|1[0-2]):[0-5][0-9]\s(AM|PM)$/i;
    return time12hRegex.test(timeStr);
  }

  /**
   * Convert day to display format
   */
  formatDayForDisplay(day: string): string {
    const dayMap: Record<string, string> = {
      Monday: 'Mon',
      Tuesday: 'Tue',
      Wednesday: 'Wed',
      Thursday: 'Thu',
      Friday: 'Fri',
      Saturday: 'Sat',
      Sunday: 'Sun',
    };

    return dayMap[day] || day;
  }

  /**
   * Parse shift from time string
   */
  parseShiftTime(timeStr: string): { hour: number; minute: number; period?: 'AM' | 'PM' } {
    const is12h = timeStr.toUpperCase().includes('AM') || timeStr.toUpperCase().includes('PM');

    if (is12h) {
      const [time, modifier] = timeStr.split(' ');
      let [hours, minutes] = time.split(':').map(Number);

      if (hours === 12) hours = 0;
      if (modifier.toUpperCase() === 'PM') hours += 12;

      return { hours, minutes: minutes || 0, period: modifier.toUpperCase() as 'AM' | 'PM' };
    }

    const [hours, minutes] = timeStr.split(':').map(Number);
    return { hours, minutes: minutes || 0 };
  }

  /**
   * Get shift statistics
   */
  getShiftStatistics(shifts: WeeklyShift[], assignments: WeeklyAssignment[]) {
    const totalShifts = shifts.length;
    const totalAssignments = assignments.length;

    // Count assignments by category
    const byCategory: Record<string, number> = {
      Primera: 0,
      Segunda: 0,
      Tercera: 0,
    };

    assignments.forEach(assignment => {
      const category = assignment.category || 'Unknown';
      if (byCategory[category] !== undefined) {
        byCategory[category]++;
      }
    });

    // Count assignments by day
    const byDay: Record<string, number> = {};
    shifts.forEach(shift => {
      byDay[shift.day] = (byDay[shift.day] || 0) + 1;
    });

    return {
      totalShifts,
      totalAssignments,
      byCategory,
      byDay,
    };
  }

  /**
   * Get coverage statistics
   */
  getCoverageStatistics(
    shifts: WeeklyShift[],
    assignments: WeeklyAssignment[],
    caddies: any[]
  ) {
    // Caddies with availability set
    const caddiesWithAvailability = caddies.filter(c => c.isActive && c.availability.length > 0);

    // Caddies available for each day
    const availabilityByDay: Record<string, number> = {
      Monday: 0,
      Tuesday: 0,
      Wednesday: 0,
      Thursday: 0,
      Friday: 0,
      Saturday: 0,
      Sunday: 0,
    };

    caddiesWithAvailability.forEach(caddie => {
      caddie.availability.forEach(avail => {
        if (avail.isAvailable) {
          availabilityByDay[avail.day] = (availabilityByDay[avail.day] || 0) + 1;
        }
      });
    });

    return {
      totalCaddies: caddies.length,
      caddiesWithAvailability: caddiesWithAvailability.length,
      availabilityByDay,
    };
  }

  /**
   * Export schedule to CSV
   */
  exportToCSV(assignments: WeeklyAssignment[]): string {
    logger.info('Exporting schedule to CSV', 'ScheduleService');

    const headers = ['Shift ID', 'Caddie ID', 'Caddie Name', 'Caddie Number', 'Category', 'Time'];
    const rows = assignments.map(a => [
      a.shiftId,
      a.caddieId,
      a.caddieName,
      a.caddieNumber,
      a.category,
      a.time,
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.join(',')),
    ].join('\n');

    logger.info(`CSV exported with ${assignments.length} rows`, 'ScheduleService');
    return csv;
  }

  /**
   * Import schedule from CSV
   */
  importFromCSV(csv: string): WeeklyAssignment[] {
    logger.info('Importing schedule from CSV', 'ScheduleService');

    const lines = csv.trim().split('\n');
    const headers = lines[0].split(',');
    const assignments: WeeklyAssignment[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',');
      assignments.push({
        shiftId: values[0]?.trim() || '',
        caddieId: values[1]?.trim() || '',
        caddieName: values[2]?.trim() || '',
        caddieNumber: parseInt(values[3]?.trim() || '0'),
        category: values[4]?.trim() as any,
        time: values[5]?.trim() || '',
      });
    }

    logger.info(`Imported ${assignments.length} assignments from CSV`, 'ScheduleService');
    return assignments;
  }
}

// Export singleton instance
export const scheduleService = new ScheduleService();
