import { z } from 'zod'

// Caddie validation schemas
export const CaddieStatusSchema = z.enum([
  'AVAILABLE',
  'IN_PREP',
  'IN_FIELD',
  'LATE',
  'ABSENT',
  'ON_LEAVE',
])

export const CaddieLocationSchema = z.enum(['Llanogrande', 'Medellín'])
export const CaddieRoleSchema = z.enum(['Golf', 'Tennis', 'Hybrid'])
export const CaddieCategorySchema = z.enum(['Primera', 'Segunda', 'Tercera'])

export const TimeAvailabilitySchema = z.object({
  type: z.enum(['before', 'after', 'between', 'full']),
  time: z.string().optional(),
  endTime: z.string().optional(),
})

export const DayAvailabilitySchema = z.object({
  day: z.enum(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']),
  isAvailable: z.boolean(),
  range: TimeAvailabilitySchema.optional(),
})

export const CreateCaddieSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  number: z.number().int().positive(),
  status: CaddieStatusSchema.optional().default('AVAILABLE'),
  isActive: z.boolean().optional().default(true),
  listId: z.string().nullable().optional(),
  historyCount: z.number().int().min(0).optional().default(0),
  absencesCount: z.number().int().min(0).optional().default(0),
  lateCount: z.number().int().min(0).optional().default(0),
  leaveCount: z.number().int().min(0).optional().default(0),
  lastActionTime: z.string().optional().default('08:00 AM'),
  category: CaddieCategorySchema,
  location: CaddieLocationSchema,
  role: CaddieRoleSchema,
  availability: z.array(DayAvailabilitySchema).optional().default([]),
  weekendPriority: z.number().int().min(0),
  isSkippedNextWeek: z.boolean().optional(),
})

export const UpdateCaddieSchema = CreateCaddieSchema.partial()

export const BulkUpdateStatusSchema = z.object({
  ids: z.array(z.string()).min(1, 'At least one ID is required'),
  status: CaddieStatusSchema,
})

// List validation schemas
export const ListOrderSchema = z.enum(['ASC', 'DESC', 'RANDOM', 'MANUAL'])

export const CreateListSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  order: ListOrderSchema.optional().default('ASC'),
  rangeStart: z.number().int().min(1),
  rangeEnd: z.number().int().min(1),
  category: CaddieCategorySchema,
})

export const UpdateListSchema = CreateListSchema.partial()

export const ReorderListSchema = z.object({
  caddieIds: z.array(z.string()),
})

// Schedule validation schemas
export const ShiftRequirementSchema = z.object({
  category: CaddieCategorySchema,
  count: z.number().int().min(0),
})

export const CreateShiftSchema = z.object({
  day: z.string().min(1, 'Day is required'),
  time: z.string().min(1, 'Time is required'),
  requirements: z.array(ShiftRequirementSchema).min(1, 'At least one requirement is required'),
})

export const UpdateShiftSchema = CreateShiftSchema.partial()

export const CreateAssignmentSchema = z.object({
  shiftId: z.string().min(1, 'Shift ID is required'),
  caddieId: z.string().min(1, 'Caddie ID is required'),
})

// Validation middleware helper
export type ValidationSchema = z.ZodType<unknown>
