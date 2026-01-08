import React from 'react'
import { ChevronLeft } from 'lucide-react'
import type { MonitorHeaderProps } from './WeeklyMonitor.types'
import './MonitorHeader.css'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

const MonitorHeader: React.FC<MonitorHeaderProps> = ({ activeDay, onDayChange, onBack }) => {
  return (
    <header className="monitor-header">
      <div className="monitor-header__container">
        <button
          onClick={onBack}
          className="monitor-header__back-btn"
          title="Back to Today's Queue"
        >
          <ChevronLeft size={24} />
        </button>

        <div className="monitor-header__title-group">
          <h1 className="monitor-header__title">Weekly Draw</h1>
          <p className="monitor-header__subtitle">Llanogrande Branch Schedule</p>
        </div>

        <div className="monitor-header__days">
          {DAYS.map((day) => (
            <button
              key={day}
              onClick={() => onDayChange(day)}
              className={`monitor-header__day-btn ${
                activeDay === day ? 'monitor-header__day-btn--active' : ''
              }`}
            >
              {day}
            </button>
          ))}
        </div>
      </div>
    </header>
  )
}

export default MonitorHeader
