// Core types matching frontend
export enum CaddieStatus {
  AVAILABLE = 'AVAILABLE',
  IN_PREP = 'IN_PREP',
  IN_FIELD = 'IN_FIELD',
  LATE = 'LATE',
  ABSENT = 'ABSENT',
  ON_LEAVE = 'ON_LEAVE'
}

export type CaddieLocation = 'Llanogrande' | 'Medellín'
export type CaddieRole = 'Golf' | 'Tennis' | 'Hybrid'
export type CaddieCategory = 'Primera' | 'Segunda' | 'Tercera'

export interface TimeAvailability {
  type: 'before' | 'after' | 'between' | 'full'
  time?: string
  endTime?: string
}

export interface DayAvailability {
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday'
  isAvailable: boolean
  range?: TimeAvailability
}

export interface Caddie {
  id: string
  name: string
  number: number
  status: CaddieStatus
  isActive: boolean
  listId: string | null
  historyCount: number
  absencesCount: number
  lateCount: number
  leaveCount: number
  lastActionTime: string
  category: CaddieCategory
  location: CaddieLocation
  role: CaddieRole
  availability: DayAvailability[]
  weekendPriority: number
  isSkippedNextWeek?: boolean
}

export interface ListConfig {
  id: string
  name: string
  order: 'ASC' | 'DESC' | 'RANDOM' | 'MANUAL'
  rangeStart: number
  rangeEnd: number
  category: CaddieCategory
}

export interface WeeklyShiftRequirement {
  category: CaddieCategory
  count: number
}

export interface WeeklyShift {
  id: string
  day: string
  time: string
  requirements: WeeklyShiftRequirement[]
}

export interface WeeklyAssignment {
  shiftId: string
  caddieId: string
  caddieName: string
  caddieNumber: number
  category: string
  time: string
}

export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'operator' | 'viewer'
  isActive: boolean
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  perPage: number
}

// JWT Payload
export interface JwtPayload {
  userId: string
  email: string
  role: string
  iat?: number
  exp?: number
}
