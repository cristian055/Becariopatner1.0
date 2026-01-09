import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useCaddieStore } from './caddieStore'
import { CaddieStatus } from '../types'
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
    status: CaddieStatus.AVAILABLE,
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
      status: CaddieStatus.ABSENT,
      absencesCount: 1,
    }

    vi.mocked(caddieApiService.updateCaddie).mockResolvedValue(updatedCaddie)

    await updateCaddie({
      id: '1',
      updates: { status: CaddieStatus.ABSENT },
    })

    expect(caddieApiService.updateCaddie).toHaveBeenCalledWith({
      id: '1',
      updates: {
        status: CaddieStatus.ABSENT,
        absencesCount: 1,
      },
    })
  })

  it('increments leaveCount when status changes to ON_LEAVE', async () => {
    const { setCaddies, updateCaddie } = useCaddieStore.getState()
    setCaddies([mockCaddie])

    const updatedCaddie = {
      ...mockCaddie,
      status: CaddieStatus.ON_LEAVE,
      leaveCount: 1,
    }

    vi.mocked(caddieApiService.updateCaddie).mockResolvedValue(updatedCaddie)

    await updateCaddie({
      id: '1',
      updates: { status: CaddieStatus.ON_LEAVE },
    })

    expect(caddieApiService.updateCaddie).toHaveBeenCalledWith({
      id: '1',
      updates: {
        status: CaddieStatus.ON_LEAVE,
        leaveCount: 1,
      },
    })
  })

  it('increments lateCount when status changes to LATE', async () => {
    const { setCaddies, updateCaddie } = useCaddieStore.getState()
    setCaddies([mockCaddie])

    const updatedCaddie = {
      ...mockCaddie,
      status: CaddieStatus.LATE,
      lateCount: 1,
    }

    vi.mocked(caddieApiService.updateCaddie).mockResolvedValue(updatedCaddie)

    await updateCaddie({
      id: '1',
      updates: { status: CaddieStatus.LATE },
    })

    expect(caddieApiService.updateCaddie).toHaveBeenCalledWith({
      id: '1',
      updates: {
        status: CaddieStatus.LATE,
        lateCount: 1,
      },
    })
  })

  it('does not increment lateCount when toggling from LATE back to AVAILABLE', async () => {
    const lateCaddie: Caddie = {
      ...mockCaddie,
      status: CaddieStatus.LATE,
      lateCount: 1,
    }

    const { setCaddies, updateCaddie } = useCaddieStore.getState()
    setCaddies([lateCaddie])

    const updatedCaddie = {
      ...lateCaddie,
      status: CaddieStatus.AVAILABLE,
    }

    vi.mocked(caddieApiService.updateCaddie).mockResolvedValue(updatedCaddie)

    await updateCaddie({
      id: '1',
      updates: { status: CaddieStatus.AVAILABLE },
    })

    // Should NOT increment lateCount when going back to AVAILABLE
    expect(caddieApiService.updateCaddie).toHaveBeenCalledWith({
      id: '1',
      updates: {
        status: CaddieStatus.AVAILABLE,
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
