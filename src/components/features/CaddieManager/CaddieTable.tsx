import React from 'react'
import { MapPin, Activity, Pencil, Power, Search } from 'lucide-react'
import { Badge, Table } from '../../ui'
import type { CaddieTableProps, StatusConfig } from './CaddieManager.types'
import { CaddieStatus } from '../../../types'
import './CaddieTable.css'

const CaddieTable: React.FC<CaddieTableProps> = ({
  caddies,
  onEditCaddie,
  onToggleActive,
  onResetFilters
}) => {
  const getStatusConfig = (status: CaddieStatus, isActive: boolean): StatusConfig => {
    if (!isActive) {
      return {
        label: 'Inactive',
        color: 'bg-slate-100 text-slate-400 border-slate-200'
      }
    }

    switch (status) {
      case CaddieStatus.AVAILABLE:
        return {
          label: 'Available',
          color: 'bg-emerald-100 text-emerald-700 border-emerald-200'
        }
      case CaddieStatus.IN_FIELD:
        return { label: 'In Field', color: 'bg-amber-100 text-amber-700 border-amber-200' }
      case CaddieStatus.IN_PREP:
        return { label: 'In Prep', color: 'bg-indigo-100 text-indigo-700 border-indigo-200' }
      case CaddieStatus.LATE:
        return { label: 'Late', color: 'bg-amber-100 text-amber-600 border-amber-200' }
      case CaddieStatus.ABSENT:
        return { label: 'No Show', color: 'bg-rose-100 text-rose-700 border-rose-200' }
      case CaddieStatus.ON_LEAVE:
        return { label: 'On Leave', color: 'bg-sky-100 text-sky-700 border-sky-200' }
      default:
        return { label: 'Inactive', color: 'bg-slate-100 text-slate-500 border-slate-200' }
    }
  }

  if (caddies.length === 0) {
    return (
      <div className="caddie-table__empty">
        <div className="caddie-table__empty-icon">
          <Search size={40} />
        </div>
        <h3 className="caddie-table__empty-title">No Results</h3>
        <p className="caddie-table__empty-message">
          No caddies found with selected filters
        </p>
        {onResetFilters && (
          <button onClick={onResetFilters} className="caddie-table__reset-btn">
            Reset View
          </button>
        )}
      </div>
    )
  }

  const columns = [
    {
      key: 'caddieId',
      title: 'Caddie ID',
      render: (caddie: typeof caddies[0]) => (
        <div
          className={`caddie-table__id-badge ${
            caddie.isActive ? 'caddie-table__id-badge--active' : ''
          }`}
        >
          {caddie.number}
        </div>
      )
    },
    {
      key: 'name',
      title: 'Name and Category',
      render: (caddie: typeof caddies[0]) => (
        <div className="caddie-table__name-section">
          <p
            className={`caddie-table__name ${
              caddie.isActive ? 'caddie-table__name--active' : 'caddie-table__name--inactive'
            }`}
          >
            {caddie.name}
          </p>
          <div className="caddie-table__category-wrapper">
            <Badge
              variant={
                !caddie.isActive
                  ? 'secondary'
                  : caddie.category === 'Primera'
                    ? 'primary'
                    : caddie.category === 'Segunda'
                      ? 'warning'
                      : 'secondary'
              }
              size="sm"
            >
              Category {caddie.category || 'N/A'}
            </Badge>
          </div>
        </div>
      )
    },
    {
      key: 'location',
      title: 'Location / Discipline',
      render: (caddie: typeof caddies[0]) => (
        <div className="caddie-table__info-section">
          <div className="caddie-table__info-item">
            <MapPin size={10} className="caddie-table__info-icon" />
            <span className="caddie-table__info-text">{caddie.location}</span>
          </div>
          <div className="caddie-table__info-item">
            <Activity size={10} className="caddie-table__info-icon" />
            <span className="caddie-table__info-text">{caddie.role}</span>
          </div>
        </div>
      )
    },
    {
      key: 'status',
      title: 'Master Status',
      render: (caddie: typeof caddies[0]) => {
        const status = getStatusConfig(caddie.status, caddie.isActive)
        return (
          <Badge
            variant={
              caddie.isActive
                ? caddie.status === CaddieStatus.AVAILABLE
                  ? 'success'
                  : caddie.status === CaddieStatus.IN_FIELD ||
                      caddie.status === CaddieStatus.IN_PREP ||
                      caddie.status === CaddieStatus.LATE
                    ? 'warning'
                    : 'danger'
                : 'secondary'
            }
            size="sm"
          >
            {status.label}
          </Badge>
        )
      }
    },
    {
      key: 'services',
      title: 'Services',
      render: (caddie: typeof caddies[0]) => (
        <span className="caddie-table__services-count">
          {caddie.historyCount}
        </span>
      )
    },
    {
      key: 'actions',
      title: 'Options',
      render: (caddie: typeof caddies[0]) => (
        <div className="caddie-table__actions">
          <button
            onClick={() => onToggleActive(caddie.id)}
            className={`caddie-table__action-btn caddie-table__action-btn--power ${
              caddie.isActive
                ? 'caddie-table__action-btn--deactivate'
                : 'caddie-table__action-btn--activate'
            }`}
            title={caddie.isActive ? 'Deactivate from Lists' : 'Activate in Lists'}
            aria-label={caddie.isActive ? 'Deactivate caddie' : 'Activate caddie'}
          >
            <Power size={18} />
          </button>
          <button
            onClick={() => onEditCaddie(caddie)}
            className="caddie-table__action-btn caddie-table__action-btn--edit"
            title="Edit Profile"
            aria-label="Edit caddie"
          >
            <Pencil size={18} />
          </button>
        </div>
      )
    }
  ]

  return (
    <div className="caddie-table__wrapper">
      <Table
        columns={columns}
        data={caddies}
        variant="default"
        hover={true}
        compact={false}
      />
    </div>
  )
}

export default CaddieTable
