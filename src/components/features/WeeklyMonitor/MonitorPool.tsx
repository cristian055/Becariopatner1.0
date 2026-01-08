import React from 'react'
import { Users as UsersIcon, Star, Trophy, MapPin } from 'lucide-react'
import type { MonitorPoolProps } from './WeeklyMonitor.types'
import './MonitorPool.css'

const MonitorPool: React.FC<MonitorPoolProps> = ({ groupedPool }) => {
  const categories = [
    { id: 'Primera', icon: Star, color: 'var(--color-campestre-500)' },
    { id: 'Segunda', icon: Trophy, color: 'rgb(245 158 11)' },
    { id: 'Tercera', icon: UsersIcon, color: 'rgb(148 163 184)' },
  ] as const

  const isEmpty = Object.values(groupedPool).every((p) => p.length === 0)

  return (
    <section className="monitor-pool">
      <div className="monitor-pool__header">
        <div className="monitor-pool__title-group">
          <UsersIcon size={24} className="monitor-pool__title-icon" />
          <h3 className="monitor-pool__title">Caddies in Pool</h3>
        </div>

        <div className="monitor-pool__summary">
          {categories.map((cat) => (
            <div key={cat.id} className="monitor-pool__summary-card">
              <cat.icon size={16} style={{ color: cat.color }} />
              <p className="monitor-pool__summary-count">
                {groupedPool[cat.id as keyof typeof groupedPool].length}
              </p>
              <p className="monitor-pool__summary-label">{cat.id}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="monitor-pool__content">
        {isEmpty ? (
          <div className="monitor-pool__empty">
            <UsersIcon size={64} className="monitor-pool__empty-icon" />
            <p className="monitor-pool__empty-text">Empty Pool</p>
          </div>
        ) : (
          Object.entries(groupedPool).map(([category, caddies]) => (
            <div key={category} className="monitor-pool__category-section">
              <div className="monitor-pool__category-header">
                <div
                  className={`monitor-pool__category-dot monitor-pool__category-dot--${category.toLowerCase()}`}
                ></div>
                <h4 className="monitor-pool__category-title">
                  {category} ({caddies.length})
                </h4>
              </div>

              <div className="monitor-pool__caddie-list">
                {caddies.map((c, idx) => (
                  <div key={c.id} className="monitor-pool__caddie-card">
                    <div className="monitor-pool__caddie-number">{c.number}</div>
                    <div className="monitor-pool__caddie-info">
                      <p className="monitor-pool__caddie-name">{c.name}</p>
                      <div className="monitor-pool__caddie-meta">
                        <div className="monitor-pool__caddie-location">
                          <MapPin size={8} /> {c.location}
                        </div>
                        {c.isSkippedNextWeek && (
                          <div className="monitor-pool__priority-badge">Priority</div>
                        )}
                      </div>
                    </div>
                    <div className="monitor-pool__caddie-rank">#{idx + 1}</div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  )
}

export default MonitorPool
