import type { Caddie, WeeklyShift, WeeklyAssignment, WeeklyShiftRequirement } from '../../../types'
import type { LucideIcon } from 'lucide-react'

export interface WeeklyDrawProps {}

export interface DaySelectorProps {
  activeDay: string
  onDayChange: (day: string) => void
  totalAvailable: number
  onGenerate: (day: string) => void
  isGenerateDisabled: boolean
}

export interface AvailableCaddiesSidebarProps {
  activeDay: string
  availableCaddies: {
    Primera: Caddie[]
    Segunda: Caddie[]
    Tercera: Caddie[]
  }
  activeCategoryTab: 'Primera' | 'Segunda' | 'Tercera'
  onCategoryTabChange: (category: 'Primera' | 'Segunda' | 'Tercera') => void
}

export interface ShiftConfiguratorProps {
  newTime: string
  onTimeChange: (time: string) => void
  counts: { Primera: number; Segunda: number; Tercera: number }
  onCountChange: (category: string, value: number) => void
  availableCounts: { Primera: number; Segunda: number; Tercera: number }
  onAddShift: () => void
}

export interface ShiftTimelineProps {
  activeDay: string
  dayShifts: WeeklyShift[]
  dayAssignments: WeeklyAssignment[]
  onRemoveShift: (id: string) => void
}

export interface CategoryInfo {
  id: string
  name: string
  icon: LucideIcon
  color: string
  bg: string
}
