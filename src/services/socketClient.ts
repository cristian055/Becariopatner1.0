import { io, Socket } from 'socket.io-client'
import type { Caddie, ListConfig, WeeklyShift, WeeklyAssignment } from '@/types'

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:3001'

class SocketClient {
  private socket: Socket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5

  connect(token?: string): void {
    if (this.socket?.connected) {
      return
    }

    this.socket = io(WS_URL, {
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: this.maxReconnectAttempts,
      auth: token ? { token } : undefined,
    })

    this.socket.on('connect', () => {
      console.log('WebSocket connected', this.socket?.id)
      this.reconnectAttempts = 0
    })

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected', reason)
    })

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error', error)
      this.reconnectAttempts++
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached')
        this.disconnect()
      }
    })
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  // Subscribe to channels
  subscribeToCaddies(): void {
    this.socket?.emit('subscribe:caddies')
  }

  subscribeToLists(): void {
    this.socket?.emit('subscribe:lists')
  }

  subscribeToSchedule(): void {
    this.socket?.emit('subscribe:schedule')
  }

  unsubscribeFromCaddies(): void {
    this.socket?.emit('unsubscribe:caddies')
  }

  unsubscribeFromLists(): void {
    this.socket?.emit('unsubscribe:lists')
  }

  unsubscribeFromSchedule(): void {
    this.socket?.emit('unsubscribe:schedule')
  }

  // Request full sync
  requestFullSync(): void {
    this.socket?.emit('sync:request')
  }

  // Caddie event listeners
  onCaddieCreated(callback: (caddie: Caddie) => void): void {
    this.socket?.on('caddie:created', callback)
  }

  onCaddieUpdated(callback: (caddie: Caddie) => void): void {
    this.socket?.on('caddie:updated', callback)
  }

  onCaddieDeleted(callback: (data: { id: string }) => void): void {
    this.socket?.on('caddie:deleted', callback)
  }

  onCaddiesBulkUpdated(callback: (caddies: Caddie[]) => void): void {
    this.socket?.on('caddie:bulk-updated', callback)
  }

  // List event listeners
  onListCreated(callback: (list: ListConfig) => void): void {
    this.socket?.on('list:created', callback)
  }

  onListUpdated(callback: (list: ListConfig) => void): void {
    this.socket?.on('list:updated', callback)
  }

  onListDeleted(callback: (data: { id: string }) => void): void {
    this.socket?.on('list:deleted', callback)
  }

  // Schedule event listeners
  onShiftCreated(callback: (shift: WeeklyShift) => void): void {
    this.socket?.on('schedule:shift:created', callback)
  }

  onShiftUpdated(callback: (shift: WeeklyShift) => void): void {
    this.socket?.on('schedule:shift:updated', callback)
  }

  onShiftDeleted(callback: (data: { id: string }) => void): void {
    this.socket?.on('schedule:shift:deleted', callback)
  }

  onAssignmentCreated(callback: (assignment: WeeklyAssignment) => void): void {
    this.socket?.on('schedule:assignment:created', callback)
  }

  onAssignmentDeleted(callback: (data: { shiftId: string; caddieId: string }) => void): void {
    this.socket?.on('schedule:assignment:deleted', callback)
  }

  // Full sync listener
  onFullSync(callback: (data: {
    caddies: Caddie[]
    lists: ListConfig[]
    shifts: WeeklyShift[]
    assignments: WeeklyAssignment[]
  }) => void): void {
    this.socket?.on('sync:full', callback)
  }

  // Remove all listeners
  removeAllListeners(): void {
    this.socket?.removeAllListeners()
  }
}

export const socketClient = new SocketClient()
