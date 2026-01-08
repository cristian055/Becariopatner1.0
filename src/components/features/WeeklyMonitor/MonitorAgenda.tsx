import React from 'react'
import { CalendarDays, AlertTriangle, CheckCircle2 } from 'lucide-react'
import type { MonitorAgendaProps } from './WeeklyMonitor.types'
import './MonitorAgenda.css'

const MonitorAgenda: React.FC<MonitorAgendaProps> = ({ activeDay, dayShifts, assignments }) => {
  return (
    <section className="monitor-agenda">
      <div className="monitor-agenda__header">
        <h2 className="monitor-agenda__title">
          <CalendarDays className="monitor-agenda__title-icon" />
          Tee-Off Schedule - {activeDay}
        </h2>
        <div className="monitor-agenda__stats">
          {dayShifts.length} Scheduled Groups
        </div>
      </div>

      {dayShifts.length === 0 ? (
        <div className="monitor-agenda__empty">
          <CalendarDays size={80} className="monitor-agenda__empty-icon" />
          <p className="monitor-agenda__empty-text">No schedule recorded for this day</p>
        </div>
      ) : (
        <div className="monitor-agenda__list">
          {dayShifts.map((shift, idx) => {
            const shiftAssigned = assignments.filter((a) => a.shiftId === shift.id)
            return (
              <div
                key={shift.id}
                className="monitor-agenda__item"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="monitor-agenda__shift-info">
                  <p className="monitor-agenda__time">{shift.time}</p>
                  <p className="monitor-agenda__label">START {idx + 1}</p>
                </div>

                <div className="monitor-agenda__shift-content">
                  <div className="monitor-agenda__requirements">
                    {shift.requirements.map((req) => (
                      <div key={req.category} className="monitor-agenda__req-badge">
                        <div
                          className={`monitor-agenda__req-dot monitor-agenda__req-dot--${req.category.toLowerCase()}`}
                        ></div>
                        <span className="monitor-agenda__req-text">
                          {req.count} {req.category}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="monitor-agenda__assignments">
                    {shiftAssigned.length === 0 ? (
                      <div className="monitor-agenda__pending">
                        <AlertTriangle size={32} className="monitor-agenda__pending-icon" />
                        <span className="monitor-agenda__pending-text">Draw Pending</span>
                      </div>
                    ) : (
                      shiftAssigned.map((a) => (
                        <div key={a.caddieId} className="monitor-agenda__assignment-card">
                          <div className="monitor-agenda__caddie-number">{a.caddieNumber}</div>
                          <div className="monitor-agenda__caddie-info">
                            <p className="monitor-agenda__caddie-name">{a.caddieName}</p>
                            <div className="monitor-agenda__caddie-meta">
                              <span
                                className={`monitor-agenda__category-badge monitor-agenda__category-badge--${a.category.toLowerCase()}`}
                              >
                                {a.category}
                              </span>
                              <CheckCircle2 size={14} className="monitor-agenda__success-icon" />
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
    </section>
  )
}

export default MonitorAgenda
