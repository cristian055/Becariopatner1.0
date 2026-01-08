import { Router } from 'express'
import authRoutes from './authRoutes'
import caddieRoutes from './caddieRoutes'

const router = Router()

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'CaddiePro API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  })
})

// API routes
router.use('/auth', authRoutes)
router.use('/caddies', caddieRoutes)

export default router
