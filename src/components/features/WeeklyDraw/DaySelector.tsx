import React from 'react'
import { Play } from 'lucide-react'
import type { DaySelectorProps } from './WeeklyDraw.types'
import './DaySelector.css'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

const DaySelector: React.FC<DaySelectorProps> = ({
  activeDay,
  onDayChange,
  totalAvailable,
  onGenerate,
  isGenerateDisabled,
}) => {
  return (
    <div className="day-selector">
      <div className="day-selector__tabs">
        {DAYS.map((day) => (
          <button
            key={day}
            onClick={() => onDayChange(day)}
            className={`day-selector__tab ${
              activeDay === day ? 'day-selector__tab--active' : ''
            }`}
          >
            {day}
          </button>
        ))}
      </div>

      <div className="day-selector__actions">
        <div className="day-selector__pool-stats">
          <p className="day-selector__pool-label">Pool {activeDay}</p>
          <p className="day-selector__pool-value">{totalAvailable}</p>
        </div>
        <button
          onClick={() => onGenerate(activeDay)}
          disabled={isGenerateDisabled}
          className="day-selector__generate-btn"
        >
          <Play size={16} fill="currentColor" />
          Generate Draw
        </button>
      </div>
    </div>
  )
}

export default DaySelector
