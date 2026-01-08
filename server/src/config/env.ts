import dotenv from 'dotenv'
import path from 'path'

// Load environment variables
dotenv.config()

interface Config {
  port: number
  nodeEnv: string
  jwt: {
    secret: string
    expiresIn: string
    refreshExpiresIn: string
  }
  cors: {
    allowedOrigins: string[]
  }
  websocket: {
    pingInterval: number
    pingTimeout: number
  }
  data: {
    dir: string
  }
  logging: {
    level: string
  }
}

const config: Config = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwt: {
    secret: process.env.JWT_SECRET || 'default_secret_change_in_production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },
  cors: {
    allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  },
  websocket: {
    pingInterval: parseInt(process.env.WS_PING_INTERVAL || '30000', 10),
    pingTimeout: parseInt(process.env.WS_PING_TIMEOUT || '5000', 10),
  },
  data: {
    dir: process.env.DATA_DIR || path.join(__dirname, '../data'),
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
}

export default config
