import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'

export function signToken(userId) {
  return jwt.sign({ userId }, env.jwtSecret, { expiresIn: '7d' })
}

export function verifyToken(token) {
  const payload = jwt.verify(token, env.jwtSecret)
  if (typeof payload === 'string' || !payload.userId) {
    throw new Error('Invalid token payload')
  }
  return { userId: String(payload.userId) }
}
