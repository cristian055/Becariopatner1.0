/**
 * Attendance API Service
 * Connects to backend API for daily attendance operations
 */

import { request } from './apiClient'
import type { DailyAttendance, DailyAttendanceStatus } from '../types'

interface DailyAttendanceResponse {
  attendance: DailyAttendance[]
  date: string
}

interface DailyAttendanceStatsResponse {
  date: string
  total: number
  present: number
  late: number
  absent: number
  onLeave: number
  worked: number
}

interface CreateAttendanceInput {
  caddieId: string
  date: string
  status: DailyAttendanceStatus
}

interface UpdateAttendanceInput {
  status?: DailyAttendanceStatus
  servicesCount?: number
}

async function createDailyAttendance(input: CreateAttendanceInput): Promise<DailyAttendance> {
  return await request<DailyAttendance>('/attendance/daily', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

async function getDailyAttendance(date: string): Promise<DailyAttendance[]> {
  const response = await request<DailyAttendanceResponse>(`/attendance/daily/${date}`)
  return response.attendance
}

async function getDailyAttendanceStats(date: string): Promise<DailyAttendanceStatsResponse> {
  return await request<DailyAttendanceStatsResponse>(`/attendance/daily/${date}/stats`)
}

async function updateDailyAttendance(id: string, input: UpdateAttendanceInput): Promise<DailyAttendance> {
  return await request<DailyAttendance>(`/attendance/daily/${id}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  })
}

async function getDailyAttendanceReport(date: string): Promise<{
  date: string
  stats: {
    worked: number
    absent: number
    onLeave: number
    late: number
    total: number
  }
  attendance: DailyAttendance[]
}> {
  return await request<{
    date: string
    stats: {
      worked: number
      absent: number
      onLeave: number
      late: number
      total: number
    }
    attendance: DailyAttendance[]
  }>(`/reports/daily/${date}/attendance`)
}

async function closeDay(date: string): Promise<{
  message: string
  data: {
    date: string
    recordsProcessed: number
  }
}> {
  return await request<{
    message: string
    data: {
      date: string
      recordsProcessed: number
    }
  }>(`/reports/close/${date}`, {
    method: 'POST',
  })
}

export const attendanceApiService = {
  createDailyAttendance,
  getDailyAttendance,
  getDailyAttendanceStats,
  updateDailyAttendance,
  getDailyAttendanceReport,
  closeDay,
}
