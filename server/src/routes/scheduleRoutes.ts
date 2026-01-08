import { Router } from 'express'
import { scheduleController } from '../controllers/scheduleController'
import { authMiddleware, requireRole } from '../middleware/auth'
import { validate } from '../middleware/validate'
import { CreateShiftSchema, UpdateShiftSchema, CreateAssignmentSchema } from '../utils/validation'

const router = Router()

// All routes require authentication
router.use(authMiddleware)

// Shift routes
router.get('/shifts', scheduleController.getAllShifts.bind(scheduleController))
router.get('/shifts/:id', scheduleController.getShiftById.bind(scheduleController))

router.post(
  '/shifts',
  requireRole(['admin', 'operator']),
  validate(CreateShiftSchema),
  scheduleController.createShift.bind(scheduleController)
)

router.put(
  '/shifts/:id',
  requireRole(['admin', 'operator']),
  validate(UpdateShiftSchema),
  scheduleController.updateShift.bind(scheduleController)
)

router.delete(
  '/shifts/:id',
  requireRole(['admin']),
  scheduleController.deleteShift.bind(scheduleController)
)

// Assignment routes
router.get('/assignments', scheduleController.getAllAssignments.bind(scheduleController))

router.post(
  '/assignments',
  requireRole(['admin', 'operator']),
  validate(CreateAssignmentSchema),
  scheduleController.createAssignment.bind(scheduleController)
)

router.delete(
  '/assignments/:shiftId/:caddieId',
  requireRole(['admin', 'operator']),
  scheduleController.deleteAssignment.bind(scheduleController)
)

export default router
