import React from 'react'
import { CheckCircle2, CalendarX, FileText, Clock } from 'lucide-react'
import type { StatsGridProps } from './Reports.types'
import './StatsGrid.css'

const StatsGrid: React.FC<StatsGridProps> = ({
  totalServices,
  totalAbsences,
  totalLeaves,
  totalLates,
}) => {
  const stats = [
    {
      label: 'Total Starts',
      value: totalServices,
      sublabel: 'Completed Services',
      icon: CheckCircle2,
      color: 'emerald',
    },
    {
      label: 'Absences',
      value: totalAbsences,
      sublabel: 'Caddies "No Show"',
      icon: CalendarX,
      color: 'rose',
    },
    {
      label: 'Leaves',
      value: totalLeaves,
      sublabel: 'Caddies on Leave',
      icon: FileText,
      color: 'sky',
    },
    {
      label: 'Delays',
      value: totalLates,
      sublabel: 'Late Arrivals',
      icon: Clock,
      color: 'amber',
    },
  ]

  return (
    <div className="stats-grid">
      {stats.map((stat) => (
        <div key={stat.label} className="stats-grid__card">
          <div className="stats-grid__card-header">
            <div>
              <p className="stats-grid__label">{stat.label}</p>
              <h3 className={`stats-grid__value stats-grid__value--${stat.color}`}>{stat.value}</h3>
            </div>
            <div className={`stats-grid__icon-box stats-grid__icon-box--${stat.color}`}>
              <stat.icon size={24} />
            </div>
          </div>
          <p className={`stats-grid__sublabel stats-grid__sublabel--${stat.color}`}>
            {stat.sublabel}
          </p>
        </div>
      ))}
    </div>
  )
}

export default StatsGrid
