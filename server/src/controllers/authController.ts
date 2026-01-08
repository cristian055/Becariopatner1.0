import { Request, Response } from 'express'
import { jwtUtils } from '../utils/jwt'
import bcrypt from 'bcrypt'
import { v4 as uuidv4 } from 'uuid'

// Temporary mock user for testing
const mockUser = {
  id: uuidv4(),
  email: 'admin@caddiepro.com',
  password: '$2b$10$YourHashedPasswordHere', // Will be hashed password
  name: 'Admin User',
  role: 'admin',
  isActive: true,
}

export class AuthController {
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body

      // For testing, accept any password for admin@caddiepro.com
      if (email === 'admin@caddiepro.com' && password) {
        const token = jwtUtils.generateToken({
          userId: mockUser.id,
          email: mockUser.email,
          role: mockUser.role,
        })

        const refreshToken = jwtUtils.generateRefreshToken({
          userId: mockUser.id,
          email: mockUser.email,
          role: mockUser.role,
        })

        res.json({
          success: true,
          data: {
            user: {
              id: mockUser.id,
              email: mockUser.email,
              name: mockUser.name,
              role: mockUser.role,
            },
            token,
            refreshToken,
          },
        })
        return
      }

      res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Login failed',
      })
    }
  }

  async verifyToken(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.body

      if (!token) {
        res.status(400).json({
          success: false,
          error: 'Token is required',
        })
        return
      }

      const decoded = jwtUtils.verifyToken(token)

      if (!decoded) {
        res.status(401).json({
          success: false,
          error: 'Invalid or expired token',
        })
        return
      }

      res.json({
        success: true,
        data: decoded,
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Token verification failed',
      })
    }
  }

  async getMe(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Not authenticated',
        })
        return
      }

      res.json({
        success: true,
        data: {
          id: req.user.userId,
          email: req.user.email,
          role: req.user.role,
        },
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to get user info',
      })
    }
  }
}

export const authController = new AuthController()
