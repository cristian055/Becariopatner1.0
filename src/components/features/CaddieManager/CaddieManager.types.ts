import type { Caddie, DayAvailability } from '../../../types'

/**
 * Props for the main CaddieManager component
 */
export interface CaddieManagerProps {
  // Optional props if parent needs to pass data
  // If using hooks directly, these can be omitted
  caddies?: Caddie[]
}

/**
 * Props for the CaddieSearchBar component
 */
export interface CaddieSearchBarProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  categoryFilter: CategoryFilter
  onCategoryChange: (value: CategoryFilter) => void
  activeFilter: ActiveFilter
  onActiveChange: (value: ActiveFilter) => void
  onAddCaddie: () => void
}

/**
 * Props for the CaddieTable component
 */
export interface CaddieTableProps {
  caddies: Caddie[]
  onEditCaddie: (caddie: Caddie) => void
  onToggleActive: (id: string) => void
  onResetFilters?: () => void
}

/**
 * Props for the CaddieEditModal component
 */
export interface CaddieEditModalProps {
  isOpen: boolean
  caddie: Caddie | null
  isAdding: boolean
  allCaddies: Caddie[]
  error: string | null
  onClose: () => void
  onSave: (caddie: Caddie) => void
  onErrorChange: (error: string | null) => void
}

/**
 * Props for the CaddieAvailabilityEditor component
 */
export interface CaddieAvailabilityEditorProps {
  availability: DayAvailability[]
  onChange: (availability: DayAvailability[]) => void
}

/**
 * Category filter options
 */
export type CategoryFilter = 'All' | 'Primera' | 'Segunda' | 'Tercera'

/**
 * Active status filter options
 */
export type ActiveFilter = 'All' | 'Active' | 'Inactive'

/**
 * Status configuration for display
 */
export interface StatusConfig {
  label: string
  color: string
}

/**
 * Default availability for new caddies
 */
export const DEFAULT_AVAILABILITY: DayAvailability[] = [
  { day: 'Friday', isAvailable: true, range: { type: 'after', time: '09:30 AM' } },
  { day: 'Saturday', isAvailable: true, range: { type: 'full' } },
  { day: 'Sunday', isAvailable: true, range: { type: 'full' } }
]
