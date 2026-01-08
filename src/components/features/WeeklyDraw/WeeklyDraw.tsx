import React, { useState, useMemo, useCallback } from 'react'
import type { WeeklyDrawProps } from './WeeklyDraw.types'
import type { WeeklyShift, WeeklyShiftRequirement } from '../../../types'
import { useCaddieStore, useScheduleStore } from '../../../stores'
import DaySelector from './DaySelector'
import AvailableCaddiesSidebar from './AvailableCaddiesSidebar'
import ShiftConfigurator from './ShiftConfigurator'
import ShiftTimeline from './ShiftTimeline'
import './WeeklyDraw.css'

const WeeklyDraw: React.FC<WeeklyDrawProps> = () => {
  const { caddies, updateCaddie } = useCaddieStore()
  const { shifts, assignments, addShift, removeShift, generateWeeklyDraw } = useScheduleStore()

  const handleGenerate = useCallback((day: string) => {
    generateWeeklyDraw(day, caddies)
  }, [caddies, generateWeeklyDraw])

  const [activeDay, setActiveDay] = useState('Friday')
  const [activeCategoryTab, setActiveCategoryTab] = useState<'Primera' | 'Segunda' | 'Tercera'>(
    'Primera'
  )
  const [newTime, setNewTime] = useState('08:00')
  const [counts, setCounts] = useState({ Primera: 1, Segunda: 0, Tercera: 0 })

  const dayShifts = useMemo(() => shifts.filter((s) => s.day === activeDay), [shifts, activeDay])
  const dayAssignments = useMemo(
    () => assignments.filter((a) => dayShifts.some((s) => s.id === a.shiftId)),
    [assignments, dayShifts]
  )

  const groupedAvailable = useMemo(() => {
    const available = caddies.filter((c) => {
      if (!c.isActive) return false
      const dayAvail = c.availability.find((a) => a.day === activeDay)
      const isAssigned = dayAssignments.some((a) => a.caddieId === c.id)
      return dayAvail?.isAvailable && !isAssigned
    })

    return {
      Primera: available
        .filter((c) => c.category === 'Primera')
        .sort((a, b) => {
          if (a.isSkippedNextWeek !== b.isSkippedNextWeek) return a.isSkippedNextWeek ? -1 : 1
          return a.weekendPriority - b.weekendPriority
        }),
      Segunda: available
        .filter((c) => c.category === 'Segunda')
        .sort((a, b) => {
          if (a.isSkippedNextWeek !== b.isSkippedNextWeek) return a.isSkippedNextWeek ? -1 : 1
          return a.weekendPriority - b.weekendPriority
        }),
      Tercera: available
        .filter((c) => c.category === 'Tercera')
        .sort((a, b) => {
          if (a.isSkippedNextWeek !== b.isSkippedNextWeek) return a.isSkippedNextWeek ? -1 : 1
          return a.weekendPriority - b.weekendPriority
        }),
    }
  }, [caddies, activeDay, dayAssignments])

  const availableCounts = useMemo(
    () => ({
      Primera: groupedAvailable.Primera.length,
      Segunda: groupedAvailable.Segunda.length,
      Tercera: groupedAvailable.Tercera.length,
    }),
    [groupedAvailable]
  )

  const totalAvailable = useMemo(
    () => availableCounts.Primera + availableCounts.Segunda + availableCounts.Tercera,
    [availableCounts]
  )

  const handleAddShift = useCallback(() => {
    const requirements: WeeklyShiftRequirement[] = [
      { category: 'Primera' as const, count: counts.Primera },
      { category: 'Segunda' as const, count: counts.Segunda },
      { category: 'Tercera' as const, count: counts.Tercera },
    ].filter((r) => r.count > 0)

    const shift: WeeklyShift = {
      id: Math.random().toString(36).substring(2, 9),
      day: activeDay,
      time: newTime,
      requirements,
    }
    addShift(shift)
    setCounts({ Primera: 0, Segunda: 0, Tercera: 0 })
  }, [activeDay, newTime, counts, addShift])

  const handleCountChange = useCallback((category: string, value: number) => {
    setCounts((prev) => ({
      ...prev,
      [category]: value,
    }))
  }, [])

  return (
    <div className="weekly-draw">
      <DaySelector
        activeDay={activeDay}
        onDayChange={setActiveDay}
        totalAvailable={totalAvailable}
        onGenerate={handleGenerate}
        isGenerateDisabled={dayShifts.length === 0}
      />

      <div className="weekly-draw__layout">
        <aside className="weekly-draw__sidebar">
          <AvailableCaddiesSidebar
            activeDay={activeDay}
            availableCaddies={groupedAvailable}
            activeCategoryTab={activeCategoryTab}
            onCategoryTabChange={setActiveCategoryTab}
          />
        </aside>

        <main className="weekly-draw__content">
          <ShiftConfigurator
            newTime={newTime}
            onTimeChange={setNewTime}
            counts={counts}
            onCountChange={handleCountChange}
            availableCounts={availableCounts}
            onAddShift={handleAddShift}
          />

          <ShiftTimeline
            activeDay={activeDay}
            dayShifts={dayShifts}
            dayAssignments={dayAssignments}
            onRemoveShift={removeShift}
          />
        </main>
      </div>
    </div>
  )
}

export default WeeklyDraw
