import { Request, Response, NextFunction } from 'express'
import { jwtUtils } from '../utils/jwt'
import { JwtPayload } from '../types'

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload
    }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: 'No token provided',
      })
      return
    }

    const token = authHeader.substring(7)
    const decoded = jwtUtils.verifyToken(token)

    if (!decoded) {
      res.status(401).json({
        success: false,
        error: 'Invalid or expired token',
      })
      return
    }

    req.user = decoded
    next()
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Authentication failed',
    })
  }
}

export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      })
      return
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
      })
      return
    }

    next()
  }
}
