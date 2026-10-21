import * as authService from '../services/authService.js'
import { AppError } from '../utils/AppError.js'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function readString(value) {
  return typeof value === 'string' ? value : ''
}

export async function register(req, res, next) {
  try {
    const name = readString(req.body?.name)
    const email = readString(req.body?.email)
    const password = readString(req.body?.password)

    if (!name.trim()) throw new AppError('Name is required.', 400)
    if (!email.trim()) throw new AppError('Email is required.', 400)
    if (!EMAIL_PATTERN.test(email.trim())) {
      throw new AppError('Enter a valid email address.', 400)
    }
    if (!password) throw new AppError('Password is required.', 400)
    if (password.length < 8) {
      throw new AppError('Password must be at least 8 characters.', 400)
    }

    const user = await authService.registerUser({ name, email, password })
    res.status(201).json({ user })
  } catch (error) {
    next(error)
  }
}
