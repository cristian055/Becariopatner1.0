export enum CaddieStatus {
  AVAILABLE = 'AVAILABLE',
  IN_PREP = 'IN_PREP',
  IN_FIELD = 'IN_FIELD',
  LATE = 'LATE',
  ABSENT = 'ABSENT',
  ON_LEAVE = 'ON_LEAVE'
}

export enum DailyAttendanceStatus {
  PRESENT = 'PRESENT',
  LATE = 'LATE',
  ABSENT = 'ABSENT',
  ON_LEAVE = 'ON_LEAVE'
}

export type CaddieLocation = 'Llanogrande' | 'Medellín';
export type CaddieRole = 'Golf' | 'Tennis' | 'Hybrid';

export interface TimeAvailability {
  type: 'before' | 'after' | 'between' | 'full';
  time?: string;
  endTime?: string;
}

export interface DayAvailability {
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday'
  isAvailable: boolean
  range?: TimeAvailability
}

export interface Caddie {
  id: string;
  name: string;
  number: number;
  status: CaddieStatus;
  isActive: boolean; // Maestro: Activo o Inactivo
  listId: string | null;
  historyCount: number;
  absencesCount: number;
  lateCount: number;
  leaveCount: number;
  lastActionTime: string;
  category?: 'Primera' | 'Segunda' | 'Tercera';
  location: CaddieLocation;
  role: CaddieRole;
  availability: DayAvailability[];
  weekendPriority: number;
  isSkippedNextWeek?: boolean; 
}

export interface WeeklyShiftRequirement {
  category: 'Primera' | 'Segunda' | 'Tercera';
  count: number;
}

export interface WeeklyShift {
  id: string;
  day: string;
  time: string; 
  requirements: WeeklyShiftRequirement[];
}

export interface WeeklyAssignment {
  shiftId: string;
  caddieId: string;
  caddieName: string;
  caddieNumber: number;
  category: string;
  time: string;
}

export interface ListConfig {
  id: string;
  name: string;
  order: 'ASC' | 'DESC' | 'RANDOM' | 'MANUAL';
  rangeStart: number;
  rangeEnd: number;
  category: 'Primera' | 'Segunda' | 'Tercera';
}

export interface DailyAttendance {
  id: string;
  caddieId: string;
  caddie?: {
    id: string;
    name: string;
    number: number;
    category: 'Primera' | 'Segunda' | 'Tercera';
    location: string;
  };
  date: string;
  status: DailyAttendanceStatus;
  arrivalTime?: string;
  servicesCount: number;
  createdAt?: string;
  updatedAt?: string;
}

export type ViewType = 'public-queue' | 'lists' | 'caddies' | 'reports' | 'weekly-draw' | 'weekly-monitor';

export interface Message {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
}