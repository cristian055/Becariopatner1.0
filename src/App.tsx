import React, { useState } from 'react'
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import MonitorPage from './pages/MonitorPage'
import LoginPage from './pages/LoginPage'
import AdminPage from './pages/AdminPage'
import { ProtectedRoute } from './routes/ProtectedRoute'

const App: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState(false)

  const handleLogin = (): void => {
    setIsAdmin(true)
  }

  const handleLogout = (): void => {
    setIsAdmin(false)
  }

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/monitor/*" element={<MonitorPage />} />
        <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />

        {/* Protected Admin Routes */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute isAdmin={isAdmin}>
              <AdminPage onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />

        {/* Fallback redirects */}
        <Route path="/" element={<Navigate to="/monitor" replace />} />
        <Route path="*" element={<Navigate to="/monitor" replace />} />
      </Routes>
    </Router>
  )
}

export default App
