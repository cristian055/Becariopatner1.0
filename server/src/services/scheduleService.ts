import { dataStore } from '../config/dataStore'
import { WeeklyShift, WeeklyAssignment } from '../types'
import { v4 as uuidv4 } from 'uuid'

class ScheduleService {
  private readonly shiftsFilename = 'shifts.json'
  private readonly assignmentsFilename = 'assignments.json'

  // Shifts
  async getAllShifts(): Promise<WeeklyShift[]> {
    const shifts = await dataStore.read<WeeklyShift[]>(this.shiftsFilename)
    return shifts || []
  }

  async getShiftById(id: string): Promise<WeeklyShift | null> {
    const shifts = await this.getAllShifts()
    return shifts.find((s) => s.id === id) || null
  }

  async createShift(data: Omit<WeeklyShift, 'id'>): Promise<WeeklyShift> {
    const shifts = await this.getAllShifts()
    const newShift: WeeklyShift = {
      ...data,
      id: uuidv4(),
    }
    shifts.push(newShift)
    await dataStore.write(this.shiftsFilename, shifts)
    return newShift
  }

  async updateShift(id: string, updates: Partial<WeeklyShift>): Promise<WeeklyShift | null> {
    const shifts = await this.getAllShifts()
    const index = shifts.findIndex((s) => s.id === id)
    
    if (index === -1) {
      return null
    }

    shifts[index] = { ...shifts[index], ...updates, id }
    await dataStore.write(this.shiftsFilename, shifts)
    return shifts[index]
  }

  async deleteShift(id: string): Promise<boolean> {
    const shifts = await this.getAllShifts()
    const filtered = shifts.filter((s) => s.id !== id)
    
    if (filtered.length === shifts.length) {
      return false
    }

    // Also delete associated assignments
    const assignments = await this.getAllAssignments()
    const filteredAssignments = assignments.filter((a) => a.shiftId !== id)
    await dataStore.write(this.assignmentsFilename, filteredAssignments)
    
    await dataStore.write(this.shiftsFilename, filtered)
    return true
  }

  // Assignments
  async getAllAssignments(): Promise<WeeklyAssignment[]> {
    const assignments = await dataStore.read<WeeklyAssignment[]>(this.assignmentsFilename)
    return assignments || []
  }

  async getAssignmentsByShift(shiftId: string): Promise<WeeklyAssignment[]> {
    const assignments = await this.getAllAssignments()
    return assignments.filter((a) => a.shiftId === shiftId)
  }

  async createAssignment(data: {
    shiftId: string
    caddieId: string
    caddieName: string
    caddieNumber: number
    category: string
    time: string
  }): Promise<WeeklyAssignment> {
    const assignments = await this.getAllAssignments()
    
    // Check if assignment already exists
    const exists = assignments.find(
      (a) => a.shiftId === data.shiftId && a.caddieId === data.caddieId
    )
    
    if (exists) {
      throw new Error('Assignment already exists for this caddie and shift')
    }

    const newAssignment: WeeklyAssignment = data
    assignments.push(newAssignment)
    await dataStore.write(this.assignmentsFilename, assignments)
    return newAssignment
  }

  async deleteAssignment(shiftId: string, caddieId: string): Promise<boolean> {
    const assignments = await this.getAllAssignments()
    const filtered = assignments.filter(
      (a) => !(a.shiftId === shiftId && a.caddieId === caddieId)
    )
    
    if (filtered.length === assignments.length) {
      return false
    }

    await dataStore.write(this.assignmentsFilename, filtered)
    return true
  }

  async initializeData(): Promise<void> {
    const shiftsExist = await dataStore.exists(this.shiftsFilename)
    const assignmentsExist = await dataStore.exists(this.assignmentsFilename)
    
    if (!shiftsExist) {
      await dataStore.write(this.shiftsFilename, [])
    }
    
    if (!assignmentsExist) {
      await dataStore.write(this.assignmentsFilename, [])
    }
  }
}

export const scheduleService = new ScheduleService()
