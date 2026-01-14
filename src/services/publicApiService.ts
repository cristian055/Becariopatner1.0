/**
 * Public API Service
 * Handles requests to public endpoints that do not require authentication
 * Used by the monitor view to display caddie queues without login
 */

import type { CaddieStatus } from '../types'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

export interface PublicCaddie {
  id: string
  name: string
  number: number
  status: CaddieStatus
  category: 'PRIMERA' | 'SEGUNDA' | 'TERCERA'
  weekendPriority: number
  location?: string
  role?: string
}

interface PublicListsResponse {
  success: boolean
  data: {
    Primera: PublicCaddie[]
    Segunda: PublicCaddie[]
    Tercera: PublicCaddie[]
    lastUpdate: string
  }
}

interface PublicSingleListResponse {
  success: boolean
  data: {
    listNumber: number
    category: 'Primera' | 'Segunda' | 'Tercera'
    caddies: PublicCaddie[]
    lastUpdate: string
  }
}

interface PublicQueueResponse {
  success: boolean
  data: {
    Primera: PublicCaddie[]
    Segunda: PublicCaddie[]
    Tercera: PublicCaddie[]
    lastUpdate: string
  }
}

interface PublicApiError {
  success: false
  error: {
    code: string
    message: string
  }
}

/**
 * Generic public request handler (no authentication required)
 */
async function publicRequest<T>(endpoint: string): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const json = await response.json()

    if (!response.ok || !json.success) {
      const errorData = json as PublicApiError
      throw new Error(errorData.error?.message || 'Public API request failed')
    }

    return json.data as T
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Network error accessing public API')
  }
}

/**
 * Get all public lists (Primera, Segunda, Tercera)
 * No authentication required
 */
async function fetchPublicLists(filters?: {
  status?: string
  location?: string
}): Promise<{
  Primera: PublicCaddie[]
  Segunda: PublicCaddie[]
  Tercera: PublicCaddie[]
  lastUpdate: string
}> {
  let endpoint = '/public/lists'

  if (filters) {
    const params = new URLSearchParams()
    if (filters.status) params.append('status', filters.status)
    if (filters.location) params.append('location', filters.location)
    if (params.toString()) endpoint += `?${params.toString()}`
  }

  return await publicRequest(endpoint)
}

/**
 * Get a specific public list by number (1, 2, or 3)
 * No authentication required
 */
async function fetchPublicListByNumber(
  listNumber: 1 | 2 | 3,
  filters?: { status?: string }
): Promise<{
  listNumber: number
  category: 'Primera' | 'Segunda' | 'Tercera'
  caddies: PublicCaddie[]
  lastUpdate: string
}> {
  let endpoint = `/public/lists/${listNumber}`

  if (filters?.status) {
    endpoint += `?status=${filters.status}`
  }

  return await publicRequest(endpoint)
}

/**
 * Get public queue (top 5 available/late caddies per category)
 * Ideal for the public monitor display
 * No authentication required
 */
async function fetchPublicQueue(): Promise<{
  Primera: PublicCaddie[]
  Segunda: PublicCaddie[]
  Tercera: PublicCaddie[]
  lastUpdate: string
}> {
  return await publicRequest('/public/queue')
}

export const publicApiService = {
  fetchPublicLists,
  fetchPublicListByNumber,
  fetchPublicQueue,
}

export type { PublicCaddie, PublicListsResponse, PublicQueueResponse }
