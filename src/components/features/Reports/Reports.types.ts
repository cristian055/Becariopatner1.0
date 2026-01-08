import type { Caddie } from '../../../types'

export interface ReportsProps {}

export interface StatsGridProps {
  totalServices: number
  totalAbsences: number
  totalLeaves: number
  totalLates: number
}

export interface ConfirmationModalProps {
  onConfirm: () => void
  onCancel: () => void
}

export interface ReportsHeaderProps {
  onDownload: () => void
  onOpenReset: () => void
}

export interface ServiceChartProps {
  totalServices: number
}

export interface IncidentsListProps {
  caddies: Caddie[]
}
