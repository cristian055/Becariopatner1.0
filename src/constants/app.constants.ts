

// Time Constants
export const TIME_FORMAT_12H = 'h:mm AM/PM';
export const TIME_FORMAT_24H = 'HH:mm';
export const DEFAULT_AVAILABILITY_TIME = '08:00 AM';
export const DISPATCH_POPUP_DURATION = 8000; // 8 seconds

// List Order Types
export const LIST_ORDER_TYPES = {
  ASC: 'ASC',
  DESC: 'DESC',
  RANDOM: 'RANDOM',
  MANUAL: 'MANUAL',
} as const;

export type ListOrderType = typeof LIST_ORDER_TYPES[keyof typeof LIST_ORDER_TYPES];

// Caddie Categories
export const CADDIE_CATEGORIES = {
  PRIMERA: 'Primera',
  SEGUNDA: 'Segunda',
  TERCERA: 'Tercera',
} as const;

export type CaddieCategory = typeof CADDIE_CATEGORIES[keyof typeof CADDIE_CATEGORIES];

// Availability Types
export const AVAILABILITY_TYPES = {
  FULL: 'full',
  BEFORE: 'before',
  AFTER: 'after',
  BETWEEN: 'between',
} as const;

export type AvailabilityType = typeof AVAILABILITY_TYPES[keyof typeof AVAILABILITY_TYPES];

// Days of Week
export const DAYS_OF_WEEK = {
  MONDAY: 'Monday',
  TUESDAY: 'Tuesday',
  WEDNESDAY: 'Wednesday',
  THURSDAY: 'Thursday',
  FRIDAY: 'Friday',
  SATURDAY: 'Saturday',
  SUNDAY: 'Sunday',
} as const;

export type DayOfWeek = typeof DAYS_OF_WEEK[keyof typeof DAYS_OF_WEEK];

// Default Availability
export const DEFAULT_AVAILABILITY = [
  {
    day: 'Friday',
    isAvailable: true,
    range: { type: 'after', time: '09:30 AM' },
  },
  {
    day: 'Saturday',
    isAvailable: true,
    range: { type: 'full' },
  },
  {
    day: 'Sunday',
    isAvailable: true,
    range: { type: 'full' },
  },
] as const;

// Initial Caddie Data
export const INITIAL_CADDIES_COUNT = 120;
export const PRIMERA_CATEGORY_RANGE = { start: 1, end: 40 };
export const SEGUNDA_CATEGORY_RANGE = { start: 41, end: 80 };
export const TERCERA_CATEGORY_RANGE = { start: 81, end: 120 };

// Initial List Configuration
export const INITIAL_LISTS = [
  {
    id: 'list-1',
    name: 'First Category',
    order: LIST_ORDER_TYPES.ASC,
    rangeStart: PRIMERA_CATEGORY_RANGE.start,
    rangeEnd: PRIMERA_CATEGORY_RANGE.end,
    category: CADDIE_CATEGORIES.PRIMERA,
  },
  {
    id: 'list-2',
    name: 'Second Category',
    order: LIST_ORDER_TYPES.ASC,
    rangeStart: SEGUNDA_CATEGORY_RANGE.start,
    rangeEnd: SEGUNDA_CATEGORY_RANGE.end,
    category: CADDIE_CATEGORIES.SEGUNDA,
  },
  {
    id: 'list-3',
    name: 'Third Category',
    order: LIST_ORDER_TYPES.ASC,
    rangeStart: TERCERA_CATEGORY_RANGE.start,
    rangeEnd: TERCERA_CATEGORY_RANGE.end,
    category: CADDIE_CATEGORIES.TERCERA,
  },
] as const;

// Validation Constants
export const VALIDATION = {
  MAX_CADDIE_NUMBER: 999,
  MIN_CADDIE_NUMBER: 1,
  MIN_CADDIE_NAME_LENGTH: 2,
  MAX_CADDIE_NAME_LENGTH: 100,
  MIN_CATEGORY_START: 1,
  MAX_CATEGORY_END: 999,
} as const;

// API Constants
export const API = {
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
} as const;

// Error Codes
export const ERROR_CODES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  SERVER_ERROR: 'SERVER_ERROR',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  CADDIE_CREATED: 'Caddie created successfully',
  CADDIE_UPDATED: 'Caddie updated successfully',
  CADDIE_DELETED: 'Caddie deleted successfully',
  LIST_UPDATED: 'List configuration updated',
  WEEKLY_DRAW_GENERATED: 'Weekly schedule generated successfully',
  BULK_DISPATCH: 'Caddies dispatched successfully',
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  REQUIRED_FIELD: 'This field is required',
  INVALID_CADDIE_NUMBER: 'Caddie number must be between 1 and 999',
  DUPLICATE_CADDIE_NUMBER: 'Caddie number is already assigned',
  INVALID_RANGE: 'Invalid category range: end must be greater than start',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  LOADING_ERROR: 'Failed to load data. Please try again.',
} as const;

// Pagination Constants
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  THEME: 'caddiepro_theme',
  SIDEBAR_STATE: 'caddiepro_sidebar',
  USER_PREFERENCES: 'caddiepro_preferences',
} as const;

// Theme Constants
export const THEME = {
  LIGHT: 'light',
  DARK: 'dark',
} as const;
