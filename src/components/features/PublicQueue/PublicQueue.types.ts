import type { Caddie, ListConfig } from '../../../types'
import type { LucideIcon } from 'lucide-react'

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

export interface QueueCategoryProps {
  category: QueueCategoryInfo
  topCaddies: Caddie[]
}

export interface CaddieRowProps {
  caddie: Caddie
  index: number
}

export interface DispatchPopupProps {
  callingCaddies: Caddie[]
  layout: {
    grid: string
    card: string
    circle: string
    name: string
    badge: string
  }
}
