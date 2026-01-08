import { describe, it, expect, beforeAll } from 'vitest'
import request from 'supertest'
import express from 'express'
import cors from 'cors'
import routes from '../../src/routes'
import { errorHandler, notFoundHandler } from '../../src/middleware/errorHandler'

// Create test app
const app = express()
app.use(cors())
app.use(express.json())
app.use('/api', routes)
app.use(notFoundHandler)
app.use(errorHandler)

describe('API Integration Tests', () => {
  let authToken: string

  describe('Health Check', () => {
    it('GET /api/health should return success', async () => {
      const response = await request(app).get('/api/health')

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.message).toBe('CaddiePro API is running')
    })
  })

  describe('Authentication', () => {
    it('POST /api/auth/login should return token for valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@caddiepro.com',
          password: 'any_password',
        })

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data).toHaveProperty('token')
      expect(response.body.data).toHaveProperty('refreshToken')
      expect(response.body.data.user).toHaveProperty('email', 'admin@caddiepro.com')

      authToken = response.body.data.token
    })

    it('POST /api/auth/login should fail with invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'wrong@email.com',
          password: 'wrong_password',
        })

      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
    })

    it('POST /api/auth/verify should verify valid token', async () => {
      const response = await request(app)
        .post('/api/auth/verify')
        .send({ token: authToken })

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data).toHaveProperty('userId')
      expect(response.body.data).toHaveProperty('email')
    })

    it('GET /api/auth/me should return user info with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`)

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data).toHaveProperty('email')
    })

    it('GET /api/auth/me should fail without token', async () => {
      const response = await request(app).get('/api/auth/me')

      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
    })
  })

  describe('Caddies API', () => {
    beforeAll(async () => {
      // Get auth token
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@caddiepro.com',
          password: 'test',
        })
      authToken = loginResponse.body.data.token
    })

    it('GET /api/caddies should require authentication', async () => {
      const response = await request(app).get('/api/caddies')

      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
    })

    it('GET /api/caddies should return caddies with valid token', async () => {
      const response = await request(app)
        .get('/api/caddies')
        .set('Authorization', `Bearer ${authToken}`)

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(Array.isArray(response.body.data)).toBe(true)
      expect(response.body.data.length).toBeGreaterThan(0)
    })

    it('POST /api/caddies should create a new caddie', async () => {
      const newCaddie = {
        name: 'Test Caddie',
        number: 999,
        status: 'AVAILABLE',
        isActive: true,
        listId: null,
        historyCount: 0,
        absencesCount: 0,
        lateCount: 0,
        leaveCount: 0,
        lastActionTime: '08:00 AM',
        category: 'Primera',
        location: 'Llanogrande',
        role: 'Golf',
        weekendPriority: 999,
        availability: [],
      }

      const response = await request(app)
        .post('/api/caddies')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newCaddie)

      expect(response.status).toBe(201)
      expect(response.body.success).toBe(true)
      expect(response.body.data).toHaveProperty('id')
      expect(response.body.data.name).toBe('Test Caddie')
    })
  })

  describe('Not Found', () => {
    it('should return 404 for unknown routes', async () => {
      const response = await request(app).get('/api/unknown')

      expect(response.status).toBe(404)
      expect(response.body.success).toBe(false)
    })
  })
})
