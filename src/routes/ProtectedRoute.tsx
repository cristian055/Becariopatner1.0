import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'

interface ProtectedRouteProps {
  children: React.ReactNode
  isAdmin: boolean
}

/**
 * Component to protect admin routes.
 * Redirects to monitor if not authorized.
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, isAdmin }) => {
  const location = useLocation()

  if (!isAdmin) {
    // Redirect to login if trying to access admin area without being logged in
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}
