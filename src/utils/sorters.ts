import type { Caddie, ListConfig } from '@/types'
import { LIST_ORDER_TYPES } from '@/constants/app.constants'

/**
 * Sort caddies by number (ascending)
 * @param caddies - Array of caddies to sort
 * @returns Sorted caddies by number
 */
export const sortByNumber = (caddies: Caddie[]): Caddie[] => {
  return [...caddies].sort((a, b) => a.number - b.number);
};

/**
 * Sort caddies by number (descending)
 * @param caddies - Array of caddies to sort
 * @returns Sorted caddies by number descending
 */
export const sortByNumberDesc = (caddies: Caddie[]): Caddie[] => {
  return [...caddies].sort((a, b) => b.number - a.number);
};

/**
 * Sort caddies by name (alphabetical)
 * @param caddies - Array of caddies to sort
 * @returns Sorted caddies by name
 */
export const sortByName = (caddies: Caddie[]): Caddie[] => {
  return [...caddies].sort((a, b) =>
    a.name.localeCompare(b.name)
  );
};

/**
 * Sort caddies by status priority
 * Status priority: AVAILABLE > LATE > IN_PREP > IN_FIELD > ON_LEAVE > ABSENT
 * @param caddies - Array of caddies to sort
 * @returns Sorted caddies by status
 */
export const sortByStatus = (caddies: Caddie[]): Caddie[] => {
  const statusPriority: Record<string, number> = {
    AVAILABLE: 1,
    LATE: 2,
    IN_PREP: 3,
    IN_FIELD: 4,
    ON_LEAVE: 5,
    ABSENT: 6,
  };

  return [...caddies].sort((a, b) => statusPriority[a.status] - statusPriority[b.status]);
};

/**
 * Sort caddies by weekend priority (for shuffled lists)
 * @param caddies - Array of caddies to sort
 * @returns Sorted caddies by weekend priority
 */
export const sortByWeekendPriority = (caddies: Caddie[]): Caddie[] => {
  return [...caddies].sort((a, b) => a.weekendPriority - b.weekendPriority);
};

/**
 * Sort caddies by skipped priority (skipped first)
 * @param caddies - Array of caddies to sort
 * @returns Sorted caddies with skipped first
 */
export const sortBySkippedPriority = (caddies: Caddie[]): Caddie[] => {
  return [...caddies].sort((a, b) => {
    // Skipped caddies come first
    if (a.isSkippedNextWeek && !b.isSkippedNextWeek) return -1;
    if (!a.isSkippedNextWeek && b.isSkippedNextWeek) return 1;
    // Then by weekend priority
    return a.weekendPriority - b.weekendPriority;
  });
};

/**
 * Sort caddies by category and then by number
 * @param caddies - Array of caddies to sort
 * @returns Sorted caddies by category and number
 */
export const sortByCategoryAndNumber = (caddies: Caddie[]): Caddie[] => {
  const categoryPriority: Record<string, number> = {
    Primera: 1,
    Segunda: 2,
    Tercera: 3,
  };

  return [...caddies].sort((a, b) => {
    const catDiff = categoryPriority[a.category || 'Tercera'] - categoryPriority[b.category || 'Tercera'];
    if (catDiff !== 0) return catDiff;
    return a.number - b.number;
  });
};

/**
 * Sort caddies by service history count
 * @param caddies - Array of caddies to sort
 * @returns Sorted caddies by service count (descending)
 */
export const sortByServiceCount = (caddies: Caddie[]): Caddie[] => {
  return [...caddies].sort((a, b) => b.historyCount - a.historyCount);
};

/**
 * Sort caddies for queue display (status first, then by list order)
 * @param caddies - Array of caddies to sort
 * @param list - List configuration
 * @returns Sorted caddies for queue
 */
