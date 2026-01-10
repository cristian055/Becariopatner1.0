import { logger } from './logger'

/**
 * SoundService - Manages audio playback for notifications
 * Provides methods to play notification sounds with error handling
 */
class SoundService {
  private audioCache: Map<string, HTMLAudioElement> = new Map()
  private enabled: boolean = true

  /**
   * Preload a sound file into cache
   */
  preload(soundPath: string): void {
    if (this.audioCache.has(soundPath)) {
      return
    }

    try {
      const audio = new Audio(soundPath)
      audio.preload = 'auto'
      this.audioCache.set(soundPath, audio)
      logger.debug(`Sound preloaded: ${soundPath}`, 'SoundService')
    } catch (error) {
      logger.error(`Failed to preload sound: ${soundPath}`, error, 'SoundService')
    }
  }

  /**
   * Play a notification sound
   */
  async playNotification(soundPath: string = '/notification.wav'): Promise<void> {
    if (!this.enabled) {
      logger.debug('Sound playback is disabled', 'SoundService')
      return
    }

    try {
      let audio = this.audioCache.get(soundPath)

      if (!audio) {
        audio = new Audio(soundPath)
        this.audioCache.set(soundPath, audio)
      }

      // Reset audio to start if it was already playing
      audio.currentTime = 0

      await audio.play()
      logger.debug(`Sound played: ${soundPath}`, 'SoundService')
    } catch (error) {
      // Log error but don't throw - sound is nice-to-have, not critical
      logger.warn(`Failed to play sound: ${soundPath}`, 'SoundService')
      if (error instanceof Error) {
        logger.debug(`Sound playback error details: ${error.message}`, 'SoundService')
      }
    }
  }

  /**
   * Enable sound playback
   */
  enable(): void {
    this.enabled = true
    logger.info('Sound playback enabled', 'SoundService')
  }

  /**
   * Disable sound playback
   */
  disable(): void {
    this.enabled = false
    logger.info('Sound playback disabled', 'SoundService')
  }

  /**
   * Check if sound is enabled
   */
  isEnabled(): boolean {
    return this.enabled
  }

  /**
   * Clear audio cache
   */
  clearCache(): void {
    this.audioCache.clear()
    logger.debug('Audio cache cleared', 'SoundService')
  }
}

// Export singleton instance
export const soundService = new SoundService()

// Preload default notification sound when service is first used
// This is safe to do at module load time as it's a small, static asset
soundService.preload('/notification.wav')
