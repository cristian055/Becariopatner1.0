import React, { useState, useMemo } from 'react'
import type { WeeklyMonitorProps } from './WeeklyMonitor.types'
import MonitorHeader from './MonitorHeader'
import MonitorAgenda from './MonitorAgenda'
import MonitorPool from './MonitorPool'
import MonitorNavBar from '../../MonitorNavBar'
import { useCaddieStore, useScheduleStore } from '../../../stores'
import './WeeklyMonitor.css'

const WeeklyMonitor: React.FC<WeeklyMonitorProps> = ({ onBack }) => {
  const { caddies } = useCaddieStore()
  const { shifts, assignments } = useScheduleStore()
  const [activeDay, setActiveDay] = useState('Friday')

  const dayShifts = useMemo(
    () =>
      shifts
        .filter((s) => s.day === activeDay)
        .sort((a, b) => a.time.localeCompare(b.time)),
    [shifts, activeDay]
  )

  const dayAssignments = useMemo(
    () => assignments.filter((a) => dayShifts.some((s) => s.id === a.shiftId)),
    [assignments, dayShifts]
  )

  const groupedPool = useMemo(() => {
    const pool = caddies.filter((c) => {
      if (!c.isActive) return false
      const dayAvail = c.availability.find((a) => a.day === activeDay)
      const isAssigned = dayAssignments.some((a) => a.caddieId === c.id)
      return dayAvail?.isAvailable && !isAssigned
    })

    return {
      Primera: pool
        .filter((c) => c.category === 'Primera')
        .sort((a, b) => a.weekendPriority - b.weekendPriority),
      Segunda: pool
        .filter((c) => c.category === 'Segunda')
        .sort((a, b) => a.weekendPriority - b.weekendPriority),
      Tercera: pool
        .filter((c) => c.category === 'Tercera')
        .sort((a, b) => a.weekendPriority - b.weekendPriority),
    }
  }, [caddies, activeDay, dayAssignments])

  return (
    <div className="weekly-monitor">
      <MonitorNavBar onBack={() => onBack?.()} />
      <MonitorHeader
        activeDay={activeDay}
        onDayChange={setActiveDay}
        onBack={() => onBack?.()}
      />

      <main className="weekly-monitor__main">
        <MonitorAgenda
          activeDay={activeDay}
          dayShifts={dayShifts}
          assignments={assignments}
        />
        <MonitorPool groupedPool={groupedPool} />
      </main>

      <footer className="weekly-monitor__footer">
        <div className="weekly-monitor__footer-status">
          <div className="weekly-monitor__status-dot"></div>
          <span className="weekly-monitor__status-text">Real-Time Draw Updates</span>
        </div>
        <div className="weekly-monitor__footer-version">CaddiePro v2.5</div>
      </footer>
    </div>
  )
}

export default WeeklyMonitor
