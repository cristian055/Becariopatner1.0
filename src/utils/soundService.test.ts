import { describe, it, expect, beforeEach, vi } from 'vitest'
import { soundService } from './soundService'

describe('soundService', () => {
  beforeEach(() => {
    // Clear cache before each test
    soundService.clearCache()
    soundService.enable()
  })

  it('should be enabled by default', () => {
    expect(soundService.isEnabled()).toBe(true)
  })

  it('should disable sound playback', () => {
    soundService.disable()
    expect(soundService.isEnabled()).toBe(false)
  })

  it('should enable sound playback', () => {
    soundService.disable()
    soundService.enable()
    expect(soundService.isEnabled()).toBe(true)
  })

  it('should preload audio file', () => {
    // Mock Audio constructor
    const mockAudio = {
      preload: '',
      play: vi.fn().mockResolvedValue(undefined),
      currentTime: 0,
    }
    
    global.Audio = vi.fn(() => mockAudio) as never

    soundService.preload('/test.wav')
    
    // Verify Audio was constructed
    expect(global.Audio).toHaveBeenCalledWith('/test.wav')
  })

  it('should play notification sound', async () => {
    const mockPlay = vi.fn().mockResolvedValue(undefined)
    const mockAudio = {
      preload: 'auto',
      play: mockPlay,
      currentTime: 0,
    }
    
    global.Audio = vi.fn(() => mockAudio) as never

    await soundService.playNotification('/test.wav')
    
    expect(mockPlay).toHaveBeenCalled()
  })

  it('should not play sound when disabled', async () => {
    const mockPlay = vi.fn().mockResolvedValue(undefined)
    const mockAudio = {
      preload: 'auto',
      play: mockPlay,
      currentTime: 0,
    }
    
    global.Audio = vi.fn(() => mockAudio) as never

    soundService.disable()
    await soundService.playNotification('/test.wav')
    
    expect(mockPlay).not.toHaveBeenCalled()
  })

  it('should handle playback errors gracefully', async () => {
    const mockPlay = vi.fn().mockRejectedValue(new Error('Playback failed'))
    const mockAudio = {
      preload: 'auto',
      play: mockPlay,
      currentTime: 0,
    }
    
    global.Audio = vi.fn(() => mockAudio) as never

    // Should not throw error
    await expect(soundService.playNotification('/test.wav')).resolves.toBeUndefined()
  })

  it('should reset audio to start when playing', async () => {
    const mockAudio = {
      preload: 'auto',
      play: vi.fn().mockResolvedValue(undefined),
      currentTime: 5,
    }
    
    global.Audio = vi.fn(() => mockAudio) as never

    await soundService.playNotification('/test.wav')
    
    expect(mockAudio.currentTime).toBe(0)
  })

  it('should use cached audio on subsequent plays', async () => {
    const mockAudio = {
      preload: 'auto',
      play: vi.fn().mockResolvedValue(undefined),
      currentTime: 0,
    }
    
    global.Audio = vi.fn(() => mockAudio) as never

    await soundService.playNotification('/test.wav')
    await soundService.playNotification('/test.wav')
    
    // Audio constructor should only be called once (cached)
    expect(global.Audio).toHaveBeenCalledTimes(1)
    expect(mockAudio.play).toHaveBeenCalledTimes(2)
  })

  it('should clear audio cache', () => {
    const mockAudio = {
      preload: 'auto',
      play: vi.fn().mockResolvedValue(undefined),
      currentTime: 0,
    }
    
    global.Audio = vi.fn(() => mockAudio) as never

    soundService.preload('/test.wav')
    soundService.clearCache()
    
    // After clear, should create new Audio instance
    soundService.preload('/test.wav')
    expect(global.Audio).toHaveBeenCalledTimes(2)
  })
})
