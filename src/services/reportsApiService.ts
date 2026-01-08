/**
 * Real Reports API Service
 * Connects to backend API for report operations
 */

import { request } from './apiClient'

interface StatisticsResponse {
  date: string
  totalServices: number
  totalAbsences: number
  totalLeaves: number
  totalLates: number
}

interface IncidentsResponse {
  incidents: Array<{
    id: string
    number: number
    name: string
    absencesCount: number
    leaveCount: number
    lateCount: number
    total: number
  }>
}

/**
 * Get daily statistics
 */
async function fetchStatistics(): Promise<StatisticsResponse> {
  return await request<StatisticsResponse>('/reports/statistics')
}

/**
 * Get caddies with incidents
 */
async function fetchIncidents(limit = 10): Promise<IncidentsResponse> {
  const response = await request<IncidentsResponse>(
    `/reports/incidents?limit=${limit}`
  )
  return response
}

/**
 * Download daily report as CSV
 */
async function downloadReportCSV(date?: string): Promise<void> {
  const params = date ? `?date=${date}` : ''
  const url = `http://localhost:3001/api/reports/csv${params}`

  const token = localStorage.getItem('token')
  const headers: HeadersInit = {}
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(url, {
    headers,
  })

  if (!response.ok) {
    throw new Error('Failed to download report')
  }

  const blob = await response.blob()
  const url2 = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url2
  link.download = `CaddiePro_Report_${date || new Date().toISOString().split('T')[0]}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url2)
}

export const reportsApiService = {
  fetchStatistics,
  fetchIncidents,
  downloadReportCSV,
}
