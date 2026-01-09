/**
 * Socket.IO Client Service
 * Handles real-time updates from backend via Socket.IO
 * Supports both authenticated (admin) and public (monitor) connections
 */

import { io, Socket } from 'socket.io-client'
import { getToken, getUserLocation } from './authService'

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:3000'

type EventCallback = (data: unknown) => void

interface CaddieDispatchedEvent {
  ids: string[]
  caddies: Array<{
    id: string
    name: string
    number: number
    category: 'Primera' | 'Segunda' | 'Tercera'
  }>
  timestamp: number
}

interface CaddieStatusChangedEvent {
  caddieId: string
  previousStatus: string
  newStatus: string
  timestamp: number
}

interface QueueUpdatedEvent {
  category: 'Primera' | 'Segunda' | 'Tercera'
  queue: Array<{
    id: string
    name: string
    number: number
    status: string
    category: string
    weekendPriority: number
  }>
  timestamp: number
}

interface ScheduleUpdatedEvent {
  day: string
  shifts: unknown[]
  assignments: unknown[]
  timestamp: number
}

interface ListUpdatedEvent {
  listId: string
  list: unknown
  timestamp: number
}

interface ConnectOptions {
  isAdmin?: boolean
  location?: string
  listNumbers?: number[]
}

class SocketService {
  private socket: Socket | null = null
  private eventCallbacks: Map<string, Set<EventCallback>> = new Map()

  /**
   * Connect to Socket.IO server
   *
   * For public connections (monitor):
   * - No token required
   * - Location is optional (uses default if not provided)
   * - Subscribes to all lists by default (1,2,3)
   *
   * For admin connections:
   * - Token required for authentication
   * - User location from getUserLocation()
   */
  connect(options: ConnectOptions = {}): void {
    const { isAdmin = false, location: locationOverride, listNumbers = [1, 2, 3] } = options

    if (this.socket?.connected) {
      console.log('Socket already connected')
      return
    }

    // Get authentication token (required for admin)
    const token = getToken()

    if (isAdmin && !token) {
      console.error('Token required for admin connection')
      return
    }

    // Get location (optional for public, required for admin)
    const location = locationOverride || getUserLocation()
    if (isAdmin && !location) {
      console.error('Location required for admin connection')
      return
    }

    console.log(`Connecting to Socket.IO at ${WS_URL}`)

    // Build socket options
    const socketOptions: Record<string, unknown> = {
      transports: ['websocket', 'polling'],
      query: {} as Record<string, string>,
    }

    // Add location if available
    if (location) {
      ;(socketOptions.query as Record<string, string>).location = location
    }

    // Add auth token for admin connections
    if (isAdmin && token) {
      socketOptions.auth = { token }
    }

    // Add list subscription for public connections
    if (!isAdmin && listNumbers.length > 0) {
      ;(socketOptions.query as Record<string, string>).lists = listNumbers.join(',')
    }

    this.socket = io(WS_URL, socketOptions)

    this.setupEventHandlers()
  }

  /**
   * Setup Socket.IO event handlers
   */
  private setupEventHandlers(): void {
    if (!this.socket) return

    this.socket.on('connect', () => {
      console.log('Socket.IO connected:', this.socket?.id)
      this.notifyListeners('connected', { socketId: this.socket?.id })
    })

    this.socket.on('disconnect', (reason) => {
      console.log('Socket.IO disconnected:', reason)
      this.notifyListeners('disconnected', { reason })
    })

    this.socket.on('connect_error', (error) => {
      console.error('Socket.IO connection error:', error)
      this.notifyListeners('error', { type: 'connection', error })
    })

    // Listen for caddie events
    this.socket.on('caddie:status_changed', (data) => {
      console.log('Caddie status changed:', data)
      this.notifyListeners('caddie:status:changed', data)
    })

    this.socket.on('caddie:added', (data) => {
      console.log('Caddie added:', data)
      this.notifyListeners('caddie:added', data)
    })

    this.socket.on('caddie:updated', (data) => {
      console.log('Caddie updated:', data)
      this.notifyListeners('caddie:updated', data)
    })

    this.socket.on('caddie:deleted', (data) => {
      console.log('Caddie deleted:', data)
      this.notifyListeners('caddie:deleted', data)
    })

    // Listen for dispatch events
    this.socket.on('caddie:dispatched', (data) => {
      console.log('Caddies dispatched:', data)
      this.notifyListeners('caddie:dispatched', data)
    })

    // Listen for queue events
    this.socket.on('queue:updated', (data) => {
      console.log('Queue updated:', data)
      this.notifyListeners('queue:updated', data)
    })

    // Listen for schedule events
    this.socket.on('schedule:updated', (data) => {
      console.log('Schedule updated:', data)
      this.notifyListeners('schedule:updated', data)
    })

    // Listen for list events
    this.socket.on('list:updated', (data) => {
      console.log('List updated:', data)
      this.notifyListeners('list:updated', data)
    })
  }

