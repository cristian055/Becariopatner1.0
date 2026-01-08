import { create } from 'zustand'
import type { WeeklyShift, WeeklyAssignment, Caddie } from '../types'
import type {
  WeeklyScheduleState,
  WeeklyShiftInput,
} from '../types/store.types'
import { timeToMinutes, logger } from '../utils'
import { scheduleApi } from '../services/api'

/**
 * ScheduleStore - Global state for weekly scheduling
 * Handles shift management, assignment generation, and priority tracking with backend API
 */
interface ScheduleStore extends WeeklyScheduleState {
  // Actions
  setShifts: (shifts: WeeklyShift[]) => void;
  setAssignments: (assignments: WeeklyAssignment[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  fetchShifts: () => Promise<void>;
  fetchAssignments: (shiftId?: string) => Promise<void>;
  addShift: (shift: WeeklyShiftInput) => Promise<void>;
  removeShift: (id: string) => Promise<void>;
  generateWeeklyDraw: (day: string, caddies: Caddie[]) => void;
  resetSchedule: () => Promise<void>;
}

export const useScheduleStore = create<ScheduleStore>((set, get) => ({
  // Initial state
  shifts: [],
  assignments: [],
  loading: false,
  error: null,

  // Set shifts
  setShifts: (shifts) => {
    logger.stateChange('shifts', get().shifts.length, shifts.length, 'ScheduleStore');
    set({ shifts });
  },

  // Set assignments
  setAssignments: (assignments) => {
    logger.stateChange('assignments', get().assignments.length, assignments.length, 'ScheduleStore');
    set({ assignments });
  },

  // Set loading state
  setLoading: (loading) => {
    set({ loading });
  },

  // Set error state
  setError: (error) => {
    set({ error });
    if (error) {
      logger.error('Schedule store error:', new Error(error), 'ScheduleStore');
    }
  },

  // Fetch shifts from backend
  fetchShifts: async () => {
    try {
      set({ loading: true, error: null });
      logger.info('Fetching shifts from backend...', 'ScheduleStore');

      const shifts = await scheduleApi.getAllShifts();
      set({ shifts, loading: false });
      
      logger.info(`Fetched ${shifts.length} shifts from backend`, 'ScheduleStore');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch shifts';
      set({ loading: false, error: errorMessage });
      logger.serviceError('FETCH_ERROR', errorMessage, error, 'ScheduleStore');
    }
  },

  // Fetch assignments from backend
  fetchAssignments: async (shiftId?: string) => {
    try {
      set({ loading: true, error: null });
      logger.info('Fetching assignments from backend...', 'ScheduleStore');

      const assignments = await scheduleApi.getAllAssignments(shiftId);
      set({ assignments, loading: false });
      
      logger.info(`Fetched ${assignments.length} assignments from backend`, 'ScheduleStore');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch assignments';
      set({ loading: false, error: errorMessage });
      logger.serviceError('FETCH_ERROR', errorMessage, error, 'ScheduleStore');
    }
  },

  // Add new shift via backend
  addShift: async (shift) => {
    logger.action('addShift', shift as unknown as Record<string, unknown>, 'ScheduleStore');

    try {
      const newShift = await scheduleApi.createShift(shift as unknown as Omit<WeeklyShift, 'id'>);
      
      set(state => ({
        shifts: [...state.shifts, newShift],
      }));

      logger.info(`Shift added: ${newShift.id}`, 'ScheduleStore');
    } catch (error) {
      logger.error('Failed to add shift', error as Error, 'ScheduleStore');
      // Fallback to local add
      set(state => ({
        shifts: [...state.shifts, shift],
      }));
    }
  },

  // Remove shift via backend
  removeShift: async (id) => {
    logger.action('removeShift', { id }, 'ScheduleStore');

    try {
      await scheduleApi.deleteShift(id);
      
      set(state => ({
        shifts: state.shifts.filter(s => s.id !== id),
        assignments: state.assignments.filter(a => a.shiftId !== id),
      }));

      logger.info(`Shift removed: ${id}`, 'ScheduleStore');
    } catch (error) {
      logger.error('Failed to remove shift', error as Error, 'ScheduleStore');
      // Fallback to local removal
      set(state => ({
        shifts: state.shifts.filter(s => s.id !== id),
        assignments: state.assignments.filter(a => a.shiftId !== id),
      }));
    }
  },

  // Generate weekly draw (assignment algorithm)
  generateWeeklyDraw: (day, caddies) => {
    logger.action('generateWeeklyDraw', { day, caddieCount: caddies.length }, 'ScheduleStore');

    try {
      set({ loading: true, error: null });

      // Get shifts for the day, sorted by time
      const dayShifts = [...get().shifts]
        .filter(s => s.day === day)
        .sort((a, b) => a.time.localeCompare(b.time));

      const newAssignments: WeeklyAssignment[] = [];

      // Get initially available caddies (active with day marked as available)
      const initialPool = caddies.filter(c => {
        if (!c.isActive) return false;

        const availability = c.availability.find(a => a.day === day);
        return availability && availability.isAvailable;
      });

      // Sort caddies for processing (skipped first, then by weekend priority)
      const availableCaddies = [...initialPool].sort((a, b) => {
        if (a.isSkippedNextWeek !== b.isSkippedNextWeek) {
          return a.isSkippedNextWeek ? -1 : 1;
        }
        return a.weekendPriority - b.weekendPriority;
      });

      logger.debug(`Processing ${dayShifts.length} shifts with ${availableCaddies.length} available caddies`, 'ScheduleStore');

      // Process each shift
      dayShifts.forEach(shift => {
        const shiftMinutes = timeToMinutes(shift.time);

        logger.debug(`Processing shift: ${shift.id} at ${shift.time} (${shiftMinutes} minutes)`, 'ScheduleStore');

        shift.requirements.forEach(req => {
          let countAssigned = 0;

          while (countAssigned < req.count && availableCaddies.length > 0) {
            const eligibleIndex = availableCaddies.findIndex(c => {
              // Check category
              if (c.category !== req.category) {
                return false;
              }

              // Check availability
              const availability = c.availability.find(a => a.day === day);
              if (!availability || !availability.isAvailable) {
                return false;
              }

              // Check time range restriction
              if (availability.range && availability.range.type !== 'full') {
                const restrictionMinutes = timeToMinutes(
                  availability.range.time || '00:00 AM'
                );

                if (availability.range.type === 'after') {
                  // "From" time - can only go at or after
                  if (shiftMinutes < restrictionMinutes) {
                    return false;
                  }
                } else if (availability.range.type === 'before') {
                  // "Before" time - can only go before
                  if (shiftMinutes >= restrictionMinutes) {
                    return false;
                  }
                }
              }

              return true;
            });

            if (eligibleIndex !== -1) {
              const assigned = availableCaddies[eligibleIndex];

              newAssignments.push({
                shiftId: shift.id,
                caddieId: assigned.id,
                caddieName: assigned.name,
                caddieNumber: assigned.number,
                category: assigned.category || 'Unknown',
                time: shift.time,
              });

              // Remove from available pool
              availableCaddies.splice(eligibleIndex, 1);
              countAssigned++;

              logger.debug(
                `Assigned caddie ${assigned.number} (${assigned.name}) to shift ${shift.id}`,
                'ScheduleStore'
              );
            } else {
              // No more eligible caddies for this requirement
              logger.warn(`No eligible caddies found for ${req.category} category`, 'ScheduleStore');
              break;
            }
          }
        });
      });

      // Update caddie skip status
      const updatedCaddies = caddies.map(c => {
        const inInitialPool = initialPool.some(poolC => poolC.id === c.id);
        if (!inInitialPool) {
          return c;
        }

        const wasAssigned = newAssignments.some(a => a.caddieId === c.id);

        // If was available but not assigned, set skip priority for next week
        return {
          ...c,
          isSkippedNextWeek: !wasAssigned,
        };
      });

      // Update assignments (replace existing for the day)
      set(state => ({
        assignments: [
          ...state.assignments.filter(a => !dayShifts.some(s => s.id === a.shiftId)),
          ...newAssignments,
        ],
        loading: false,
      }));

      const assignedCount = newAssignments.length;
      const skippedCount = initialPool.length - assignedCount;

      logger.info(
        `Weekly draw generated for ${day}: ${assignedCount} assigned, ${skippedCount} skipped`,
        'ScheduleStore'
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate weekly draw';
      set({ loading: false, error: errorMessage });
      logger.serviceError('GENERATE_DRAW_ERROR', errorMessage, error, 'ScheduleStore');
    }
  },

  // Reset schedule by fetching from backend
  resetSchedule: async () => {
    logger.action('resetSchedule', undefined, 'ScheduleStore');

    try {
      await get().fetchShifts();
      await get().fetchAssignments();
      set({ error: null });
      logger.info('Schedule reset from backend', 'ScheduleStore');
    } catch (error) {
      logger.error('Failed to reset schedule', error as Error, 'ScheduleStore');
      set({ shifts: [], assignments: [], error: 'Failed to reset schedule' });
    }
  },
}));
