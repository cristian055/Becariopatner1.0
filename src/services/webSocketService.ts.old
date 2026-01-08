/**
 * WebSocket Client Service
 * Handles real-time updates from backend
 */

import { getUser, getUserLocation } from './authService'

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

class WebSocketService {
  private socket: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 3000
  private eventCallbacks: Map<string, Set<EventCallback>> = new Map()

  /**
   * Connect to WebSocket
   */
  connect(isAdmin = false): void {
    const user = getUser()
    const location = getUserLocation()

    if (!location) {
      console.error('User location not found, cannot connect WebSocket')
      return
    }

    // Public or admin endpoint
    const endpoint = isAdmin
      ? `ws://localhost:3001/api/admin/ws`
      : `ws://localhost:3001/api/public/ws`

    this.socket = new WebSocket(endpoint)

    this.socket.onopen = () => {
      console.log('WebSocket connected')
      this.reconnectAttempts = 0

      // Join location room
      if (isAdmin && user) {
        this.socket?.send(
          JSON.stringify({
            event: 'join:admin',
            data: { location },
          })
        )
      } else {
        this.socket?.send(
          JSON.stringify({
            event: 'join:monitor',
            data: { location },
          })
        )
      }
    }

    this.socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data)
        const eventName = message.event || event.data?.event
        const data = message.data || event.data

        this.notifyListeners(eventName, data)
      } catch (error) {
        console.error('Error parsing WebSocket message:', error)
      }
    }

    this.socket.onclose = () => {
      console.log('WebSocket disconnected')
      this.attemptReconnect(isAdmin)
    }

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error)
    }
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.close()
      this.socket = null
      console.log('WebSocket disconnected')
    }
  }

  /**
   * Attempt to reconnect
   */
  private attemptReconnect(isAdmin: boolean): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached')
      return
    }

    this.reconnectAttempts++
    console.log(
      `Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`
    )

    setTimeout(() => {
      this.connect(isAdmin)
    }, this.reconnectDelay * this.reconnectAttempts)
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
    return this.socket !== null && this.socket.readyState === WebSocket.OPEN
  }
}

// Export singleton instance
export const webSocketService = new WebSocketService()
