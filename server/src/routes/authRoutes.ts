import { Router } from 'express'
import { authController } from '../controllers/authController'
import { authMiddleware } from '../middleware/auth'

const router = Router()

// Public routes
router.post('/login', authController.login.bind(authController))
router.post('/verify', authController.verifyToken.bind(authController))

// Protected routes
router.get('/me', authMiddleware, authController.getMe.bind(authController))

export default router
