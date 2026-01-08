import React from 'react'
import { CalendarDays, Trash2, AlertTriangle, CheckCircle2 } from 'lucide-react'
import type { ShiftTimelineProps } from './WeeklyDraw.types'
import './ShiftTimeline.css'

const ShiftTimeline: React.FC<ShiftTimelineProps> = ({
  activeDay,
  dayShifts,
  dayAssignments,
  onRemoveShift,
}) => {
  return (
    <div className="shift-timeline">
      <div className="shift-timeline__header">
        <h3 className="shift-timeline__title">Scheduled Agenda - {activeDay}</h3>
        <span className="shift-timeline__badge">{dayShifts.length} Groups</span>
      </div>

      {dayShifts.length === 0 ? (
        <div className="shift-timeline__empty">
          <CalendarDays size={64} className="shift-timeline__empty-icon" />
          <p className="shift-timeline__empty-text">
            No shifts scheduled for {activeDay}
          </p>
        </div>
      ) : (
        <div className="shift-timeline__list">
          {dayShifts.map((shift, sIdx) => {
            const shiftAssigned = dayAssignments.filter((a) => a.shiftId === shift.id)
            return (
              <div key={shift.id} className="shift-card">
                <div className="shift-card__sidebar">
                  <div className="shift-card__info">
                    <p className="shift-card__label">Shift {sIdx + 1}</p>
                    <p className="shift-card__time">{shift.time}</p>
                  </div>
                  <button
                    onClick={() => onRemoveShift(shift.id)}
                    className="shift-card__delete-btn"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>

                <div className="shift-card__content">
                  <div className="shift-card__requirements">
                    {shift.requirements.map((req) => (
                      <div key={req.category} className="requirement-tag">
                        <div
                          className={`requirement-tag__dot requirement-tag__dot--${req.category.toLowerCase()}`}
                        ></div>
                        <span className="requirement-tag__text">
                          {req.count} <span className="requirement-tag__cat">{req.category}</span>
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="shift-card__grid">
                    {shiftAssigned.length === 0 ? (
                      <div className="shift-card__pending">
                        <AlertTriangle size={24} className="shift-card__pending-icon" />
                        <span className="shift-card__pending-text">
                          Pending Automated Draw
                        </span>
                      </div>
                    ) : (
                      shiftAssigned.map((a) => (
                        <div key={a.caddieId} className="assigned-caddie-card">
                          <div className="assigned-caddie-card__number">
                            {a.caddieNumber}
                          </div>
                          <div className="assigned-caddie-card__info">
                            <p className="assigned-caddie-card__name">{a.caddieName}</p>
                            <div className="assigned-caddie-card__status">
                              <span className="assigned-caddie-card__cat">{a.category}</span>
                              <CheckCircle2 size={12} className="assigned-caddie-card__icon" />
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default ShiftTimeline
