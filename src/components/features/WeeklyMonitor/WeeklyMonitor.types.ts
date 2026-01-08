import type { Caddie, WeeklyShift, WeeklyAssignment } from '../../../types'

export interface WeeklyMonitorProps {
  onBack?: () => void
}

export interface MonitorHeaderProps {
  activeDay: string
  onDayChange: (day: string) => void
  onBack: () => void
}

export interface MonitorAgendaProps {
  activeDay: string
  dayShifts: WeeklyShift[]
  assignments: WeeklyAssignment[]
}

export interface MonitorPoolProps {
  groupedPool: {
    Primera: Caddie[]
    Segunda: Caddie[]
    Tercera: Caddie[]
  }
}
