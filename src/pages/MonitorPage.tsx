import React from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import PublicQueue from '../components/features/PublicQueue/PublicQueue'
import WeeklyMonitor from '../components/features/WeeklyMonitor/WeeklyMonitor'

const MonitorPage: React.FC = () => {
  const navigate = useNavigate()

  return (
    <Routes>
      <Route
        index
        element={
          <PublicQueue
            onBack={() => navigate('/admin')}
          />
        }
      />
      <Route
        path="weekly"
        element={
          <WeeklyMonitor
            onBack={() => navigate('/monitor')}
          />
        }
      />
    </Routes>
  )
}

export default MonitorPage
