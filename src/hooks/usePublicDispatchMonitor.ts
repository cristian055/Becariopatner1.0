import { useState, useEffect, useRef } from 'react'
import { usePublicStore } from '../stores'
import type { DispatchCaddie } from '../stores/publicStore'

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

          // Clear any existing timer
          if (timerRef.current) window.clearTimeout(timerRef.current)

          // Auto-hide popup after 8 seconds
          timerRef.current = window.setTimeout(() => {
            setShowPopup(false)
          }, 8000)
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
    if (count === 1) {
      return {
        grid: 'grid-cols-1',
        card: 'p-6 md:p-14 gap-6 md:gap-20',
        circle: 'w-28 h-28 md:w-72 md:h-72 text-5xl md:text-[160px]',
        name: 'text-3xl md:text-9xl',
        badge: 'text-lg md:text-5xl',
      }
    }
    if (count === 2) {
      return {
        grid: 'grid-cols-1 lg:grid-cols-2',
        card: 'p-4 md:p-10 gap-4 md:gap-10',
        circle: 'w-20 h-20 md:w-48 md:h-48 text-3xl md:text-[100px]',
        name: 'text-2xl md:text-6xl',
        badge: 'text-sm md:text-3xl',
      }
    }
    return {
      grid: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
      card: 'p-3 md:p-6 gap-3 md:gap-6',
      circle: 'w-16 h-16 md:w-28 md:h-28 text-2xl md:text-[50px]',
      name: 'text-xl md:text-3xl',
      badge: 'text-[10px] md:text-xl',
    }
  }

  return {
    showPopup,
    callingCaddies,
    layout: getPopupLayout(callingCaddies.length),
  }
}
