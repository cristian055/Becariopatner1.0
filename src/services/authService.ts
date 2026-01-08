/**
 * Authentication Service
 * Handles login, logout, and token management
 */

import { request, ApiError } from './apiClient'

interface LoginCredentials {
  email: string
  password: string
}

interface AuthResponse {
  token: string
  user: {
    id: string
    email: string
    role: 'admin' | 'operator'
    location: 'Llanogrande' | 'Medellín'
  }
}

interface AuthUser {
  id: string
  email: string
  role: 'admin' | 'operator'
  location: 'Llanogrande' | 'Medellín'
}

/**
 * Login with email and password
 */
async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  const response = await request<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  })

  // Store token in localStorage
  localStorage.setItem('token', response.token)
  localStorage.setItem('user', JSON.stringify(response.user))

  return response
}

/**
 * Logout and clear stored credentials
 */
function logout(): void {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}

/**
 * Get stored token
 */
function getToken(): string | null {
  return localStorage.getItem('token')
}

/**
 * Get stored user
 */
function getUser(): AuthUser | null {
  const userStr = localStorage.getItem('user')
  return userStr ? (JSON.parse(userStr) as AuthUser) : null
}

/**
 * Check if user is authenticated
 */
function isAuthenticated(): boolean {
  return !!getToken()
}

/**
 * Check if user has admin role
 */
function isAdmin(): boolean {
  const user = getUser()
  return user?.role === 'admin'
}

/**
 * Get user location
 */
function getUserLocation(): 'Llanogrande' | 'Medellín' | null {
  const user = getUser()
  return user?.location || null
}

export {
  login,
  logout,
  getToken,
  getUser,
  isAuthenticated,
  isAdmin,
  getUserLocation,
}
export type { LoginCredentials, AuthResponse, AuthUser }
