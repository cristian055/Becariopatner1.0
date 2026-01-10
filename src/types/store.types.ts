import type { Caddie, ListConfig, WeeklyShift, WeeklyAssignment, CaddieLocation, CaddieRole, DayAvailability } from './index'
import { CaddieStatus } from './index'

// Store Types
export interface CaddieState {
  caddies: Caddie[];
  loading: boolean;
  error: string | null;
}

export interface ListState {
  lists: ListConfig[];
  loading: boolean;
  error: string | null;
}

export interface WeeklyScheduleState {
  shifts: WeeklyShift[];
  assignments: WeeklyAssignment[];
  loading: boolean;
  error: string | null;
}

export interface DispatchState {
  lastDispatchBatch: { ids: string[]; timestamp: number } | null;
  showPopup: boolean;
}

// Service Types
export interface CaddieFilters {
  searchTerm?: string;
  category?: 'All' | 'Primera' | 'Segunda' | 'Tercera';
  activeStatus?: 'All' | 'Active' | 'Inactive';
  location?: CaddieLocation;
  role?: CaddieRole;
  includeInactive?: boolean;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export interface CreateCaddieInput {
  name: string;
  number: number;
  category: 'Primera' | 'Segunda' | 'Tercera';
  location: CaddieLocation;
  role: CaddieRole;
  availability: DayAvailability[];
  weekendPriority?: number;
}

export interface UpdateCaddieInput {
  id: string;
  updates: Partial<Omit<Caddie, 'id' | 'historyCount' | 'absencesCount' | 'lateCount' | 'leaveCount' | 'lastActionTime'>> & {
    category?: 'Primera' | 'Segunda' | 'Tercera';
    location?: CaddieLocation;
    role?: CaddieRole;
    weekendPriority?: number;
    historyCount?: number;
    absencesCount?: number;
    lateCount?: number;
    leaveCount?: number;
  };
}

export interface BulkUpdateInput {
  updates: Array<{ id: string; status: CaddieStatus; listId?: string }>;
}

export interface CreateListInput {
  name: string;
  category: 'Primera' | 'Segunda' | 'Tercera';
  rangeStart: number;
  rangeEnd: number;
}

export interface UpdateListInput {
  id: string;
  updates: Partial<ListConfig>;
}

export interface WeeklyShiftInput {
  id: string;
  day: string;
  time: string;
  requirements: Array<{ category: 'Primera' | 'Segunda' | 'Tercera'; count: number }>;
}

// Error Types
export class ServiceError extends Error {
  public readonly code: string;
  public readonly details?: unknown;

  constructor(message: string, code: string, details?: unknown) {
    super(message);
    this.name = 'ServiceError';
    this.code = code;
    this.details = details;
  }
}

export interface ApiError {
  message: string;
  code: string;
  statusCode?: number;
}

// Logger Types
export interface LogLevel {
  DEBUG: 'DEBUG';
  INFO: 'INFO';
  WARN: 'WARN';
  ERROR: 'ERROR';
}

export type LogEntry = {
  level: string;
  message: string;
  timestamp: string;
  context?: string;
  error?: Error;
};
