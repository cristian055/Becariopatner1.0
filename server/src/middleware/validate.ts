import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { ApiError } from './errorHandler'

export const validate = (schema: z.ZodType<unknown>) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validated = schema.parse(req.body)
      req.body = validated
      next()
    } catch (error) {
      if (error instanceof z.ZodError) {
        const messages = error.errors.map((err) => `${err.path.join('.')}: ${err.message}`)
        next(new ApiError(messages.join(', '), 400))
      } else {
        next(new ApiError('Validation failed', 400))
      }
    }
  }
}
