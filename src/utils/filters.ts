import type { Caddie, CaddieLocation, CaddieRole } from '../types'
import type { CaddieFilters } from '../types/store.types'
import { sanitizeSearchTerm, isValidTimeFormat } from './validation';

/**
 * Filter caddies by search term
 * @param caddies - Array of caddies to filter
 * @param searchTerm - Search term to filter by
 * @returns Filtered caddies
 */
export const filterBySearchTerm = (
  caddies: Caddie[],
  searchTerm: string
): Caddie[] => {
  if (!searchTerm || searchTerm.trim() === '') {
    return caddies;
  }

  const sanitizedTerm = sanitizeSearchTerm(searchTerm);

  return caddies.filter(caddie => {
    const nameMatch = caddie.name.toLowerCase().includes(sanitizedTerm);
    const numberMatch = caddie.number.toString().includes(sanitizedTerm);

    return nameMatch || numberMatch;
  });
};

/**
 * Filter caddies by category
 * @param caddies - Array of caddies to filter
 * @param category - Category to filter by
 * @returns Filtered caddies
 */
export const filterByCategory = (
  caddies: Caddie[],
  category: CaddieFilters['category']
): Caddie[] => {
  if (!category || category === 'All') {
    return caddies;
  }

  return caddies.filter(caddie => caddie.category === category);
};

/**
 * Filter caddies by active status
 * @param caddies - Array of caddies to filter
 * @param activeStatus - Active status to filter by
 * @returns Filtered caddies
 */
export const filterByActiveStatus = (
  caddies: Caddie[],
  activeStatus: CaddieFilters['activeStatus']
): Caddie[] => {
  if (!activeStatus || activeStatus === 'All') {
    return caddies;
  }

  if (activeStatus === 'Active') {
    return caddies.filter(caddie => caddie.isActive);
  }

  if (activeStatus === 'Inactive') {
    return caddies.filter(caddie => !caddie.isActive);
  }

  return caddies;
};

/**
 * Filter caddies by location
 * @param caddies - Array of caddies to filter
 * @param location - Location to filter by
 * @returns Filtered caddies
 */
export const filterByLocation = (
  caddies: Caddie[],
  location?: CaddieLocation
): Caddie[] => {
  if (!location) {
    return caddies;
  }

  return caddies.filter(caddie => caddie.location === location);
};

/**
 * Filter caddies by role
 * @param caddies - Array of caddies to filter
 * @param role - Role to filter by
 * @returns Filtered caddies
 */
export const filterByRole = (
  caddies: Caddie[],
  role?: CaddieRole
): Caddie[] => {
  if (!role) {
    return caddies;
  }

  return caddies.filter(caddie => caddie.role === role);
};

/**
 * Filter caddies by availability on specific day
 * @param caddies - Array of caddies to filter
 * @param day - Day of week to check
 * @returns Caddies available on specified day
 */
export const filterByAvailability = (
  caddies: Caddie[],
  day: string
): Caddie[] => {
  return caddies.filter(caddie => {
    if (!caddie.isActive) return false;

    const availability = caddie.availability.find(a => a.day === day);
    return availability && availability.isAvailable;
  });
};

/**
 * Apply all filters to caddies
 * @param caddies - Array of caddies to filter
 * @param filters - Filter criteria
 * @returns Filtered caddies
 */
export const applyCaddieFilters = (
  caddies: Caddie[],
  filters: CaddieFilters
): Caddie[] => {
  let filtered = [...caddies];

  if (filters.searchTerm !== undefined) {
    filtered = filterBySearchTerm(filtered, filters.searchTerm);
  }

  if (filters.category !== undefined) {
    filtered = filterByCategory(filtered, filters.category);
  }

  if (filters.activeStatus !== undefined) {
    filtered = filterByActiveStatus(filtered, filters.activeStatus);
  }

  if (filters.location !== undefined) {
    filtered = filterByLocation(filtered, filters.location);
  }

  if (filters.role !== undefined) {
    filtered = filterByRole(filtered, filters.role);
  }

  return filtered;
};

/**
 * Filter caddies for queue (active and available/late)
 * @param caddies - Array of caddies to filter
 * @returns Caddies ready for queue
 */
export const filterForQueue = (caddies: Caddie[]): Caddie[] => {
  return caddies.filter(
    caddie =>
      caddie.isActive &&
      (caddie.status === 'AVAILABLE' ||
        caddie.status === 'LATE')
  );
};

/**
 * Filter caddies for returns (in field or in prep)
 * @param caddies - Array of caddies to filter
 * @returns Caddies that need to return
 */
export const filterForReturns = (caddies: Caddie[]): Caddie[] => {
  return caddies.filter(
    caddie =>
      caddie.isActive &&
      (caddie.status === 'IN_FIELD' ||
        caddie.status === 'IN_PREP')
  );
};

/**
 * Filter caddies for weekly scheduling (active with availability)
 * @param caddies - Array of caddies to filter
 * @param day - Day of week to check availability
 * @returns Caddies available for scheduling
 */
export const filterForWeeklySchedule = (
  caddies: Caddie[],
  day: string
): Caddie[] => {
  return caddies.filter(caddie => {
    if (!caddie.isActive) return false;

    const availability = caddie.availability.find(a => a.day === day);
    return availability && availability.isAvailable;
  });
};

/**
 * Filter caddies by list range
 * @param caddies - Array of caddies to filter
 * @param rangeStart - Start of range
 * @param rangeEnd - End of range
 * @returns Caddies in specified range
 */
export const filterByListRange = (
  caddies: Caddie[],
  rangeStart: number,
  rangeEnd: number
): Caddie[] => {
  return caddies.filter(
    caddie => caddie.isActive && caddie.number >= rangeStart && caddie.number <= rangeEnd
  );
};

/**
 * Get caddies with skip priority for next week
 * @param caddies - Array of caddies to check
 * @returns Caddies that should have priority next week
 */
export const filterSkippedCaddies = (caddies: Caddie[]): Caddie[] => {
  return caddies.filter(caddie => caddie.isSkippedNextWeek);
};

/**
 * Filter caddies that were assigned in specific batch
 * @param caddies - Array of caddies
 * @param batchIds - IDs of caddies in batch
 * @returns Caddies in the dispatch batch
 */
export const filterByDispatchBatch = (
  caddies: Caddie[],
  batchIds: string[]
): Caddie[] => {
  return caddies.filter(caddie => batchIds.includes(caddie.id));
};