export const sortForQueue = (caddies: Caddie[], list: ListConfig): Caddie[] => {
  return [...caddies].sort((a, b) => {
    // Sort by status first (AVAILABLE before LATE)
    if (a.status !== b.status) {
      const statusPriority: Record<string, number> = {
        AVAILABLE: 1,
        LATE: 2,
        IN_PREP: 3,
        IN_FIELD: 4,
        ON_LEAVE: 5,
        ABSENT: 6,
      };
      return statusPriority[a.status] - statusPriority[b.status];
    }

    // Then by list order
    switch (list.order) {
      case LIST_ORDER_TYPES.ASC:
        return a.number - b.number;
      case LIST_ORDER_TYPES.DESC:
        return b.number - a.number;
      case LIST_ORDER_TYPES.RANDOM:
      case LIST_ORDER_TYPES.MANUAL:
        return a.weekendPriority - b.weekendPriority;
      default:
        return a.number - b.number;
    }
  });
};

/**
 * Fisher-Yates shuffle algorithm for randomizing list order
 * @param array - Array to shuffle
 * @returns Shuffled array
 */
export const fisherYatesShuffle = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  let currentIndex = shuffled.length;

  // While there remain elements to shuffle
  while (currentIndex !== 0) {
    // Pick a remaining element
    const randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // Swap it with the current element
    [shuffled[currentIndex], shuffled[randomIndex]] = [
      shuffled[randomIndex],
      shuffled[currentIndex],
    ];
  }

  return shuffled;
};

/**
 * Assign random priorities to caddies
 * @param caddies - Array of caddies to prioritize
 * @returns Caddies with assigned weekend priorities
 */
export const assignRandomPriorities = (caddies: Caddie[]): Caddie[] => {
  const priorities = fisherYatesShuffle(
    Array.from({ length: caddies.length }, (_, i) => i + 1)
  );

  return caddies.map((caddie, index) => ({
    ...caddie,
    weekendPriority: priorities[index],
  }));
};

/**
 * Sort weekly shifts by time
 * @param shifts - Array of shifts to sort
 * @returns Sorted shifts by time
 */
export const sortShiftsByTime = (shifts: any[]): any[] => {
  return [...shifts].sort((a, b) => a.time.localeCompare(b.time));
};

/**
 * Get top N caddies from sorted list
 * @param caddies - Array of caddies
 * @param count - Number of caddies to return
 * @returns Top N caddies
 */
export const getTopNCaddies = (
  caddies: Caddie[],
  count: number
): Caddie[] => {
  return caddies.slice(0, Math.max(0, count));
};

/**
 * Group caddies by category
 * @param caddies - Array of caddies to group
 * @returns Object with caddies grouped by category
 */
export const groupByCategory = (
  caddies: Caddie[]
): Record<string, Caddie[]> => {
  return caddies.reduce(
    (groups, caddie) => {
      const category = caddie.category || 'Unknown';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(caddie);
      return groups;
    },
    {} as Record<string, Caddie[]>
  );
};

/**
 * Group caddies by location
 * @param caddies - Array of caddies to group
 * @returns Object with caddies grouped by location
 */
export const groupByLocation = (
  caddies: Caddie[]
): Record<string, Caddie[]> => {
  return caddies.reduce(
    (groups, caddie) => {
      const location = caddie.location;
      if (!groups[location]) {
        groups[location] = [];
      }
      groups[location].push(caddie);
      return groups;
    },
    {} as Record<string, Caddie[]>
  );
};

/**
 * Group caddies by role
 * @param caddies - Array of caddies to group
 * @returns Object with caddies grouped by role
 */
export const groupByRole = (
  caddies: Caddie[]
): Record<string, Caddie[]> => {
  return caddies.reduce(
    (groups, caddie) => {
      const role = caddie.role;
      if (!groups[role]) {
        groups[role] = [];
      }
      groups[role].push(caddie);
      return groups;
    },
    {} as Record<string, Caddie[]>
  );
};

/**
 * Sort with multiple criteria
 * @param caddies - Array of caddies to sort
 * @param criteria - Array of sort functions to apply in order
 * @returns Sorted caddies
 */
export const multiCriteriaSort = (
  caddies: Caddie[],
  criteria: Array<(a: Caddie, b: Caddie) => number>
): Caddie[] => {
  return [...caddies].sort((a, b) => {
    for (const comparator of criteria) {
      const result = comparator(a, b);
      if (result !== 0) return result;
    }
    return 0;
  });
};
