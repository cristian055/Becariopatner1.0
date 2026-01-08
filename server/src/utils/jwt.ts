import * as jwt from 'jsonwebtoken'
import config from '../config/env'
import { JwtPayload } from '../types'

export class JwtUtils {
  private secret: jwt.Secret
  private expiresIn: string

  constructor() {
    this.secret = config.jwt.secret
    this.expiresIn = config.jwt.expiresIn
  }

  generateToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
    return jwt.sign(payload, this.secret, {
      expiresIn: this.expiresIn as jwt.SignOptions['expiresIn'],
    })
  }

  generateRefreshToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
    return jwt.sign(payload, this.secret, {
      expiresIn: config.jwt.refreshExpiresIn as jwt.SignOptions['expiresIn'],
    })
  }

  verifyToken(token: string): JwtPayload | null {
    try {
      const decoded = jwt.verify(token, this.secret) as JwtPayload
      return decoded
    } catch (error) {
      return null
    }
  }

  decodeToken(token: string): JwtPayload | null {
    try {
      const decoded = jwt.decode(token) as JwtPayload
      return decoded
    } catch (error) {
      return null
    }
  }
}

export const jwtUtils = new JwtUtils()
