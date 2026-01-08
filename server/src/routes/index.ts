import { Router } from 'express'
import authRoutes from './authRoutes'
import caddieRoutes from './caddieRoutes'
import listRoutes from './listRoutes'
import scheduleRoutes from './scheduleRoutes'

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
router.use('/lists', listRoutes)
router.use('/schedule', scheduleRoutes)

export default router