  /**
   * Disconnect from Socket.IO server
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      console.log('Socket.IO disconnected')
    }
  }

  /**
   * Subscribe to specific lists (for public connections)
   * Can be called after initial connection
   */
  subscribe(listNumbers: number[]): void {
    if (!this.socket?.connected) {
      console.warn('Cannot subscribe: socket not connected')
      return
    }

    console.log('Subscribing to lists:', listNumbers)
    this.socket.emit('subscribe', { listNumbers })
  }

  /**
   * Unsubscribe from specific lists (for public connections)
   */
  unsubscribe(listNumbers: number[]): void {
    if (!this.socket?.connected) {
      console.warn('Cannot unsubscribe: socket not connected')
      return
    }

    console.log('Unsubscribing from lists:', listNumbers)
    this.socket.emit('unsubscribe', { listNumbers })
  }

  /**
   * Subscribe to an event
   */
  on(event: string, callback: EventCallback): () => void {
    if (!this.eventCallbacks.has(event)) {
      this.eventCallbacks.set(event, new Set())
    }

    this.eventCallbacks.get(event)!.add(callback)

    // Return unsubscribe function
    return () => {
      this.off(event, callback)
    }
  }

  /**
   * Unsubscribe from an event
   */
  off(event: string, callback: EventCallback): void {
    const callbacks = this.eventCallbacks.get(event)
    if (callbacks) {
      callbacks.delete(callback)
    }
  }

  /**
   * Notify all listeners for an event
   */
  private notifyListeners(event: string, data: unknown): void {
    const callbacks = this.eventCallbacks.get(event)
    if (callbacks) {
      callbacks.forEach((callback) => {
        try {
          callback(data)
        } catch (error) {
          console.error(`Error in ${event} callback:`, error)
        }
      })
    }
  }

  /**
   * Listen for caddie dispatched event
   */
  onCaddieDispatched(callback: (data: CaddieDispatchedEvent) => void): () => void {
    return this.on('caddie:dispatched', callback as EventCallback)
  }

  /**
   * Listen for caddie status changed event
   */
  onCaddieStatusChanged(
    callback: (data: CaddieStatusChangedEvent) => void
  ): () => void {
    return this.on('caddie:status:changed', callback as EventCallback)
  }

  /**
   * Listen for queue updated event
   */
  onQueueUpdated(callback: (data: QueueUpdatedEvent) => void): () => void {
    return this.on('queue:updated', callback as EventCallback)
  }

  /**
   * Listen for schedule updated event
   */
  onScheduleUpdated(callback: (data: ScheduleUpdatedEvent) => void): () => void {
    return this.on('schedule:updated', callback as EventCallback)
  }

  /**
   * Listen for list updated event
   */
  onListUpdated(callback: (data: ListUpdatedEvent) => void): () => void {
    return this.on('list:updated', callback as EventCallback)
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.socket?.connected ?? false
  }

  /**
   * Get socket ID
   */
  getSocketId(): string | undefined {
    return this.socket?.id
  }
}

// Export singleton instance
export const socketService = new SocketService()

// Export legacy alias for backward compatibility
export const webSocketService = socketService
