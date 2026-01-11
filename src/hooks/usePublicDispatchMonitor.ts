import { useState, useEffect, useRef } from 'react'
import { usePublicStore } from '../stores'
import type { DispatchCaddie } from '../stores/publicStore'
import { soundService } from '../utils'

export interface PopupLayout {
  grid: string
  card: string
  circle: string
  name: string
  badge: string
}

interface UsePublicDispatchMonitorReturn {
  showPopup: boolean
  callingCaddies: DispatchCaddie[]
  layout: PopupLayout
}

export const usePublicDispatchMonitor = (): UsePublicDispatchMonitorReturn => {
  const { lastDispatchBatch, showPopup, setShowPopup } = usePublicStore()
  const [callingCaddies, setCallingCaddies] = useState<DispatchCaddie[]>([])
  const timerRef = useRef<number | null>(null)
  const lastProcessedTimestampRef = useRef<number>(0)

  useEffect(() => {
    if (lastDispatchBatch) {
      const { caddies, timestamp } = lastDispatchBatch

      // Only process if this is a new batch
      if (timestamp > lastProcessedTimestampRef.current) {
        if (caddies && caddies.length > 0) {
          setCallingCaddies(caddies)
          lastProcessedTimestampRef.current = timestamp

          // Play notification sound
          soundService.playNotification()

          // Clear any existing timer
          if (timerRef.current) window.clearTimeout(timerRef.current)

          // Auto-hide popup after 8 seconds
          timerRef.current = window.setTimeout(() => {
            setShowPopup(false)
          }, 5000)
        }
      }
    }
  }, [lastDispatchBatch, setShowPopup])

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current)
    }
  }, [])

  const getPopupLayout = (count: number): PopupLayout => {
    // Single caddie - full prominence
    if (count === 1) {
      return {
        grid: 'dispatch-grid--1',
        card: 'dispatch-card--xl',
        circle: 'dispatch-circle--xl',
        name: 'dispatch-name--xl',
        badge: 'dispatch-badge--xl',
      }
    }
    // Two caddies - side by side on larger screens
    if (count === 2) {
      return {
        grid: 'dispatch-grid--2',
        card: 'dispatch-card--lg',
        circle: 'dispatch-circle--lg',
        name: 'dispatch-name--lg',
        badge: 'dispatch-badge--lg',
      }
    }
    // Three caddies - row of 3
    if (count === 3) {
      return {
        grid: 'dispatch-grid--3',
        card: 'dispatch-card--md',
        circle: 'dispatch-circle--md',
        name: 'dispatch-name--md',
        badge: 'dispatch-badge--md',
      }
    }
    // Four caddies - 2x2 grid
    if (count === 4) {
      return {
        grid: 'dispatch-grid--4',
        card: 'dispatch-card--md',
        circle: 'dispatch-circle--md',
        name: 'dispatch-name--md',
        badge: 'dispatch-badge--md',
      }
    }
    // Five to six caddies - 3x2 grid
    if (count <= 6) {
      return {
        grid: 'dispatch-grid--6',
        card: 'dispatch-card--sm',
        circle: 'dispatch-circle--sm',
        name: 'dispatch-name--sm',
        badge: 'dispatch-badge--sm',
      }
    }
    // Seven to nine caddies - 3x3 grid
    if (count <= 9) {
      return {
        grid: 'dispatch-grid--9',
        card: 'dispatch-card--xs',
        circle: 'dispatch-circle--xs',
        name: 'dispatch-name--xs',
        badge: 'dispatch-badge--xs',
      }
    }
    // Ten or more - 4 column grid, compact
    return {
      grid: 'dispatch-grid--many',
      card: 'dispatch-card--xs',
      circle: 'dispatch-circle--xs',
      name: 'dispatch-name--xs',
      badge: 'dispatch-badge--xs',
    }
  }

  return {
    showPopup,
    callingCaddies,
    layout: getPopupLayout(callingCaddies.length),
  }
}
