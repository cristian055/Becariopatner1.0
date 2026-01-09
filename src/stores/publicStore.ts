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

// Accumulator for batching multiple status_changed events
let pendingDispatchCaddies: DispatchCaddie[] = []
let dispatchBatchTimer: ReturnType<typeof setTimeout> | null = null
const BATCH_ACCUMULATION_TIME = 500 // ms to wait for more events before showing popup

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
  handleCaddieStatusChanged: (data: { 
    caddieId: string
    newStatus: string
    name?: string
    number?: number
    category?: 'Primera' | 'Segunda' | 'Tercera'
    previousStatus?: string
    caddie?: DispatchCaddie 
  }) => void
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

  // Handle caddie dispatched WebSocket event (batch dispatch from admin)
  handleCaddieDispatched: (rawData) => {
    // Backend sends: { event, data: { ids, caddies, timestamp }, timestamp }
    // Extract the actual data from nested structure
    const data = (rawData as { data?: unknown }).data || rawData
    const { ids = [], caddies = [], timestamp = Date.now() } = data as { 
      ids?: string[]
      caddies?: DispatchCaddie[]
      timestamp?: number 
    }
    
    logger.info(`Caddie dispatched event received: ${ids.length} caddies`, 'PublicStore')
    
    // Skip if no caddies
    if (caddies.length === 0) {
      logger.warn('Received dispatch event with no caddies', 'PublicStore')
      return
    }
    
    // Clear any pending accumulation since we got the full batch
    if (dispatchBatchTimer) {
      clearTimeout(dispatchBatchTimer)
      dispatchBatchTimer = null
    }
    pendingDispatchCaddies = []
    
    set({
      lastDispatchBatch: {
        ids,
        caddies,
        timestamp,
      },
      showPopup: true,
    })
    // Refresh queue data after dispatch
    get().fetchPublicQueue()
  },

  // Handle queue updated WebSocket event
  handleQueueUpdated: (rawData) => {
    // Backend sends: { event, data: { category, ... }, timestamp }
    // Extract the actual data from nested structure
    const data = (rawData as { data?: unknown }).data || rawData
    const { category, queue } = data as { 
      category: 'Primera' | 'Segunda' | 'Tercera'
      queue?: PublicCaddie[] 
    }
    
    logger.info(`Queue updated event received for category: ${category}`, 'PublicStore')
    
    // If no category, skip update
    if (!category) {
      logger.warn('Queue update missing category', 'PublicStore')
      return
    }
    
    const updates: Partial<PublicQueueState> = {}
    
    // If queue data is provided, use it; otherwise just mark as updated
    if (queue) {
      switch (category) {
        case 'Primera':
          updates.primera = queue
          break
        case 'Segunda':
          updates.segunda = queue
          break
        case 'Tercera':
          updates.tercera = queue
          break
      }
    }
    
    updates.lastUpdate = new Date().toISOString()
    set(updates)
    
    // Also refresh from server to get latest data
    get().fetchPublicQueue()
  },

  // Handle caddie status changed WebSocket event
  handleCaddieStatusChanged: (rawData) => {
    // Backend sends: { event, data: { caddieId, name, ... }, timestamp }
    // Extract the actual data from nested structure
    const data = (rawData as { data?: unknown }).data || rawData
    const caddieData = data as { 
      caddieId: string
      name?: string
      number?: number
      category?: 'Primera' | 'Segunda' | 'Tercera'
      newStatus: string
      previousStatus?: string
      caddie?: DispatchCaddie 
    }
    
    logger.info(`Caddie status changed: ${caddieData.caddieId} -> ${caddieData.newStatus}`, 'PublicStore')
    
    // If status changed to IN_PREP (authorize dispatch), accumulate for popup
    if (caddieData.newStatus === 'IN_PREP') {
      // Build caddie info for popup
      const caddieForPopup: DispatchCaddie = caddieData.caddie || {
        id: caddieData.caddieId,
        name: caddieData.name || 'Caddie',
        number: caddieData.number || 0,
        category: caddieData.category || 'Primera',
      }
      
      // Check if this caddie is already in pending list (avoid duplicates)
      const alreadyPending = pendingDispatchCaddies.some(c => c.id === caddieForPopup.id)
      if (!alreadyPending) {
        pendingDispatchCaddies.push(caddieForPopup)
        logger.info(`Accumulated ${pendingDispatchCaddies.length} caddies for dispatch popup`, 'PublicStore')
      }
      
      // Clear existing timer
      if (dispatchBatchTimer) {
        clearTimeout(dispatchBatchTimer)
      }
      
      // Set timer to show popup after accumulation period
      dispatchBatchTimer = setTimeout(() => {
        if (pendingDispatchCaddies.length > 0) {
          const caddies = [...pendingDispatchCaddies]
          const ids = caddies.map(c => c.id)
          
          logger.info(`Showing dispatch popup with ${caddies.length} caddies`, 'PublicStore')
          
          set({
            lastDispatchBatch: {
              ids,
              caddies,
              timestamp: Date.now(),
            },
            showPopup: true,
          })
          
          // Clear the pending list
          pendingDispatchCaddies = []
        }
        dispatchBatchTimer = null
      }, BATCH_ACCUMULATION_TIME)
    }
    
    // Update local state based on the status change
    const { primera, segunda, tercera } = get()
    const category = caddieData.category
    
    if (category) {
      // Remove caddie from queue if status is no longer AVAILABLE or LATE
      const isInQueue = ['AVAILABLE', 'LATE'].includes(caddieData.newStatus)
      
      const updateList = (list: PublicCaddie[]) => {
        if (!isInQueue) {
          // Remove from list if no longer in queue status
          return list.filter(c => c.id !== caddieData.caddieId)
        }
        // Update status if caddie is in list
        return list.map(c => 
          c.id === caddieData.caddieId 
            ? { ...c, status: caddieData.newStatus }
            : c
        )
      }
      
      const updates: Partial<PublicQueueState> = { lastUpdate: new Date().toISOString() }
      
      switch (category) {
        case 'Primera':
          updates.primera = updateList(primera)
          break
        case 'Segunda':
          updates.segunda = updateList(segunda)
          break
        case 'Tercera':
          updates.tercera = updateList(tercera)
          break
      }
      
      set(updates)
    }
    
    // Also refresh from server to ensure consistency
    // Use a small delay to avoid too frequent requests
    setTimeout(() => {
      get().fetchPublicQueue()
    }, 500)
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
