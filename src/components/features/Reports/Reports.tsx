import React, { useState, useMemo, useCallback, useEffect } from 'react'
import type { ReportsProps } from './Reports.types'
import ReportsHeader from './ReportsHeader'
import StatsGrid from './StatsGrid'
import ConfirmationModal from './ConfirmationModal'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { TrendingUp } from 'lucide-react'
import { useCaddieStore, useScheduleStore } from '../../../stores'
import { attendanceApiService } from '../../../services/attendanceApiService'
import { socketService } from '../../../services/socketService'
import type { DailyAttendance } from '../../../types'
import './Reports.css'

const Reports: React.FC<ReportsProps> = () => {
  const { caddies } = useCaddieStore()
  const { resetSchedule } = useScheduleStore()
  const [showConfirmReset, setShowConfirmReset] = useState(false)
  const [dailyAttendance, setDailyAttendance] = useState<DailyAttendance[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    attendanceApiService.getDailyAttendance(today)
      .then(data => {
        setDailyAttendance(data)
        setLoading(false)
      })
      .catch(error => {
        console.error('Failed to fetch daily attendance:', error)
        setLoading(false)
      })

    const unsubscribe = socketService.onDailyAttendanceUpdated((data) => {
      const today = new Date().toISOString().split('T')[0]
      if (data.date.startsWith(today)) {
        setDailyAttendance(prev => {
          const index = prev.findIndex(a => a.id === data.id)
          if (index !== -1) {
            const updated = [...prev]
            updated[index] = {
              ...prev[index],
              ...data
            }
            return updated
          }
          return [...prev, data as DailyAttendance]
        })
      }
    })

    return unsubscribe
  }, [])

  const onReset = useCallback(() => {
    // Reset global state
    // In a real app, this might also reset caddie stats for the day
    resetSchedule()
  }, [resetSchedule])

  const stats = useMemo(() => {
    const todayStats = {
      worked: dailyAttendance.filter(a => a.status === 'PRESENT' || a.status === 'LATE').length,
      absent: dailyAttendance.filter(a => a.status === 'ABSENT').length,
      onLeave: dailyAttendance.filter(a => a.status === 'ON_LEAVE').length,
      late: dailyAttendance.filter(a => a.status === 'LATE').length,
    }
    return {
      totalServices: caddies.reduce((acc, c) => acc + (c.historyCount || 0), 0),
      ...todayStats
    }
  }, [dailyAttendance, caddies])

  const handleDownloadReport = useCallback(() => {
    const headers = [
      'Number',
      'Name',
      'Category',
      'Current Status',
      'Today Services',
      'Absences',
      'Leaves',
      'Delays',
    ]
    const rows = caddies.map((c) => [
      c.number,
      c.name,
      c.category || 'N/A',
      c.status,
      c.historyCount,
      c.absencesCount,
      c.leaveCount,
      c.lateCount,
    ])

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute(
      'download',
      `CaddiePro_Report_${new Date().toLocaleDateString().replace(/\//g, '-')}.csv`
    )
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [caddies])

  const handleCloseDay = useCallback(async () => {
    handleDownloadReport()
    const today = new Date().toISOString().split('T')[0]
    try {
      await attendanceApiService.closeDay(today)
    } catch (error) {
      console.error('Failed to close day:', error)
    }
    if (onReset) onReset()
    setShowConfirmReset(false)
  }, [handleDownloadReport, onReset])

  const serviceData = useMemo(
    () => [
      { hour: '07:00', services: 12 },
      { hour: '08:00', services: 25 },
      {
        hour: '09:00',
        services: stats.totalServices > 50 ? stats.totalServices - 10 : stats.totalServices,
      },
      { hour: '10:00', services: stats.totalServices },
    ],
    [stats.totalServices]
  )

  const topIncidents = useMemo(
    () =>
      [...caddies]
        .filter(
          (c) => (c.absencesCount || 0) > 0 || (c.leaveCount || 0) > 0 || (c.lateCount || 0) > 0
        )
        .sort(
          (a, b) =>
            b.absencesCount +
            b.leaveCount +
            b.lateCount -
            (a.absencesCount + a.leaveCount + a.lateCount)
        )
        .slice(0, 8),
    [caddies]
  )

  return (
    <div className="reports">
      <ReportsHeader
        onDownload={handleDownloadReport}
        onOpenReset={() => setShowConfirmReset(true)}
      />

      {showConfirmReset && (
        <ConfirmationModal onConfirm={handleCloseDay} onCancel={() => setShowConfirmReset(false)} />
      )}

      <StatsGrid
        totalServices={stats.totalServices}
        worked={stats.worked}
        absent={stats.absent}
        onLeave={stats.onLeave}
        late={stats.late}
      />

      <div className="reports__charts">
        <div className="reports__chart-card">
          <h3 className="reports__chart-title">Services Projection</h3>
          <div className="reports__chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={serviceData}>
                <defs>
                  <linearGradient id="colorServices" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#739c8f" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#739c8f" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="hour"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#8ca99e', fontSize: 10, fontWeight: 700 }}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#8ca99e', fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '20px',
                    border: 'none',
                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="services"
                  stroke="#739c8f"
                  fillOpacity={1}
                  fill="url(#colorServices)"
                  strokeWidth={4}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="reports__chart-card">
          <h3 className="reports__chart-title">Incidents Detail</h3>
          <div className="reports__incidents-list">
            {topIncidents.map((caddie) => (
              <div key={caddie.id} className="reports__incident-item">
                <div className="reports__incident-info">
                  <div className="reports__caddie-number">{caddie.number}</div>
                  <div>
                    <p className="reports__caddie-name">{caddie.name}</p>
                    <div className="reports__incident-badges">
                      {caddie.absencesCount > 0 && (
                        <span className="reports__badge reports__badge--absent">Absent</span>
                      )}
                      {caddie.lateCount > 0 && (
                        <span className="reports__badge reports__badge--late">Late</span>
                      )}
                      {caddie.leaveCount > 0 && (
                        <span className="reports__badge reports__badge--leave">Leave</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="reports__incident-total">
                  <p className="reports__total-value">
                    {caddie.absencesCount + caddie.leaveCount + caddie.lateCount}
                  </p>
                  <p className="reports__total-label">Total</p>
                </div>
              </div>
            ))}
            {topIncidents.length === 0 && (
              <div className="reports__empty-state">
                <TrendingUp size={48} className="reports__empty-icon" />
                <p className="reports__empty-text">No incidents recorded today</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Reports
