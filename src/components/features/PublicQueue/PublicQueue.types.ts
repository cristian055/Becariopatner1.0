import type { Caddie } from '../../../types'
import type { LucideIcon } from 'lucide-react'
import type { PublicCaddie } from '../../../services/publicApiService'
import type { DispatchCaddie } from '../../../stores/publicStore'

export interface PublicQueueProps {
  onBack?: () => void
}

export interface QueueCategoryInfo {
  name: string
  icon: LucideIcon
  color: string
}

export interface QueueHeaderProps {
  onBack?: () => void
}

// QueueCaddie can be either a full Caddie (admin) or PublicCaddie (public monitor)
export type QueueCaddie = Caddie | PublicCaddie

export interface QueueCategoryProps {
  category: QueueCategoryInfo
  topCaddies: QueueCaddie[]
}

export interface CaddieRowProps {
  caddie: QueueCaddie
  index: number
}

// DispatchPopupCaddie can be either a full Caddie (admin) or DispatchCaddie (public monitor)
export type DispatchPopupCaddie = Caddie | DispatchCaddie

export interface DispatchPopupProps {
  callingCaddies: DispatchPopupCaddie[]
  layout: {
    grid: string
    card: string
    circle: string
    name: string
    badge: string
  }
}
