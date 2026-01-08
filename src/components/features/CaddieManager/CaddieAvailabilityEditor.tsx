import React from 'react'
import { Check, Clock } from 'lucide-react'
import type { CaddieAvailabilityEditorProps } from './CaddieManager.types'
import type { DayAvailability } from '@/types'
import './CaddieAvailabilityEditor.css'

const CaddieAvailabilityEditor: React.FC<CaddieAvailabilityEditorProps> = ({
  availability,
  onChange
}) => {
  const allDays = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday'
  ]

  return (
    <div className="caddie-availability-editor">
      <div className="caddie-availability-editor__days">
        {allDays.map((day) => {
          const dayAvail = availability.find(a => a.day === day) || {
            day: day as any,
            isAvailable: false
          }

          return (
            <div
              key={day}
              className={`caddie-availability-editor__day ${
                dayAvail.isAvailable
                  ? 'caddie-availability-editor__day--available'
                  : ''
              }`}
            >
              <div className="caddie-availability-editor__day-header">
                <button
                  type="button"
                  onClick={() => {
                    const newAvailability = [...availability]
                    const existingIndex = newAvailability.findIndex(a => a.day === day)

                    if (existingIndex >= 0) {
                      newAvailability[existingIndex] = {
                        ...newAvailability[existingIndex],
                        isAvailable: !newAvailability[existingIndex].isAvailable
                      }
                    } else {
                      newAvailability.push({
                        day: day as any,
                        isAvailable: true,
                        range: { type: 'full' as const }
                      } as DayAvailability)
                    }
                    onChange(newAvailability)
                  }}
                  className="caddie-availability-editor__toggle"
                  aria-label={`Toggle ${day}`}
                  role="checkbox"
                  aria-checked={dayAvail.isAvailable}
                >
                  {dayAvail.isAvailable && <Check size={14} />}
                </button>
                <span
                  className={`caddie-availability-editor__day-label ${
                    dayAvail.isAvailable
                      ? 'caddie-availability-editor__day-label--active'
                      : ''
                  }`}
                >
                  {day}
                </span>
              </div>

              {dayAvail.isAvailable && (
                <div className="caddie-availability-editor__time-selector">
                  <Clock
                    size={12}
                    className="caddie-availability-editor__clock-icon"
                  />
                  <select
                    value={dayAvail.range?.type || 'full'}
                    onChange={e => {
                      const newAvailability = [...availability]
                      const index = newAvailability.findIndex(a => a.day === day)

                      if (index >= 0) {
                        newAvailability[index] = {
                          ...newAvailability[index],
                          range: {
                            ...(newAvailability[index].range || { type: 'full' }),
                            type: e.target.value as any,
                            time: newAvailability[index].range?.time || '08:00 AM'
                          }
                        }
                      }
                      onChange(newAvailability)
                    }}
                    className="caddie-availability-editor__range-select"
                    aria-label={`Time range for ${day}`}
                  >
                    <option value="full">Full day</option>
                    <option value="before">Before</option>
                    <option value="after">From</option>
                  </select>
                </div>
              )}

              {dayAvail.isAvailable && dayAvail.range?.type !== 'full' && (
                <div className="caddie-availability-editor__time-input-wrapper">
                  <label
                    htmlFor={`time-${day}`}
                    className="caddie-availability-editor__time-label"
                  >
                    Adjust Time:
                  </label>
                  <input
                    type="text"
                    id={`time-${day}`}
                    value={dayAvail.range?.time || ''}
                    onChange={e => {
                      const newAvailability = [...availability]
                      const index = newAvailability.findIndex(a => a.day === day)

                      if (index >= 0 && newAvailability[index].range) {
                        newAvailability[index] = {
                          ...newAvailability[index],
                          range: {
                            ...newAvailability[index].range!,
                            time: e.target.value
                          }
                        }
                      }
                      onChange(newAvailability)
                    }}
                    placeholder="Ej: 09:30 AM"
                    className="caddie-availability-editor__time-input"
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default CaddieAvailabilityEditor
