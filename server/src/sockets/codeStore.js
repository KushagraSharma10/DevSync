import { Room } from '../models/Room.js'

const MAX_CONTENT_LENGTH = 200_000
const PERSIST_DELAY_MS = 1500

/** roomCode → latest editor text (live; Mongo catches up via debounce) */
const snapshots = new Map()
/** roomCode → pending persist timer */
const persistTimers = new Map()

export function getCode(roomCode) {
  return snapshots.has(roomCode) ? snapshots.get(roomCode) : null
}

/** First joiner: seed from DB so refresh/rejoin gets last saved text. */
export function ensureCode(roomCode, savedCode) {
  if (!snapshots.has(roomCode)) {
    snapshots.set(roomCode, typeof savedCode === 'string' ? savedCode : '')
  }
  return snapshots.get(roomCode)
}

export function setCode(roomCode, content) {
  if (typeof content !== 'string') return null
  if (content.length > MAX_CONTENT_LENGTH) return null
  snapshots.set(roomCode, content)
  return content
}

export function schedulePersist(roomCode) {
  const existing = persistTimers.get(roomCode)
  if (existing) clearTimeout(existing)

  const timer = setTimeout(() => {
    persistTimers.delete(roomCode)
    void flushPersist(roomCode)
  }, PERSIST_DELAY_MS)

  persistTimers.set(roomCode, timer)
}

export async function flushPersist(roomCode) {
  const existing = persistTimers.get(roomCode)
  if (existing) {
    clearTimeout(existing)
    persistTimers.delete(roomCode)
  }

  if (!snapshots.has(roomCode)) return

  try {
    await Room.updateOne(
      { code: roomCode },
      { $set: { savedCode: snapshots.get(roomCode) } },
    )
  } catch (error) {
    console.error('savedCode persist failed:', roomCode, error)
  }
}

export { MAX_CONTENT_LENGTH }
