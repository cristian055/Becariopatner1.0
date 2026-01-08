import React from 'react'
import { Clock, Star, Trophy, Users as UsersIcon, Plus, Minus } from 'lucide-react'
import type { ShiftConfiguratorProps, CategoryInfo } from './WeeklyDraw.types'
import './ShiftConfigurator.css'

const CATEGORIES: CategoryInfo[] = [
  { id: 'Primera', name: 'First Class', icon: Star, color: 'text-campestre-600', bg: 'bg-campestre-50' },
  { id: 'Segunda', name: 'Second Class', icon: Trophy, color: 'text-amber-600', bg: 'bg-amber-50' },
  { id: 'Tercera', name: 'Third Class', icon: UsersIcon, color: 'text-slate-600', bg: 'bg-slate-50' },
]

const ShiftConfigurator: React.FC<ShiftConfiguratorProps> = ({
  newTime,
  onTimeChange,
  counts,
  onCountChange,
  availableCounts,
  onAddShift,
}) => {
  const isAddDisabled = Object.values(counts).every((v) => v === 0)

  return (
    <div className="shift-config">
      <div className="shift-config__layout">
        <div className="shift-config__time-section">
          <div className="shift-config__section-title">
            <Clock size={22} className="shift-config__title-icon" />
            <h3>Configure Tee-Off</h3>
          </div>

          <div className="shift-config__time-card">
            <label className="shift-config__time-label">Tee-Off Time</label>
            <input
              type="time"
              value={newTime}
              onChange={(e) => onTimeChange(e.target.value)}
              className="shift-config__time-input"
            />
            <div className="shift-config__time-divider"></div>
            <p className="shift-config__location-tag">Llanogrande Branch</p>
          </div>
        </div>

        <div className="shift-config__slots-section">
          <h4 className="shift-config__slots-title">Required Slots per Category</h4>
          <div className="shift-config__slots-grid">
            {CATEGORIES.map((cat) => {
              const avail = availableCounts[cat.id as keyof typeof availableCounts] || 0
              const val = counts[cat.id as keyof typeof counts] || 0
              return (
                <div
                  key={cat.id}
                  className={`category-slot-card ${
                    val > 0 ? 'category-slot-card--active' : ''
                  }`}
                >
                  <div className="category-slot-card__header">
                    <cat.icon size={20} className={cat.color} />
                    <span
                      className={`category-slot-card__avail ${
                        avail < val ? 'category-slot-card__avail--insufficient' : ''
                      }`}
                    >
                      Free: {avail}
                    </span>
                  </div>
                  <p className="category-slot-card__name">{cat.name}</p>
                  <div className="category-slot-card__controls">
                    <button
                      onClick={() => onCountChange(cat.id, Math.max(0, val - 1))}
                      className="category-slot-card__btn"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="category-slot-card__value">{val}</span>
                    <button
                      onClick={() => onCountChange(cat.id, val + 1)}
                      disabled={avail <= val}
                      className="category-slot-card__btn"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <button onClick={onAddShift} disabled={isAddDisabled} className="shift-config__add-btn">
        <Plus size={20} />
        Add Shift to Schedule
      </button>
    </div>
  )
}

export default ShiftConfigurator
