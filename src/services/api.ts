import { apiClient } from './apiClient'
import type { Caddie, ListConfig, WeeklyShift, WeeklyAssignment, CaddieStatus } from '@/types'

interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

// Authentication
export const authApi = {
  async login(email: string, password: string): Promise<{
    user: { id: string; email: string; name: string; role: string }
    token: string
    refreshToken: string
  }> {
    const response = await apiClient.post<ApiResponse<{
      user: { id: string; email: string; name: string; role: string }
      token: string
      refreshToken: string
    }>>('/auth/login', { email, password })
    
    if (response.success && response.data) {
      apiClient.setToken(response.data.token)
      return response.data
    }
    throw new Error(response.error || 'Login failed')
  },

  async verifyToken(token: string): Promise<unknown> {
    const response = await apiClient.post<ApiResponse<unknown>>('/auth/verify', { token })
    return response.data
  },

  async getMe(): Promise<{ id: string; email: string; role: string }> {
    const response = await apiClient.get<ApiResponse<{ id: string; email: string; role: string }>>('/auth/me')
    if (response.success && response.data) {
      return response.data
    }
    throw new Error(response.error || 'Failed to get user info')
  },

  logout(): void {
    apiClient.clearToken()
  },
}

// Caddies
export const caddiesApi = {
  async getAll(): Promise<Caddie[]> {
    const response = await apiClient.get<ApiResponse<Caddie[]>>('/caddies')
    return response.data || []
  },

  async getById(id: string): Promise<Caddie> {
    const response = await apiClient.get<ApiResponse<Caddie>>(`/caddies/${id}`)
    if (response.success && response.data) {
      return response.data
    }
    throw new Error(response.error || 'Caddie not found')
  },

  async create(caddie: Omit<Caddie, 'id'>): Promise<Caddie> {
    const response = await apiClient.post<ApiResponse<Caddie>>('/caddies', caddie)
    if (response.success && response.data) {
      return response.data
    }
    throw new Error(response.error || 'Failed to create caddie')
  },

  async update(id: string, updates: Partial<Caddie>): Promise<Caddie> {
    const response = await apiClient.put<ApiResponse<Caddie>>(`/caddies/${id}`, updates)
    if (response.success && response.data) {
      return response.data
    }
    throw new Error(response.error || 'Failed to update caddie')
  },

  async delete(id: string): Promise<void> {
    const response = await apiClient.delete<ApiResponse<void>>(`/caddies/${id}`)
    if (!response.success) {
      throw new Error(response.error || 'Failed to delete caddie')
    }
  },

  async bulkUpdateStatus(ids: string[], status: CaddieStatus): Promise<Caddie[]> {
    const response = await apiClient.post<ApiResponse<Caddie[]>>('/caddies/bulk-update', { ids, status })
    return response.data || []
  },
}

// Lists
export const listsApi = {
  async getAll(): Promise<ListConfig[]> {
    const response = await apiClient.get<ApiResponse<ListConfig[]>>('/lists')
    return response.data || []
  },

  async getById(id: string): Promise<ListConfig> {
    const response = await apiClient.get<ApiResponse<ListConfig>>(`/lists/${id}`)
    if (response.success && response.data) {
      return response.data
    }
    throw new Error(response.error || 'List not found')
  },

  async create(list: Omit<ListConfig, 'id'>): Promise<ListConfig> {
    const response = await apiClient.post<ApiResponse<ListConfig>>('/lists', list)
    if (response.success && response.data) {
      return response.data
    }
    throw new Error(response.error || 'Failed to create list')
  },

  async update(id: string, updates: Partial<ListConfig>): Promise<ListConfig> {
    const response = await apiClient.put<ApiResponse<ListConfig>>(`/lists/${id}`, updates)
    if (response.success && response.data) {
      return response.data
    }
    throw new Error(response.error || 'Failed to update list')
  },

  async delete(id: string): Promise<void> {
    const response = await apiClient.delete<ApiResponse<void>>(`/lists/${id}`)
    if (!response.success) {
      throw new Error(response.error || 'Failed to delete list')
    }
  },
}

// Schedule
export const scheduleApi = {
  // Shifts
  async getAllShifts(): Promise<WeeklyShift[]> {
    const response = await apiClient.get<ApiResponse<WeeklyShift[]>>('/schedule/shifts')
    return response.data || []
  },

  async getShiftById(id: string): Promise<WeeklyShift> {
    const response = await apiClient.get<ApiResponse<WeeklyShift>>(`/schedule/shifts/${id}`)
    if (response.success && response.data) {
      return response.data
    }
    throw new Error(response.error || 'Shift not found')
  },

  async createShift(shift: Omit<WeeklyShift, 'id'>): Promise<WeeklyShift> {
    const response = await apiClient.post<ApiResponse<WeeklyShift>>('/schedule/shifts', shift)
    if (response.success && response.data) {
      return response.data
    }
    throw new Error(response.error || 'Failed to create shift')
  },

  async updateShift(id: string, updates: Partial<WeeklyShift>): Promise<WeeklyShift> {
    const response = await apiClient.put<ApiResponse<WeeklyShift>>(`/schedule/shifts/${id}`, updates)
    if (response.success && response.data) {
      return response.data
    }
    throw new Error(response.error || 'Failed to update shift')
  },

  async deleteShift(id: string): Promise<void> {
    const response = await apiClient.delete<ApiResponse<void>>(`/schedule/shifts/${id}`)
    if (!response.success) {
      throw new Error(response.error || 'Failed to delete shift')
    }
  },

  // Assignments
  async getAllAssignments(shiftId?: string): Promise<WeeklyAssignment[]> {
    const url = shiftId ? `/schedule/assignments?shiftId=${shiftId}` : '/schedule/assignments'
    const response = await apiClient.get<ApiResponse<WeeklyAssignment[]>>(url)
    return response.data || []
  },

  async createAssignment(assignment: {
    shiftId: string
    caddieId: string
    caddieName: string
    caddieNumber: number
    category: string
    time: string
  }): Promise<WeeklyAssignment> {
    const response = await apiClient.post<ApiResponse<WeeklyAssignment>>('/schedule/assignments', assignment)
    if (response.success && response.data) {
      return response.data
    }
    throw new Error(response.error || 'Failed to create assignment')
  },

  async deleteAssignment(shiftId: string, caddieId: string): Promise<void> {
    const response = await apiClient.delete<ApiResponse<void>>(`/schedule/assignments/${shiftId}/${caddieId}`)
    if (!response.success) {
      throw new Error(response.error || 'Failed to delete assignment')
    }
  },
}

// Health check
export const healthApi = {
  async check(): Promise<{ status: string; timestamp: string; version: string }> {
    const response = await apiClient.get<ApiResponse<{ timestamp: string; version: string }> & { message: string }>('/health')
    if (response.success) {
      return {
        status: 'ok',
        timestamp: response.data?.timestamp || '',
        version: response.data?.version || '1.0.0',
      }
    }
    throw new Error('Health check failed')
  },
}
