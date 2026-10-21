import bcrypt from 'bcrypt'
import { User } from '../models/User.js'
import { AppError } from '../utils/AppError.js'
import { signToken } from '../utils/token.js'

const SALT_ROUNDS = 10

function toPublicUser(user) {
  return { id: user.id, name: user.name, email: user.email }
}

export async function registerUser({ name, email, password }) {
  const cleanName = name.trim()
  const cleanEmail = email.trim().toLowerCase()

  const existing = await User.findOne({ email: cleanEmail })
  if (existing) {
    throw new AppError('An account with this email already exists.', 409)
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS)

  try {
    const user = await User.create({
      name: cleanName,
      email: cleanEmail,
      passwordHash,
    })
    return toPublicUser(user)
  } catch (error) {
    // Race: two registers with the same email at the same time
    if (error?.code === 11000) {
      throw new AppError('An account with this email already exists.', 409)
    }
    throw error
  }
}

export async function loginUser({ email, password }) {
  const cleanEmail = email.trim().toLowerCase()

  const user = await User.findOne({ email: cleanEmail }).select('+passwordHash')

  // Same message for "no account" and "wrong password" — never leak which one failed
  if (!user) {
    throw new AppError('Incorrect email or password. Try again.', 401)
  }

  const matches = await bcrypt.compare(password, user.passwordHash)
  if (!matches) {
    throw new AppError('Incorrect email or password. Try again.', 401)
  }

  return { token: signToken(user.id), user: toPublicUser(user) }
}

export async function getCurrentUser(userId) {
  const user = await User.findById(userId)
  if (!user) {
    throw new AppError('User not found.', 404)
  }
  return toPublicUser(user)
}
