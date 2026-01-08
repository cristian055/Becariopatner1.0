import React from 'react'
import { Search } from 'lucide-react'
import { Input, Select, Button } from '@/components/ui'
import type { CaddieSearchBarProps, CategoryFilter, ActiveFilter } from './CaddieManager.types'
import './CaddieSearchBar.css'

const CaddieSearchBar: React.FC<CaddieSearchBarProps> = ({
  searchTerm,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  activeFilter,
  onActiveChange,
  onAddCaddie
}) => {
  const categoryOptions = [
    { label: 'All', value: 'All' },
    { label: 'Primera', value: 'Primera' },
    { label: 'Segunda', value: 'Segunda' },
    { label: 'Tercera', value: 'Tercera' }
  ] as const

  const activeOptions = [
    { label: 'All records', value: 'All' },
    { label: 'Active Staff', value: 'Active' },
    { label: 'Inactive Staff', value: 'Inactive' }
  ] as const

  const hasActiveFilters = categoryFilter !== 'All' || activeFilter !== 'All'

  return (
    <div className="caddie-search-bar">
      <div className="caddie-search-bar__search">
        <Input
          type="text"
          placeholder="Search caddie by name or ID..."
          value={searchTerm}
          onChange={e => onSearchChange(e.target.value)}
          icon={Search as React.ComponentType<{ size?: number }>}
          aria-label="Search caddies"
        />
      </div>

      <div className="caddie-search-bar__filters">
        <Button
          variant={hasActiveFilters ? 'primary' : 'secondary'}
          onClick={() => {}}
          aria-label="Filters"
        >
          Filters
          {hasActiveFilters && (
            <span className="caddie-search-bar__indicator" aria-hidden="true" />
          )}
        </Button>

        <Select
          label="By Category"
          options={categoryOptions}
          value={categoryFilter}
          onChange={val => onCategoryChange(val as CategoryFilter)}
        />

        <Select
          label="Master Status"
          options={activeOptions}
          value={activeFilter}
          onChange={val => onActiveChange(val as ActiveFilter)}
        />

        <Button
          variant="primary"
          onClick={onAddCaddie}
          aria-label="New Caddie"
        >
          New Caddie
        </Button>
      </div>
    </div>
  )
}

export default CaddieSearchBar
