import type { Caddie } from '../../../types'

export interface ReportsProps {}

export interface StatsGridProps {
  totalServices: number
  worked: number
  absent: number
  onLeave: number
  late: number
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
