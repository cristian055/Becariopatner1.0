import { Router } from 'express'
import { caddieController } from '../controllers/caddieController'
import { authMiddleware, requireRole } from '../middleware/auth'
import { validate } from '../middleware/validate'
import { CreateCaddieSchema, UpdateCaddieSchema, BulkUpdateStatusSchema } from '../utils/validation'

const router = Router()

// All routes require authentication
router.use(authMiddleware)

// GET /api/caddies - Get all caddies
router.get('/', caddieController.getAllCaddies.bind(caddieController))

// GET /api/caddies/:id - Get caddie by ID
router.get('/:id', caddieController.getCaddieById.bind(caddieController))

// POST /api/caddies - Create caddie (admin/operator only)
router.post(
  '/',
  requireRole(['admin', 'operator']),
  validate(CreateCaddieSchema),
  caddieController.createCaddie.bind(caddieController)
)

// PUT /api/caddies/:id - Update caddie (admin/operator only)
router.put(
  '/:id',
  requireRole(['admin', 'operator']),
  validate(UpdateCaddieSchema),
  caddieController.updateCaddie.bind(caddieController)
)

// DELETE /api/caddies/:id - Delete caddie (admin only)
router.delete(
  '/:id',
  requireRole(['admin']),
  caddieController.deleteCaddie.bind(caddieController)
)

// POST /api/caddies/bulk-update - Bulk update status (admin/operator only)
router.post(
  '/bulk-update',
  requireRole(['admin', 'operator']),
  validate(BulkUpdateStatusSchema),
  caddieController.bulkUpdateStatus.bind(caddieController)
)

export default router
