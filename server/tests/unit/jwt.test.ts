import { describe, it, expect, beforeEach } from 'vitest'
import { jwtUtils } from '../../src/utils/jwt'

describe('JWT Utils', () => {
  const testPayload = {
    userId: 'test-user-id',
    email: 'test@example.com',
    role: 'admin',
  }

  it('should generate a valid JWT token', () => {
    const token = jwtUtils.generateToken(testPayload)
    expect(token).toBeTruthy()
    expect(typeof token).toBe('string')
    expect(token.split('.')).toHaveLength(3)
  })

  it('should verify a valid token', () => {
    const token = jwtUtils.generateToken(testPayload)
    const decoded = jwtUtils.verifyToken(token)
    
    expect(decoded).toBeTruthy()
    expect(decoded?.userId).toBe(testPayload.userId)
    expect(decoded?.email).toBe(testPayload.email)
    expect(decoded?.role).toBe(testPayload.role)
  })

  it('should return null for invalid token', () => {
    const decoded = jwtUtils.verifyToken('invalid.token.here')
    expect(decoded).toBeNull()
  })

  it('should generate a refresh token', () => {
    const refreshToken = jwtUtils.generateRefreshToken(testPayload)
    expect(refreshToken).toBeTruthy()
    expect(typeof refreshToken).toBe('string')
  })

  it('should decode token without verification', () => {
    const token = jwtUtils.generateToken(testPayload)
    const decoded = jwtUtils.decodeToken(token)
    
    expect(decoded).toBeTruthy()
    expect(decoded?.userId).toBe(testPayload.userId)
  })
})
