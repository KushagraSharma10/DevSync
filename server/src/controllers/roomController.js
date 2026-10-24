import * as roomService from '../services/roomService.js'
import { AppError } from '../utils/AppError.js'

function readString(value) {
  return typeof value === 'string' ? value : ''
}

export async function create(req, res, next) {
  try {
    if (!req.userId) throw new AppError('Authentication required.', 401)

    const name = readString(req.body?.name)
    const room = await roomService.createRoom({ userId: req.userId, name })
    res.status(201).json({ room })
  } catch (error) {
    next(error)
  }
}

export async function list(req, res, next) {
  try {
    if (!req.userId) throw new AppError('Authentication required.', 401)

    const rooms = await roomService.listRoomsForUser(req.userId)
    res.status(200).json({ rooms })
  } catch (error) {
    next(error)
  }
}

export async function getByCode(req, res, next) {
  try {
    if (!req.userId) throw new AppError('Authentication required.', 401)

    const code = readString(req.params?.code)
    const room = await roomService.getRoomByCode({
      userId: req.userId,
      code,
    })
    res.status(200).json({ room })
  } catch (error) {
    next(error)
  }
}
