import { Request, Response, NextFunction } from 'express'
import { scheduleService } from '../services/scheduleService'
import { ApiError } from '../middleware/errorHandler'
import { socketManager } from '../server'

export class ScheduleController {
  // Shifts
  async getAllShifts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const shifts = await scheduleService.getAllShifts()
      res.json({
        success: true,
        data: shifts,
      })
    } catch (error) {
      next(error)
    }
  }

  async getShiftById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params
      const shift = await scheduleService.getShiftById(id)

      if (!shift) {
        throw new ApiError('Shift not found', 404)
      }

      res.json({
        success: true,
        data: shift,
      })
    } catch (error) {
      next(error)
    }
  }

  async createShift(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const shift = await scheduleService.createShift(req.body)
      
      // Broadcast WebSocket event
      socketManager.broadcastShiftCreated(shift)
      
      res.status(201).json({
        success: true,
        data: shift,
      })
    } catch (error) {
      next(error)
    }
  }

  async updateShift(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params
      const shift = await scheduleService.updateShift(id, req.body)

      if (!shift) {
        throw new ApiError('Shift not found', 404)
      }

      // Broadcast WebSocket event
      socketManager.broadcastShiftUpdated(shift)

      res.json({
        success: true,
        data: shift,
      })
    } catch (error) {
      next(error)
    }
  }

  async deleteShift(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params
      const deleted = await scheduleService.deleteShift(id)

      if (!deleted) {
        throw new ApiError('Shift not found', 404)
      }

      // Broadcast WebSocket event
      socketManager.broadcastShiftDeleted(id)

      res.json({
        success: true,
        message: 'Shift deleted successfully',
      })
    } catch (error) {
      next(error)
    }
  }

  // Assignments
  async getAllAssignments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { shiftId } = req.query
      
      if (shiftId && typeof shiftId === 'string') {
        const assignments = await scheduleService.getAssignmentsByShift(shiftId)
        res.json({
          success: true,
          data: assignments,
        })
      } else {
        const assignments = await scheduleService.getAllAssignments()
        res.json({
          success: true,
          data: assignments,
        })
      }
    } catch (error) {
      next(error)
    }
  }

  async createAssignment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const assignment = await scheduleService.createAssignment(req.body)
      
      // Broadcast WebSocket event
      socketManager.broadcastAssignmentCreated(assignment)
      
      res.status(201).json({
        success: true,
        data: assignment,
      })
    } catch (error) {
      next(error)
    }
  }

  async deleteAssignment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { shiftId, caddieId } = req.params
      const deleted = await scheduleService.deleteAssignment(shiftId, caddieId)

      if (!deleted) {
        throw new ApiError('Assignment not found', 404)
      }

      // Broadcast WebSocket event
      socketManager.broadcastAssignmentDeleted(shiftId, caddieId)

      res.json({
        success: true,
        message: 'Assignment deleted successfully',
      })
    } catch (error) {
      next(error)
    }
  }
}

export const scheduleController = new ScheduleController()
