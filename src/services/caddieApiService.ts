/**
 * Real Caddie API Service
 * Connects to backend API for caddie operations
 */

import { request } from './apiClient'
import type { Caddie, CaddieStatus } from '../types'
import type {
  CreateCaddieInput,
  UpdateCaddieInput,
  BulkUpdateInput,
  CaddieFilters,
} from '../types/store.types'

interface CaddieListResponse {
  caddies: Caddie[]
  total: number
}

interface CaddieStatisticsResponse {
  total: number
  active: number
  inactive: number
  byStatus: Record<CaddieStatus, number>
  byCategory: Record<string, number>
}

interface QueueResponse {
  queueCaddies: Array<{
    id: string
    name: string
    number: number
    status: CaddieStatus
    category: 'Primera' | 'Segunda' | 'Tercera'
    weekendPriority: number
  }>
}

interface ReturnsResponse {
  returnCaddies: Array<{
    id: string
    name: string
    number: number
    status: CaddieStatus
    category: 'Primera' | 'Segunda' | 'Tercera'
  }>
}

interface AvailabilityResponse {
  day: string
  availableCaddies: Caddie[]
}

/**
 * Get all caddies with optional filters
 */
async function fetchCaddies(filters: CaddieFilters = {}): Promise<Caddie[]> {
  const params = new URLSearchParams()

  if (filters.searchTerm) params.append('searchTerm', filters.searchTerm)
  if (filters.category && filters.category !== 'All') {
    params.append('category', filters.category)
  }
  if (filters.activeStatus && filters.activeStatus !== 'All') {
    params.append('activeStatus', filters.activeStatus)
  }
  if (filters.location) params.append('location', filters.location)
  if (filters.role) params.append('role', filters.role)
  if (filters.includeInactive !== undefined) {
    params.append('includeInactive', String(filters.includeInactive))
  }

  const endpoint = params.toString() ? `/caddies?${params.toString()}` : '/caddies'
  const response = await request<CaddieListResponse>(endpoint)

  return response.caddies
}

/**
 * Get caddie statistics
 */
async function fetchCaddieStatistics(): Promise<CaddieStatisticsResponse> {
  return await request<CaddieStatisticsResponse>('/caddies/statistics')
}

/**
 * Get queue caddies (active and available/late)
 */
async function fetchQueueCaddies(): Promise<Array<{
  id: string
  name: string
  number: number
  status: CaddieStatus
  category: 'Primera' | 'Segunda' | 'Tercera'
  weekendPriority: number
}>> {
  const response = await request<QueueResponse>('/caddies/queue')
  return response.queueCaddies
}

/**
 * Get caddies that need to return
 */
async function fetchReturnCaddies(): Promise<Array<{
  id: string
  name: string
  number: number
  status: CaddieStatus
  category: 'Primera' | 'Segunda' | 'Tercera'
}>> {
  const response = await request<ReturnsResponse>('/caddies/returns')
  return response.returnCaddies
}

/**
 * Get caddies by availability on specific day
 */
async function fetchCaddiesByAvailability(
  day: string,
  includeInactive = false
): Promise<Caddie[]> {
  const endpoint = includeInactive
    ? `/caddies/availability/${day}?includeInactive=true`
    : `/caddies/availability/${day}`

  const response = await request<AvailabilityResponse>(endpoint)
  return response.availableCaddies
}

/**
 * Create a new caddie
 */
async function createCaddie(input: CreateCaddieInput): Promise<Caddie> {
  return await request<Caddie>('/caddies', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

/**
 * Update a caddie
 */
async function updateCaddie(input: UpdateCaddieInput): Promise<Caddie> {
  return await request<Caddie>(`/caddies/${input.id}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  })
}

/**
 * Delete a caddie (soft delete)
 */
async function deleteCaddie(id: string): Promise<void> {
  await request<{ message: string }>(`/caddies/${id}`, {
    method: 'DELETE',
  })
}

/**
 * Bulk update caddies
 */
async function bulkUpdateCaddies(input: BulkUpdateInput): Promise<{
  dispatched: string[]
  timestamp: number
}> {
  return await request<{ dispatched: string[]; timestamp: number }>(
    '/dispatch/bulk',
    {
      method: 'POST',
      body: JSON.stringify(input),
    }
  )
}

export const caddieApiService = {
  fetchCaddies,
  fetchCaddieStatistics,
  fetchQueueCaddies,
  fetchReturnCaddies,
  fetchCaddiesByAvailability,
  createCaddie,
  updateCaddie,
  deleteCaddie,
  bulkUpdateCaddies,
}
