import { Server } from 'socket.io'
import { Caddie, ListConfig, WeeklyShift, WeeklyAssignment } from '../types'

export class SocketManager {
  constructor(private io: Server) {}

  // Caddie events
  broadcastCaddieCreated(caddie: Caddie): void {
    this.io.to('caddies').emit('caddie:created', caddie)
  }

  broadcastCaddieUpdated(caddie: Caddie): void {
    this.io.to('caddies').emit('caddie:updated', caddie)
  }

  broadcastCaddieDeleted(caddieId: string): void {
    this.io.to('caddies').emit('caddie:deleted', { id: caddieId })
  }

  broadcastCaddiesBulkUpdated(caddies: Caddie[]): void {
    this.io.to('caddies').emit('caddie:bulk-updated', caddies)
  }

  // List events
  broadcastListCreated(list: ListConfig): void {
    this.io.to('lists').emit('list:created', list)
  }

  broadcastListUpdated(list: ListConfig): void {
    this.io.to('lists').emit('list:updated', list)
  }

  broadcastListDeleted(listId: string): void {
    this.io.to('lists').emit('list:deleted', { id: listId })
  }

  // Schedule events
  broadcastShiftCreated(shift: WeeklyShift): void {
    this.io.to('schedule').emit('schedule:shift:created', shift)
  }

  broadcastShiftUpdated(shift: WeeklyShift): void {
    this.io.to('schedule').emit('schedule:shift:updated', shift)
  }

  broadcastShiftDeleted(shiftId: string): void {
    this.io.to('schedule').emit('schedule:shift:deleted', { id: shiftId })
  }

  broadcastAssignmentCreated(assignment: WeeklyAssignment): void {
    this.io.to('schedule').emit('schedule:assignment:created', assignment)
  }

  broadcastAssignmentDeleted(shiftId: string, caddieId: string): void {
    this.io.to('schedule').emit('schedule:assignment:deleted', { shiftId, caddieId })
  }

  // Full sync event (sent when client first connects)
  sendFullSync(socketId: string, data: {
    caddies: Caddie[]
    lists: ListConfig[]
    shifts: WeeklyShift[]
    assignments: WeeklyAssignment[]
  }): void {
    this.io.to(socketId).emit('sync:full', data)
  }
}
