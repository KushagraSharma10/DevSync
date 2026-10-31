import { Room } from '../models/Room.js'

const MAX_CONTENT_LENGTH = 200_000
const PERSIST_DELAY_MS = 1500

/** roomCode → { content, rev } (live; Mongo catches up via debounce) */
const snapshots = new Map()
/** roomCode → pending persist timer */
const persistTimers = new Map()

export function getSnapshot(roomCode) {
  return snapshots.has(roomCode) ? snapshots.get(roomCode) : null
}

export function getCode(roomCode) {
  const snap = getSnapshot(roomCode)
  return snap ? snap.content : null
}

/** First joiner: seed from DB so refresh/rejoin gets last saved text. */
export function ensureCode(roomCode, savedCode) {
  if (!snapshots.has(roomCode)) {
    snapshots.set(roomCode, {
      content: typeof savedCode === 'string' ? savedCode : '',
      rev: 0,
    })
  }
  return snapshots.get(roomCode)
}

/**
 * Apply a full-document update if `baseRev` matches the room revision.
 * Returns { ok, content, rev } or { ok:false, content, rev, error }.
 */
export function trySetCode(roomCode, content, baseRev) {
  if (typeof content !== 'string') {
    return { ok: false, error: 'invalid' }
  }
  if (content.length > MAX_CONTENT_LENGTH) {
    return { ok: false, error: 'too_large' }
  }

  let current = snapshots.get(roomCode)
  if (!current) {
    current = { content: '', rev: 0 }
    snapshots.set(roomCode, current)
  }

  if (typeof baseRev === 'number' && baseRev !== current.rev) {
    return {
      ok: false,
      content: current.content,
      rev: current.rev,
      error: 'stale',
    }
  }

  const next = { content, rev: current.rev + 1 }
  snapshots.set(roomCode, next)
  return { ok: true, content: next.content, rev: next.rev }
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

  const snap = snapshots.get(roomCode)
  if (!snap) return

  try {
    await Room.updateOne(
      { code: roomCode },
      { $set: { savedCode: snap.content } },
    )
  } catch (error) {
    console.error('savedCode persist failed:', roomCode, error)
  }
}

export { MAX_CONTENT_LENGTH }
