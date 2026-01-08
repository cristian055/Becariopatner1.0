import { Router } from 'express'
import { listController } from '../controllers/listController'
import { authMiddleware, requireRole } from '../middleware/auth'
import { validate } from '../middleware/validate'
import { CreateListSchema, UpdateListSchema } from '../utils/validation'

const router = Router()

// All routes require authentication
router.use(authMiddleware)

// GET /api/lists - Get all lists
router.get('/', listController.getAllLists.bind(listController))

// GET /api/lists/:id - Get list by ID
router.get('/:id', listController.getListById.bind(listController))

// POST /api/lists - Create list (admin/operator only)
router.post(
  '/',
  requireRole(['admin', 'operator']),
  validate(CreateListSchema),
  listController.createList.bind(listController)
)

// PUT /api/lists/:id - Update list (admin/operator only)
router.put(
  '/:id',
  requireRole(['admin', 'operator']),
  validate(UpdateListSchema),
  listController.updateList.bind(listController)
)

// DELETE /api/lists/:id - Delete list (admin only)
router.delete(
  '/:id',
  requireRole(['admin']),
  listController.deleteList.bind(listController)
)

export default router
