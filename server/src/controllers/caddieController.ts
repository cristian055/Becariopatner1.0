import { Request, Response, NextFunction } from 'express'
import { caddieService } from '../services/caddieService'
import { ApiError } from '../middleware/errorHandler'

export class CaddieController {
  async getAllCaddies(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const caddies = await caddieService.getAllCaddies()
      res.json({
        success: true,
        data: caddies,
      })
    } catch (error) {
      next(error)
    }
  }

  async getCaddieById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params
      const caddie = await caddieService.getCaddieById(id)

      if (!caddie) {
        throw new ApiError('Caddie not found', 404)
      }

      res.json({
        success: true,
        data: caddie,
      })
    } catch (error) {
      next(error)
    }
  }

  async createCaddie(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const caddie = await caddieService.createCaddie(req.body)
      res.status(201).json({
        success: true,
        data: caddie,
      })
    } catch (error) {
      next(error)
    }
  }

  async updateCaddie(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params
      const caddie = await caddieService.updateCaddie(id, req.body)

      if (!caddie) {
        throw new ApiError('Caddie not found', 404)
      }

      res.json({
        success: true,
        data: caddie,
      })
    } catch (error) {
      next(error)
    }
  }

  async deleteCaddie(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params
      const deleted = await caddieService.deleteCaddie(id)

      if (!deleted) {
        throw new ApiError('Caddie not found', 404)
      }

      res.json({
        success: true,
        message: 'Caddie deleted successfully',
      })
    } catch (error) {
      next(error)
    }
  }

  async bulkUpdateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { ids, status } = req.body

      if (!ids || !Array.isArray(ids) || !status) {
        throw new ApiError('Invalid request body', 400)
      }

      const updated = await caddieService.bulkUpdateStatus(ids, status)
      res.json({
        success: true,
        data: updated,
      })
    } catch (error) {
      next(error)
    }
  }
}

export const caddieController = new CaddieController()
