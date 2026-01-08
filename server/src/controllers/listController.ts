import { Request, Response, NextFunction } from 'express'
import { listService } from '../services/listService'
import { ApiError } from '../middleware/errorHandler'
import { socketManager } from '../server'

export class ListController {
  async getAllLists(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const lists = await listService.getAllLists()
      res.json({
        success: true,
        data: lists,
      })
    } catch (error) {
      next(error)
    }
  }

  async getListById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params
      const list = await listService.getListById(id)

      if (!list) {
        throw new ApiError('List not found', 404)
      }

      res.json({
        success: true,
        data: list,
      })
    } catch (error) {
      next(error)
    }
  }

  async createList(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const list = await listService.createList(req.body)
      
      // Broadcast WebSocket event
      socketManager.broadcastListCreated(list)
      
      res.status(201).json({
        success: true,
        data: list,
      })
    } catch (error) {
      next(error)
    }
  }

  async updateList(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params
      const list = await listService.updateList(id, req.body)

      if (!list) {
        throw new ApiError('List not found', 404)
      }

      // Broadcast WebSocket event
      socketManager.broadcastListUpdated(list)

      res.json({
        success: true,
        data: list,
      })
    } catch (error) {
      next(error)
    }
  }

  async deleteList(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params
      const deleted = await listService.deleteList(id)

      if (!deleted) {
        throw new ApiError('List not found', 404)
      }

      // Broadcast WebSocket event
      socketManager.broadcastListDeleted(id)

      res.json({
        success: true,
        message: 'List deleted successfully',
      })
    } catch (error) {
      next(error)
    }
  }
}

export const listController = new ListController()
