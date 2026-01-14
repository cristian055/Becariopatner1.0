import React from 'react'
import { useCaddies } from '../../../hooks/useCaddies'
import { caddieService } from '../../../services/caddieService'
import CaddieSearchBar from './CaddieSearchBar'
import CaddieTable from './CaddieTable'
import CaddieEditModal from './CaddieEditModal'
import type { CaddieManagerProps } from './CaddieManager.types'
import { DEFAULT_AVAILABILITY } from './CaddieManager.types'
import type { Caddie } from '../../../types'
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

      const categoryCaddies = caddies.filter(c => c.category === newCaddie.category)
      const maxPriority = categoryCaddies.length > 0
        ? Math.max(...categoryCaddies.map(c => c.weekendPriority || 0))
        : 0

      setNewCaddie(prev => ({
        ...prev,
        number: nextNum,
        weekendPriority: maxPriority + 1
      }))
      setError(null)
    }
  }, [isAddingCaddie, caddies, newCaddie.category])

  const handleSaveEdit = async (caddie: Caddie, callback?: (result?: any) => void): Promise<void> => {
    const validation = caddieService.validateCaddieNumberUniqueness(
      caddie.number,
      caddie.id,
      caddies
    )

    if (!validation.valid) {
      setError(validation.errors[0])
      return
    }

    const result = await updateCaddie({ id: caddie.id, updates: caddie })
    setEditingCaddie(null)
    setError(null)

    callback?.(result)
  }

  const handleSaveNew = (caddie: Caddie): void => {
    setError(null)

    const caddieInput = {
      name: caddie.name,
      number: caddie.number,
      category: caddie.category,
      location: caddie.location,
      role: caddie.role,
      availability: caddie.availability,
      weekendPriority: caddie.weekendPriority || caddie.number
    }

    const validation = caddieService.validateCreateInput(caddieInput, caddies)
    if (!validation.valid) {
      setError(validation.errors[0])
      return
    }

    createCaddie(caddieInput)
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
    setFilters((prev) => ({ ...prev, category: value === 'All' ? undefined : value as 'All' | 'Primera' | 'Segunda' | 'Tercera' | undefined }))
  }

  const handleActiveChange = (value: string): void => {
    setFilters((prev) => ({ ...prev, activeStatus: value === 'All' ? undefined : value as 'All' | 'Active' | 'Inactive' | undefined }))
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
          caddie={isAddingCaddie ? {
            ...newCaddie,
            id: `temp-${Date.now()}`,
            status: 'AVAILABLE',
            listId: null,
            historyCount: 0,
            absencesCount: 0,
            lateCount: 0,
            leaveCount: 0,
            lastActionTime: '08:00 AM'
          } as Caddie : editingCaddie}
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
