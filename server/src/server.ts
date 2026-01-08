import express from 'express'
import cors from 'cors'
import { createServer } from 'http'
import { Server } from 'socket.io'
import config from './config/env'
import routes from './routes'
import { errorHandler, notFoundHandler } from './middleware/errorHandler'
import { logger } from './utils/logger'
import { caddieService } from './services/caddieService'

const app = express()
const httpServer = createServer(app)

// Socket.IO setup
const io = new Server(httpServer, {
  cors: {
    origin: config.cors.allowedOrigins,
    credentials: true,
  },
  pingInterval: config.websocket.pingInterval,
  pingTimeout: config.websocket.pingTimeout,
})

// Middleware
app.use(cors({
  origin: config.cors.allowedOrigins,
  credentials: true,
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    query: req.query,
    ip: req.ip,
  })
  next()
})

// API routes
app.use('/api', routes)

// Error handling
app.use(notFoundHandler)
app.use(errorHandler)

// Socket.IO connection handling
io.on('connection', (socket) => {
  logger.info('Client connected', { socketId: socket.id })

  socket.on('disconnect', () => {
    logger.info('Client disconnected', { socketId: socket.id })
  })

  // Echo test event
  socket.on('ping', () => {
    socket.emit('pong', { timestamp: new Date().toISOString() })
  })
})

// Initialize data and start server
async function startServer() {
  try {
    // Initialize caddie data
    await caddieService.initializeData()
    logger.info('Data initialized successfully')

    // Start server
    httpServer.listen(config.port, () => {
      logger.info(`Server running on port ${config.port}`)
      logger.info(`Environment: ${config.nodeEnv}`)
      logger.info(`WebSocket enabled`)
      logger.info(`CORS origins: ${config.cors.allowedOrigins.join(', ')}`)
    })
  } catch (error) {
    logger.error('Failed to start server', error)
    process.exit(1)
  }
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception', error)
  process.exit(1)
})

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled rejection', reason)
  process.exit(1)
})

// Start the server
startServer()

export { io }
