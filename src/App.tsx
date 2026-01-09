import React, { useState, useEffect } from 'react'
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import MonitorPage from './pages/MonitorPage'
import LoginPage from './pages/LoginPage'
import AdminPage from './pages/AdminPage'
import { ProtectedRoute } from './routes/ProtectedRoute'
import { useCaddieStore, useScheduleStore, usePublicStore } from './stores'
import { isAuthenticated, logout, getUserLocation } from './services/authService'
import { socketService } from './services/socketService'
import type { DispatchCaddie } from './stores/publicStore'
import type { PublicCaddie } from './services/publicApiService'

const App: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState(false)
  const { fetchCaddies } = useCaddieStore()
  const { fetchShifts, fetchAssignments } = useScheduleStore()
  const { fetchPublicQueue, handleCaddieDispatched, handleQueueUpdated, handleCaddieStatusChanged } = usePublicStore()

  // Initialize app on mount
  useEffect(() => {
    // Check authentication status
    const authenticated = isAuthenticated()
    setIsAdmin(authenticated)

    // Fetch data based on authentication status
    if (authenticated) {
      // Admin: Use authenticated API endpoints
      fetchCaddies()
      fetchShifts()
      fetchAssignments()
    } else {
      // Public: Use public API endpoints (no auth required)
      fetchPublicQueue()
    }

    // Connect to Socket.IO
    // For public connections: uses default location and subscribes to all lists
    // For admin connections: uses user location and authenticates with token
    const userLocation = getUserLocation()
    const defaultLocation = import.meta.env.VITE_MONITOR_LOCATION || 'Llanogrande'

    socketService.connect({
      isAdmin: authenticated,
      location: userLocation || defaultLocation,
      listNumbers: [1, 2, 3], // Subscribe to all lists
    })

    // Setup WebSocket event listeners for real-time updates
    const unsubscribeDispatched = socketService.onCaddieDispatched((data): void => {
      handleCaddieDispatched(data as { ids: string[]; caddies: DispatchCaddie[]; timestamp: number })
    })

    const unsubscribeStatusChanged = socketService.onCaddieStatusChanged((data): void => {
      // Handle nested data structure from backend
      // Backend sends: { event, data: { caddieId, name, number, category, newStatus, ... }, timestamp }
      const eventData = (data as { data?: unknown }).data || data
      handleCaddieStatusChanged(eventData as { 
        caddieId: string
        newStatus: string
        name?: string
        number?: number
        category?: 'Primera' | 'Segunda' | 'Tercera'
        previousStatus?: string
        caddie?: DispatchCaddie 
      })
    })

    const unsubscribeQueueUpdated = socketService.onQueueUpdated((data): void => {
      handleQueueUpdated(data as { category: 'Primera' | 'Segunda' | 'Tercera'; queue: PublicCaddie[] })
    })

    // Cleanup on unmount
    return () => {
      unsubscribeDispatched()
      unsubscribeStatusChanged()
      unsubscribeQueueUpdated()
      socketService.disconnect()
    }
  }, [])

  const handleLogin = (): void => {
    setIsAdmin(true)
    // Fetch authenticated data after login
    fetchCaddies()
    fetchShifts()
    fetchAssignments()

    // Reconnect socket as admin
    const userLocation = getUserLocation()
    if (userLocation) {
      socketService.disconnect()
      socketService.connect({
        isAdmin: true,
        location: userLocation,
        listNumbers: [1, 2, 3],
      })
    }
  }

  const handleLogout = (): void => {
    setIsAdmin(false)
    logout()
    socketService.disconnect()

    // Reconnect as public user and fetch public data
    const defaultLocation = import.meta.env.VITE_MONITOR_LOCATION || 'Llanogrande'
    socketService.connect({
      isAdmin: false,
      location: defaultLocation,
      listNumbers: [1, 2, 3],
    })
    fetchPublicQueue()
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
