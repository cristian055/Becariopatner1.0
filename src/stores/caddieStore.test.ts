import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useCaddieStore } from './caddieStore'
import type { Caddie } from '../types'
import { caddieApiService } from '../services/caddieApiService'

// Mock the API service
vi.mock('../services/caddieApiService', () => ({
  caddieApiService: {
    updateCaddie: vi.fn(),
  },
}))

describe('CaddieStore - Counter Increments', () => {
  beforeEach(() => {
    // Reset the store before each test
    const { setCaddies } = useCaddieStore.getState()
    setCaddies([])
    vi.clearAllMocks()
  })

  const mockCaddie: Caddie = {
    id: '1',
    name: 'Juan Pérez',
    number: 1,
    status: 'AVAILABLE',
    isActive: true,
    location: 'Medellín',
    role: 'Golf',
    category: 'Primera',
    weekendPriority: 1,
    listId: null,
    historyCount: 0,
    absencesCount: 0,
    lateCount: 0,
    leaveCount: 0,
    lastActionTime: '',
    availability: [],
  }

  it('increments absencesCount when status changes to ABSENT', async () => {
    const { setCaddies, updateCaddie } = useCaddieStore.getState()
    setCaddies([mockCaddie])

    const updatedCaddie = {
      ...mockCaddie,
      status: 'ABSENT',
      absencesCount: 1,
    }

    vi.mocked(caddieApiService.updateCaddie).mockResolvedValue(updatedCaddie)

    await updateCaddie({
      id: '1',
      updates: { status: 'ABSENT' },
    })

    expect(caddieApiService.updateCaddie).toHaveBeenCalledWith({
      id: '1',
      updates: {
        status: 'ABSENT',
        absencesCount: 1,
      },
    })
  })

  it('increments leaveCount when status changes to ON_LEAVE', async () => {
    const { setCaddies, updateCaddie } = useCaddieStore.getState()
    setCaddies([mockCaddie])

    const updatedCaddie = {
      ...mockCaddie,
      status: 'ON_LEAVE',
      leaveCount: 1,
    }

    vi.mocked(caddieApiService.updateCaddie).mockResolvedValue(updatedCaddie)

    await updateCaddie({
      id: '1',
      updates: { status: 'ON_LEAVE' },
    })

    expect(caddieApiService.updateCaddie).toHaveBeenCalledWith({
      id: '1',
      updates: {
        status: 'ON_LEAVE',
        leaveCount: 1,
      },
    })
  })

  it('increments lateCount when status changes to LATE', async () => {
    const { setCaddies, updateCaddie } = useCaddieStore.getState()
    setCaddies([mockCaddie])

    const updatedCaddie = {
      ...mockCaddie,
      status: 'LATE',
      lateCount: 1,
    }

    vi.mocked(caddieApiService.updateCaddie).mockResolvedValue(updatedCaddie)

    await updateCaddie({
      id: '1',
      updates: { status: 'LATE' },
    })

    expect(caddieApiService.updateCaddie).toHaveBeenCalledWith({
      id: '1',
      updates: {
        status: 'LATE',
        lateCount: 1,
      },
    })
  })

  it('does not increment lateCount when toggling from LATE back to AVAILABLE', async () => {
    const lateCaddie: Caddie = {
      ...mockCaddie,
      status: 'LATE',
      lateCount: 1,
    }

    const { setCaddies, updateCaddie } = useCaddieStore.getState()
    setCaddies([lateCaddie])

    const updatedCaddie = {
      ...lateCaddie,
      status: 'AVAILABLE',
    }

    vi.mocked(caddieApiService.updateCaddie).mockResolvedValue(updatedCaddie)

    await updateCaddie({
      id: '1',
      updates: { status: 'AVAILABLE' },
    })

    // Should NOT increment lateCount when going back to AVAILABLE
    expect(caddieApiService.updateCaddie).toHaveBeenCalledWith({
      id: '1',
      updates: {
        status: 'AVAILABLE',
      },
    })
  })

  it('does not increment counters when status does not change', async () => {
    const { setCaddies, updateCaddie } = useCaddieStore.getState()
    setCaddies([mockCaddie])

    const updatedCaddie = {
      ...mockCaddie,
      name: 'Juan Updated',
    }

    vi.mocked(caddieApiService.updateCaddie).mockResolvedValue(updatedCaddie)

    await updateCaddie({
      id: '1',
      updates: { name: 'Juan Updated' },
    })

    expect(caddieApiService.updateCaddie).toHaveBeenCalledWith({
      id: '1',
      updates: {
        name: 'Juan Updated',
      },
    })
  })
})
