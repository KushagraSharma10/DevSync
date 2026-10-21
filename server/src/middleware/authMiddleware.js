import { AppError } from '../utils/AppError.js'
import { verifyToken } from '../utils/token.js'

export function requireAuth(req, _res, next) {
  try {
    const header = req.headers.authorization
    if (!header || !header.startsWith('Bearer ')) {
      throw new AppError('Authentication required.', 401)
    }

    const token = header.slice('Bearer '.length).trim()
    if (!token) {
      throw new AppError('Authentication required.', 401)
    }

    const { userId } = verifyToken(token)
    req.userId = userId
    next()
  } catch (error) {
    if (error instanceof AppError) {
      next(error)
      return
    }
    next(new AppError('Invalid or expired token.', 401))
  }
}
