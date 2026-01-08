import { create } from 'zustand'
import { publicApiService } from '../services/publicApiService'
import type { PublicCaddie } from '../services/publicApiService'
import { logger } from '../utils'

/**
 * PublicStore - Global state for public monitor data
 * Uses public API endpoints that do not require authentication
 */

// Dispatch popup caddie info (minimal data for popup display)
export interface DispatchCaddie {
  id: string
  name: string
  number: number
  category: 'Primera' | 'Segunda' | 'Tercera'
}

interface PublicQueueState {
  primera: PublicCaddie[]
  segunda: PublicCaddie[]
  tercera: PublicCaddie[]
  lastUpdate: string | null
  loading: boolean
  error: string | null
  // Dispatch popup state
  lastDispatchBatch: { ids: string[]; caddies: DispatchCaddie[]; timestamp: number } | null
  showPopup: boolean
}

interface PublicStore extends PublicQueueState {
  // Actions
  fetchPublicQueue: () => Promise<void>
  fetchPublicLists: (filters?: { status?: string; location?: string }) => Promise<void>
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  reset: () => void
  // Dispatch popup actions
  setLastDispatchBatch: (batch: { ids: string[]; caddies: DispatchCaddie[]; timestamp: number } | null) => void
  setShowPopup: (show: boolean) => void
  // WebSocket update handlers
  handleCaddieDispatched: (data: { ids: string[]; caddies: DispatchCaddie[]; timestamp: number }) => void
  handleQueueUpdated: (data: { category: 'Primera' | 'Segunda' | 'Tercera'; queue: PublicCaddie[] }) => void
  handleCaddieStatusChanged: (data: { caddieId: string; newStatus: string; caddie?: DispatchCaddie }) => void
}

export const usePublicStore = create<PublicStore>((set, get) => ({
  // Initial state
  primera: [],
  segunda: [],
  tercera: [],
  lastUpdate: null,
  loading: false,
  error: null,
  lastDispatchBatch: null,
  showPopup: false,

  // Set loading state
  setLoading: (loading) => {
    set({ loading })
  },

  // Set error state
  setError: (error) => {
    set({ error })
    if (error) {
      logger.error('Public store error:', new Error(error), 'PublicStore')
    }
  },

  // Dispatch popup actions
  setLastDispatchBatch: (batch) => {
    logger.info('Setting last dispatch batch', 'PublicStore')
    set({ lastDispatchBatch: batch })
  },

  setShowPopup: (show) => {
    logger.info(`Setting show popup: ${show}`, 'PublicStore')
    set({ showPopup: show })
  },

  // Handle caddie dispatched WebSocket event
  handleCaddieDispatched: (data) => {
    logger.info(`Caddie dispatched event received: ${data.ids.length} caddies`, 'PublicStore')
    set({
      lastDispatchBatch: {
        ids: data.ids,
        caddies: data.caddies,
        timestamp: data.timestamp,
      },
      showPopup: true,
    })
    // Refresh queue data after dispatch
    get().fetchPublicQueue()
  },

  // Handle queue updated WebSocket event
  handleQueueUpdated: (data) => {
    logger.info(`Queue updated event received for category: ${data.category}`, 'PublicStore')
    const updates: Partial<PublicQueueState> = {}
    switch (data.category) {
      case 'Primera':
        updates.primera = data.queue
        break
      case 'Segunda':
        updates.segunda = data.queue
        break
      case 'Tercera':
        updates.tercera = data.queue
        break
    }
    updates.lastUpdate = new Date().toISOString()
    set(updates)
  },

  // Handle caddie status changed WebSocket event
  handleCaddieStatusChanged: (data) => {
    logger.info(`Caddie status changed: ${data.caddieId} -> ${data.newStatus}`, 'PublicStore')
    
    // If caddie info is provided and status is "Llamado" (being called), show popup
    if (data.caddie && data.newStatus === 'Llamado') {
      set({
        lastDispatchBatch: {
          ids: [data.caddieId],
          caddies: [data.caddie],
          timestamp: Date.now(),
        },
        showPopup: true,
      })
    }
    
    // Refresh queue data to reflect the status change
    get().fetchPublicQueue()
  },

  // Fetch public queue (top 5 per category)
  fetchPublicQueue: async () => {
    try {
      set({ loading: true, error: null })
      logger.info('Fetching public queue...', 'PublicStore')

      const data = await publicApiService.fetchPublicQueue()

      set({
        primera: data.Primera,
        segunda: data.Segunda,
        tercera: data.Tercera,
        lastUpdate: data.lastUpdate,
        loading: false,
      })

      logger.info('Public queue fetched successfully', 'PublicStore')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch public queue'
      set({ loading: false, error: errorMessage })
      logger.serviceError('FETCH_ERROR', errorMessage, error, 'PublicStore')
    }
  },

  // Fetch all public lists
  fetchPublicLists: async (filters) => {
    try {
      set({ loading: true, error: null })
      logger.info('Fetching public lists...', 'PublicStore')

      const data = await publicApiService.fetchPublicLists(filters)

      set({
        primera: data.Primera,
        segunda: data.Segunda,
        tercera: data.Tercera,
        lastUpdate: data.lastUpdate,
        loading: false,
      })

      logger.info('Public lists fetched successfully', 'PublicStore')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch public lists'
      set({ loading: false, error: errorMessage })
      logger.serviceError('FETCH_ERROR', errorMessage, error, 'PublicStore')
    }
  },

  // Reset state
  reset: () => {
    set({
      primera: [],
      segunda: [],
      tercera: [],
      lastUpdate: null,
      loading: false,
      error: null,
    })
  },
}))
