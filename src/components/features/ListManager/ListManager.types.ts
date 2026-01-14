import type { Caddie, ListConfig} from '../../../types';
import { CaddieStatus } from '../../../types'
import type { QueuePosition } from '../../../stores/listStore'

/**
 * Props for main ListManager component
 */
export interface ListManagerProps {}

/**
 * Props for C ListTabs component
 */
export interface ListTabsProps {
  lists: ListConfig[]
  activeTabId: string
  onTabChange: (id: string) => void
}

/**
 * Props for C QueueGrid component
 */
export interface QueueGridProps {
  caddies: Caddie[]
  lists: ListConfig[]
  activeTabId: string
  isManualReorderMode: boolean
  onDragStart: (e: React.DragEvent, caddieId: string) => void
  onDragOver: (e: React.DragEvent, targetId: string) => void
  onDrop: (e: React.DragEvent, caddieId: string) => void
  onPositionChange: (caddieId: string, newPos: number) => void
  onUpdateCaddie: (id: string, updates: Partial<Caddie>) => void
  queuePositions?: QueuePosition[]
}

/**
 * Props for C ListControls component
 */
export interface ListControlsProps {
  activeList: ListConfig | null
  isManualMode: boolean
  onToggleManualMode: () => void
  onRandomizeList?: (listId: string) => void
  onReverseList?: (listId: string) => void
  onOpenEdit: () => void
}

/**
 * Props for C BulkDispatch component
 */
export interface BulkDispatchProps {
  lists: ListConfig[]
  bulkCounts: Record<string, number>
  onIncrement: (listId: string) => void
  onDecrement: (listId: string) => void
  onConfirm: () => void
}
