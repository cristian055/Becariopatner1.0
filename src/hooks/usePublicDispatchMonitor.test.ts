import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { usePublicDispatchMonitor } from './usePublicDispatchMonitor'
import { usePublicStore } from '../stores'
import { soundService } from '../utils'

// Mock the sound service
vi.mock('../utils', async () => {
  const actual = await vi.importActual('../utils')
  return {
    ...actual,
    soundService: {
      playNotification: vi.fn(),
      enable: vi.fn(),
      disable: vi.fn(),
      isEnabled: vi.fn(() => true),
    },
  }
})

describe('usePublicDispatchMonitor', () => {
  beforeEach(() => {
    // Reset store state
    usePublicStore.getState().setShowPopup(false)
    usePublicStore.getState().setLastDispatchBatch(null)
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllTimers()
  })

  it('should initialize with no popup', () => {
    const { result } = renderHook(() => usePublicDispatchMonitor())

    expect(result.current.showPopup).toBe(false)
    expect(result.current.callingCaddies).toEqual([])
  })

  it('should show popup when caddies are dispatched', async () => {
    const { result } = renderHook(() => usePublicDispatchMonitor())

    const mockCaddies = [
      { id: '1', name: 'JUAN PEREZ', number: 101, category: 'Primera' as const },
    ]

    // Simulate dispatch event
    act(() => {
      usePublicStore.getState().setLastDispatchBatch({
        ids: ['1'],
        caddies: mockCaddies,
        timestamp: Date.now(),
      })
    })

    await waitFor(() => {
      expect(result.current.callingCaddies).toEqual(mockCaddies)
    })
  })

  it('should play notification sound when popup appears', async () => {
    renderHook(() => usePublicDispatchMonitor())

    const mockCaddies = [
      { id: '1', name: 'JUAN PEREZ', number: 101, category: 'Primera' as const },
    ]

    // Simulate dispatch event
    act(() => {
      usePublicStore.getState().setLastDispatchBatch({
        ids: ['1'],
        caddies: mockCaddies,
        timestamp: Date.now(),
      })
    })

    await waitFor(() => {
      expect(soundService.playNotification).toHaveBeenCalled()
    })
  })

  it('should auto-hide popup after 8 seconds', async () => {
    vi.useFakeTimers()

    renderHook(() => usePublicDispatchMonitor())

    const mockCaddies = [
      { id: '1', name: 'JUAN PEREZ', number: 101, category: 'Primera' as const },
    ]

    // Simulate dispatch event
    act(() => {
      usePublicStore.getState().setLastDispatchBatch({
        ids: ['1'],
        caddies: mockCaddies,
        timestamp: Date.now(),
      })
      usePublicStore.getState().setShowPopup(true)
    })

    expect(usePublicStore.getState().showPopup).toBe(true)

    // Fast-forward 8 seconds
    act(() => {
      vi.advanceTimersByTime(8000)
    })

    expect(usePublicStore.getState().showPopup).toBe(false)

    vi.useRealTimers()
  })

  it('should not process same batch twice', async () => {
    renderHook(() => usePublicDispatchMonitor())

    const mockCaddies = [
      { id: '1', name: 'JUAN PEREZ', number: 101, category: 'Primera' as const },
    ]

    const timestamp = Date.now()

    // First dispatch
    act(() => {
      usePublicStore.getState().setLastDispatchBatch({
        ids: ['1'],
        caddies: mockCaddies,
        timestamp,
      })
    })

    await waitFor(() => {
      expect(soundService.playNotification).toHaveBeenCalledTimes(1)
    })

    // Same dispatch again (same timestamp)
    act(() => {
      usePublicStore.getState().setLastDispatchBatch({
        ids: ['1'],
        caddies: mockCaddies,
        timestamp,
      })
    })

    // Wait a bit and verify sound was not played again
    await new Promise(resolve => setTimeout(resolve, 100))

    // Should not play sound again
    expect(soundService.playNotification).toHaveBeenCalledTimes(1)
  })

  it('should return correct layout for single caddie', async () => {
    const { result } = renderHook(() => usePublicDispatchMonitor())

    const mockCaddies = [
      { id: '1', name: 'JUAN PEREZ', number: 101, category: 'Primera' as const },
    ]

    act(() => {
      usePublicStore.getState().setLastDispatchBatch({
        ids: ['1'],
        caddies: mockCaddies,
        timestamp: Date.now(),
      })
    })

    await waitFor(() => {
      expect(result.current.layout.grid).toBe('dispatch-grid--1')
      expect(result.current.layout.card).toBe('dispatch-card--xl')
    })
  })

  it('should return correct layout for multiple caddies', async () => {
    const { result } = renderHook(() => usePublicDispatchMonitor())

    const mockCaddies = [
      { id: '1', name: 'JUAN PEREZ', number: 101, category: 'Primera' as const },
      { id: '2', name: 'MARIA LOPEZ', number: 102, category: 'Segunda' as const },
      { id: '3', name: 'CARLOS GARCIA', number: 103, category: 'Tercera' as const },
    ]

    act(() => {
      usePublicStore.getState().setLastDispatchBatch({
        ids: ['1', '2', '3'],
        caddies: mockCaddies,
        timestamp: Date.now(),
      })
    })

    await waitFor(() => {
      expect(result.current.layout.grid).toBe('dispatch-grid--3')
      expect(result.current.layout.card).toBe('dispatch-card--md')
    })
  })
})
