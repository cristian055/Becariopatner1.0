import { describe, it, expect, beforeEach, vi } from 'vitest'
import { caddieApiService } from './caddieApiService'
import { request } from './apiClient'
import type { Caddie } from '../types'

vi.mock('./apiClient', () => ({
  request: vi.fn(),
}))

const mockRequest = vi.mocked(request)

describe('caddieApiService.updateCaddieStatus', () => {
  const mockCaddie: Caddie = {
    id: 'caddie-123',
    name: 'Juan Perez',
    number: 101,
    isActive: true,
    listId: 'list-1',
    historyCount: 50,
    absencesCount: 2,
    lateCount: 5,
    leaveCount: 1,
    lastActionTime: '2026-01-14T10:00:00.000Z',
    category: 'Primera',
    location: 'Llanogrande',
    role: 'Golf',
    availability: [],
    weekendPriority: 1,
    operationalStatus: 'AVAILABLE',
    attendanceStatus: 'PRESENT',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('makes PATCH request to correct endpoint with AVAILABLE status', async () => {
    mockRequest.mockResolvedValue(mockCaddie)

    await caddieApiService.updateCaddieStatus('caddie-123', 'AVAILABLE')

    expect(mockRequest).toHaveBeenCalledWith(
      '/caddies/caddie-123/status',
      {
        method: 'PATCH',
        body: JSON.stringify({ status: 'AVAILABLE' }),
      }
    )
  })

  it('makes PATCH request to correct endpoint with IN_PREP status', async () => {
    mockRequest.mockResolvedValue(mockCaddie)

    await caddieApiService.updateCaddieStatus('caddie-456', 'IN_PREP')

    expect(mockRequest).toHaveBeenCalledWith(
      '/caddies/caddie-456/status',
      {
        method: 'PATCH',
        body: JSON.stringify({ status: 'IN_PREP' }),
      }
    )
  })

  it('makes PATCH request to correct endpoint with IN_FIELD status', async () => {
    mockRequest.mockResolvedValue(mockCaddie)

    await caddieApiService.updateCaddieStatus('caddie-789', 'IN_FIELD')

    expect(mockRequest).toHaveBeenCalledWith(
      '/caddies/caddie-789/status',
      {
        method: 'PATCH',
        body: JSON.stringify({ status: 'IN_FIELD' }),
      }
    )
  })

  it('passes status in request body', async () => {
    mockRequest.mockResolvedValue(mockCaddie)

    await caddieApiService.updateCaddieStatus('caddie-123', 'IN_PREP')

    const call = mockRequest.mock.calls[0]
    const options = call[1] as RequestInit
    const body = JSON.parse(options.body as string)

    expect(body.status).toBe('IN_PREP')
  })

  it('returns API response correctly', async () => {
    mockRequest.mockResolvedValue(mockCaddie)

    const result = await caddieApiService.updateCaddieStatus('caddie-123', 'AVAILABLE')

    expect(result).toEqual(mockCaddie)
  })

  it('throws error when network error occurs', async () => {
    const mockError = new Error('Network error')
    mockError.name = 'ApiError'
    mockError.message = 'Network error'
    mockRequest.mockRejectedValue(mockError)

    await expect(
      caddieApiService.updateCaddieStatus('caddie-123', 'AVAILABLE')
    ).rejects.toThrow('Network error')
  })

  it('handles invalid status value from backend', async () => {
    const mockError = new Error('Invalid status value')
    mockError.name = 'ApiError'
    mockError.message = 'Invalid status value'
    mockRequest.mockRejectedValue(mockError)

    await expect(
      caddieApiService.updateCaddieStatus('caddie-123', 'AVAILABLE')
    ).rejects.toThrow('Invalid status value')
  })
})
