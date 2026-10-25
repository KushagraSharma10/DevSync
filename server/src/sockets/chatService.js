import { Message } from '../models/Message.js'

const HISTORY_LIMIT = 50
const MAX_TEXT_LENGTH = 1000

function formatTime(date) {
  const hours = date.getHours()
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

export function toPublicMessage(doc, authorName) {
  const createdAt =
    doc.createdAt instanceof Date ? doc.createdAt : new Date(doc.createdAt)
  const rawUser = doc.userId
  const authorId = String(rawUser?._id ?? rawUser?.id ?? rawUser)
  return {
    id: doc.id,
    text: doc.text,
    authorId,
    author: authorName,
    createdAt: createdAt.toISOString(),
    time: formatTime(createdAt),
  }
}

export async function listRecentMessages(roomId) {
  const rows = await Message.find({ roomId })
    .sort({ createdAt: -1 })
    .limit(HISTORY_LIMIT)
    .populate('userId', 'name')

  return rows
    .reverse()
    .map((row) =>
      toPublicMessage(row, row.userId?.name ?? 'Unknown'),
    )
}

export async function createMessage({ roomId, userId, userName, text }) {
  const clean = typeof text === 'string' ? text.trim() : ''
  if (!clean) {
    return { error: 'Message cannot be empty.' }
  }
  if (clean.length > MAX_TEXT_LENGTH) {
    return { error: `Message must be at most ${MAX_TEXT_LENGTH} characters.` }
  }

  const doc = await Message.create({
    roomId,
    userId,
    text: clean,
  })

  return { message: toPublicMessage(doc, userName) }
}

export { MAX_TEXT_LENGTH, HISTORY_LIMIT }
