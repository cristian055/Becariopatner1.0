/**
 * Real Schedule API Service
 * Connects to backend API for scheduling operations
 */

import { request } from './apiClient'
import type { WeeklyShift, WeeklyAssignment } from '../types'

interface ShiftsResponse {
  shifts: WeeklyShift[]
}

interface AssignmentsResponse {
  assignments: WeeklyAssignment[]
}

interface GenerateDrawResponse {
  assignedCount: number
  skippedCount: number
  assignments: WeeklyAssignment[]
}

/**
 * Get all weekly shifts
 */
async function fetchShifts(
  filters: {
    day?: string
    location?: string
  } = {}
): Promise<WeeklyShift[]> {
  const params = new URLSearchParams()
  if (filters.day) params.append('day', filters.day)
  if (filters.location) params.append('location', filters.location)

  const endpoint = params.toString() ? `/schedule/shifts?${params.toString()}` : '/schedule/shifts'
  const response = await request<ShiftsResponse>(endpoint)

  return response.shifts
}

/**
 * Create a new shift
 */
async function createShift(shift: {
  id?: string
  day: string
  time: string
  location: string
  requirements: Array<{ category: string; count: number }>
}): Promise<WeeklyShift> {
  return await request<WeeklyShift>('/schedule/shifts', {
    method: 'POST',
    body: JSON.stringify(shift),
  })
}

/**
 * Delete a shift
 */
async function deleteShift(id: string): Promise<void> {
  await request<{ message: string }>(`/schedule/shifts/${id}`, {
    method: 'DELETE',
  })
}

/**
 * Get all weekly assignments
 */
async function fetchAssignments(
  filters: {
    shiftId?: string
    day?: string
  } = {}
): Promise<WeeklyAssignment[]> {
  const params = new URLSearchParams()
  if (filters.shiftId) params.append('shiftId', filters.shiftId)
  if (filters.day) params.append('day', filters.day)

  const endpoint = params.toString() ? `/schedule/assignments?${params.toString()}` : '/schedule/assignments'
  const response = await request<AssignmentsResponse>(endpoint)

  return response.assignments
}

/**
 * Generate weekly draw for a specific day
 */
async function generateWeeklyDraw(day: string, location: string): Promise<GenerateDrawResponse> {
  return await request<GenerateDrawResponse>('/schedule/generate', {
    method: 'POST',
    body: JSON.stringify({ day, location }),
  })
}

/**
 * Reset weekly schedule
 */
async function resetSchedule(): Promise<void> {
  await request<{ message: string }>('/schedule/reset', {
    method: 'POST',
  })
}

export const scheduleApiService = {
  fetchShifts,
  createShift,
  deleteShift,
  fetchAssignments,
  generateWeeklyDraw,
  resetSchedule,
}
