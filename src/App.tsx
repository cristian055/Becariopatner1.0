import React, { useState, useEffect } from 'react'
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import MonitorPage from './pages/MonitorPage'
import LoginPage from './pages/LoginPage'
import AdminPage from './pages/AdminPage'
import { ProtectedRoute } from './routes/ProtectedRoute'
import { useCaddieStore } from './stores'
import { isAuthenticated, logout, getUserLocation } from './services/authService'
import { webSocketService } from './services/webSocketService'

const App: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState(false)
  const { fetchCaddies } = useCaddieStore()

  // Initialize app on mount
  useEffect(() => {
    // Check authentication status
    const authenticated = isAuthenticated()
    setIsAdmin(authenticated)

    // Fetch initial data if authenticated
    if (authenticated) {
      fetchCaddies()
    }

    // Connect to WebSocket
    const location = getUserLocation()
    if (location) {
      webSocketService.connect(authenticated)
    }

    // Cleanup on unmount
    return () => {
      webSocketService.disconnect()
    }
  }, [])

  const handleLogin = (): void => {
    setIsAdmin(true)
    // Fetch data after login
    fetchCaddies()
  }

  const handleLogout = (): void => {
    setIsAdmin(false)
    logout()
    webSocketService.disconnect()
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
