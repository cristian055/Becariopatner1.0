import React from 'react'
import { Users, Star, Trophy, Users as UsersIcon, MapPin, Activity, Timer, Clock, CalendarDays } from 'lucide-react'
import type { AvailableCaddiesSidebarProps, CategoryInfo } from './WeeklyDraw.types'
import './AvailableCaddiesSidebar.css'

const CATEGORIES: CategoryInfo[] = [
  { id: 'Primera', name: 'First Class', icon: Star, color: 'text-campestre-600', bg: 'bg-campestre-50' },
  { id: 'Segunda', name: 'Second Class', icon: Trophy, color: 'text-amber-600', bg: 'bg-amber-50' },
  { id: 'Tercera', name: 'Third Class', icon: UsersIcon, color: 'text-slate-600', bg: 'bg-slate-50' },
]

const AvailableCaddiesSidebar: React.FC<AvailableCaddiesSidebarProps> = ({
  activeDay,
  availableCaddies,
  activeCategoryTab,
  onCategoryTabChange,
}) => {
  return (
    <div className="available-sidebar">
      <div className="available-sidebar__header">
        <div className="available-sidebar__title-box">
          <Users size={20} className="available-sidebar__title-icon" />
          <h3 className="available-sidebar__title">Availability & Restrictions</h3>
        </div>

        <div className="available-sidebar__tabs">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onCategoryTabChange(cat.id as any)}
              className={`available-sidebar__tab ${
                activeCategoryTab === cat.id ? 'available-sidebar__tab--active' : ''
              }`}
            >
              <cat.icon size={14} className={cat.color} />
              <span className="available-sidebar__tab-label">
                {availableCaddies[cat.id as keyof typeof availableCaddies].length} {cat.id}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="available-sidebar__list">
        {availableCaddies[activeCategoryTab].map((c) => {
          const avail = c.availability.find((a) => a.day === activeDay)
          const hasRestriction = avail?.range && avail.range.type !== 'full'

          return (
            <div
              key={c.id}
              className={`caddie-avail-card ${c.isSkippedNextWeek ? 'caddie-avail-card--priority' : ''}`}
            >
              <div className="caddie-avail-card__main">
                <div className="caddie-avail-card__number-box">
                  {c.number}
                </div>
                <div className="caddie-avail-card__info">
                  <p className="caddie-avail-card__name">{c.name}</p>
                  <div className="caddie-avail-card__tags">
                    <div className="caddie-avail-card__tag">
                      <MapPin size={8} />
                      <span>{c.location}</span>
                    </div>
                    <div className="caddie-avail-card__tag">
                      <Activity size={8} />
                      <span>{c.role}</span>
                    </div>
                  </div>
                </div>
                {c.isSkippedNextWeek && (
                  <div className="caddie-avail-card__priority-icon">
                    <Timer size={16} />
                    <span>Priority</span>
                  </div>
                )}
              </div>

              <div className="caddie-avail-card__footer">
                {hasRestriction && avail.range ? (
                  <div className="caddie-avail-card__status caddie-avail-card__status--restriction">
                    <Clock size={12} />
                    <span>
                      Restriction: {avail.range.type === 'after' ? 'From' : 'Until'}{' '}
                      {avail.range.time}
                    </span>
                  </div>
                ) : (
                  <div className="caddie-avail-card__status caddie-avail-card__status--full">
                    <CalendarDays size={12} />
                    <span>Full Availability</span>
                  </div>
                )}
              </div>
            </div>
          )
        })}

        {availableCaddies[activeCategoryTab].length === 0 && (
          <div className="available-sidebar__empty">
            <div className="available-sidebar__empty-icon">
              <UsersIcon size={32} />
            </div>
            <p className="available-sidebar__empty-text">No personnel in {activeCategoryTab}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default AvailableCaddiesSidebar
