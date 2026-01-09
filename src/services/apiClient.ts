/**
 * API Client Configuration
 * Base configuration for backend API communication
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: unknown
  }
  meta?: {
    timestamp: string
    requestId: string
  }
}

class ApiError extends Error {
  code: string
  statusCode: number

  constructor(message: string, code: string, statusCode: number) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.statusCode = statusCode
  }
}

/**
 * Generic request handler with error handling
 */
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`

  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  }

  const token = localStorage.getItem('token')
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    }
  }

  try {
    const response = await fetch(url, config)
    const json: ApiResponse<T> = await response.json()

    if (!response.ok) {
      throw new ApiError(
        json.error?.message || 'Request failed',
        json.error?.code || 'UNKNOWN_ERROR',
        response.status
      )
    }

    if (!json.success) {
      throw new ApiError(
        json.error?.message || 'Operation failed',
        json.error?.code || 'UNKNOWN_ERROR',
        response.status
      )
    }

    return json.data as T
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    throw new ApiError(
      error instanceof Error ? error.message : 'Network error',
      'NETWORK_ERROR',
      0
    )
  }
}

export { ApiError, request }
export type { ApiResponse }
