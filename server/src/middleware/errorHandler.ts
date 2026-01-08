import { Request, Response, NextFunction } from 'express'
import { logger } from '../utils/logger'

export class ApiError extends Error {
  statusCode: number
  isOperational: boolean

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = isOperational
    Error.captureStackTrace(this, this.constructor)
  }
}

export const errorHandler = (
  err: Error | ApiError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void => {
  let statusCode = 500
  let message = 'Internal server error'
  let isOperational = false

  if (err instanceof ApiError) {
    statusCode = err.statusCode
    message = err.message
    isOperational = err.isOperational
  } else if (err.name === 'ValidationError') {
    statusCode = 400
    message = err.message
  }

  // Log error
  if (statusCode >= 500) {
    logger.error('Server error', {
      message: err.message,
      stack: err.stack,
      url: req.url,
      method: req.method,
    })
  } else {
    logger.warn('Client error', {
      message: err.message,
      url: req.url,
      method: req.method,
      statusCode,
    })
  }

  // Send response
  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && !isOperational && { stack: err.stack }),
  })
}

export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
  })
}
