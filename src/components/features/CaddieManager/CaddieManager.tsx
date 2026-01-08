import React from 'react'
import { useCaddies } from '../../../hooks/useCaddies'
import { caddieService } from '../../../services/caddieService'
import CaddieSearchBar from './CaddieSearchBar'
import CaddieTable from './CaddieTable'
import CaddieEditModal from './CaddieEditModal'
import type { CaddieManagerProps } from './CaddieManager.types'
import { DEFAULT_AVAILABILITY } from './CaddieManager.types'
import { Caddie } from '../../../types'
import './CaddieManager.css'

const CaddieManager: React.FC<CaddieManagerProps> = () => {
  const {
    caddies,
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    filteredCaddies,
    updateCaddie,
    createCaddie
  } = useCaddies()

  const [editingCaddie, setEditingCaddie] = React.useState<Caddie | null>(null)
  const [isAddingCaddie, setIsAddingCaddie] = React.useState(false)
  const [error, setError] = React.useState<null | string>(null)
  const [newCaddie, setNewCaddie] = React.useState({
    name: '',
    number: 1,
    isActive: true,
    category: 'Primera' as const,
    location: 'Llanogrande' as const,
    role: 'Golf' as const,
    availability: [...DEFAULT_AVAILABILITY],
    weekendPriority: 0,
    isSkippedNextWeek: false
  })

  React.useEffect(() => {
    if (isAddingCaddie) {
      const nextNum = caddies.length > 0 ? Math.max(...caddies.map((c: Caddie) => c.number)) + 1 : 1
      setNewCaddie(prev => ({ ...prev, number: nextNum }))
      setError(null)
    }
  }, [isAddingCaddie, caddies])

  const handleSaveEdit = (caddie: Caddie): void => {
    const validation = caddieService.validateCaddieNumberUniqueness(
      caddie.number,
      caddie.id,
      caddies
    )

    if (!validation.valid) {
      setError(validation.errors[0])
      return
    }

    updateCaddie({ id: caddie.id, updates: caddie })
    setEditingCaddie(null)
    setError(null)
  }

  const handleSaveNew = (caddieInput: typeof newCaddie): void => {
    setError(null)

    const validation = caddieService.validateCreateInput(caddieInput, caddies)
    if (!validation.valid) {
      setError(validation.errors[0])
      return
    }

    createCaddie({
      ...caddieInput,
      weekendPriority: caddieInput.number
    })
    setIsAddingCaddie(false)

    setNewCaddie({
      name: '',
      number: 1,
      isActive: true,
      category: 'Primera',
      location: 'Llanogrande',
      role: 'Golf',
      availability: [...DEFAULT_AVAILABILITY],
      weekendPriority: 0,
      isSkippedNextWeek: false
    })
  }

  const resetFilters = (): void => {
    setFilters({
      category: undefined,
      activeStatus: undefined,
      location: undefined,
      role: undefined
    })
    setSearchTerm('')
  }

  const handleCategoryChange = (value: string): void => {
    setFilters((prev) => ({ ...prev, category: value === 'All' ? undefined : value as any }))
  }

  const handleActiveChange = (value: string): void => {
    setFilters((prev) => ({ ...prev, activeStatus: value === 'All' ? undefined : value as any }))
  }

  return (
    <div className="caddie-manager">
      <div className="caddie-manager__search-section">
        <CaddieSearchBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          categoryFilter={filters.category || 'All'}
          onCategoryChange={handleCategoryChange}
          activeFilter={filters.activeStatus || 'All'}
          onActiveChange={handleActiveChange}
          onAddCaddie={() => setIsAddingCaddie(true)}
        />
      </div>

      <div className="caddie-manager__table-section">
        <CaddieTable
          caddies={filteredCaddies}
          onEditCaddie={setEditingCaddie}
          onToggleActive={id => {
            const caddie = caddies.find((c: Caddie) => c.id === id)
            if (caddie) {
              updateCaddie({ id, updates: { isActive: !caddie.isActive } })
            }
          }}
          onResetFilters={resetFilters}
        />
      </div>

      {(editingCaddie || isAddingCaddie) && (
        <CaddieEditModal
          isOpen={editingCaddie !== null || isAddingCaddie}
          caddie={editingCaddie}
          isAdding={isAddingCaddie}
          allCaddies={caddies}
          error={error}
          onClose={() => {
            setEditingCaddie(null)
            setIsAddingCaddie(false)
            setError(null)
          }}
          onSave={isAddingCaddie ? handleSaveNew : handleSaveEdit}
          onErrorChange={setError}
        />
      )}
    </div>
  )
}

export default CaddieManager
