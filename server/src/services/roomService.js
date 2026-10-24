import { Room } from '../models/Room.js'
import { RoomMember } from '../models/RoomMember.js'
import { AppError } from '../utils/AppError.js'
import { generateRoomCode } from '../utils/roomCode.js'

const MAX_CODE_ATTEMPTS = 8
const MAX_NAME_LENGTH = 80

function toPublicRoom(room, { includeSavedCode = false } = {}) {
  const publicRoom = {
    id: room.id,
    name: room.name,
    code: room.code,
    ownerId: String(room.ownerId),
    createdAt: room.createdAt,
  }
  if (includeSavedCode) {
    publicRoom.savedCode = room.savedCode ?? ''
  }
  return publicRoom
}

async function createUniqueCode() {
  for (let attempt = 0; attempt < MAX_CODE_ATTEMPTS; attempt += 1) {
    const code = generateRoomCode()
    const existing = await Room.exists({ code })
    if (!existing) return code
  }
  throw new AppError('Could not generate a unique room code. Try again.', 500)
}

export async function createRoom({ userId, name }) {
  const cleanName = name.trim()
  if (!cleanName) {
    throw new AppError('Room name is required.', 400)
  }
  if (cleanName.length > MAX_NAME_LENGTH) {
    throw new AppError(
      `Room name must be at most ${MAX_NAME_LENGTH} characters.`,
      400,
    )
  }

  const code = await createUniqueCode()

  try {
    const room = await Room.create({
      name: cleanName,
      code,
      ownerId: userId,
      savedCode: '',
    })

    await RoomMember.create({
      roomId: room.id,
      userId,
      joinedAt: new Date(),
    })

    return toPublicRoom(room)
  } catch (error) {
    if (error?.code === 11000) {
      throw new AppError('Could not create room. Try again.', 409)
    }
    throw error
  }
}

export async function listRoomsForUser(userId) {
  const memberships = await RoomMember.find({ userId })
    .sort({ joinedAt: -1 })
    .populate('roomId')

  return memberships
    .filter((membership) => membership.roomId)
    .map((membership) => toPublicRoom(membership.roomId))
}

export async function getRoomByCode({ userId, code }) {
  const cleanCode = code.trim().toUpperCase()
  if (!cleanCode) {
    throw new AppError('Room code is required.', 400)
  }

  const room = await Room.findOne({ code: cleanCode })
  if (!room) {
    throw new AppError('Room not found. Check the code and try again.', 404)
  }

  // Upsert membership and bump joinedAt so the room rises in "recent"
  await RoomMember.findOneAndUpdate(
    { roomId: room.id, userId },
    { $set: { joinedAt: new Date() } },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  )

  return toPublicRoom(room, { includeSavedCode: true })
}
