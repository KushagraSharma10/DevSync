import * as Y from 'yjs'
import { Room } from '../models/Room.js'

const MAX_CONTENT_LENGTH = 200_000
const PERSIST_DELAY_MS = 1500
const YTEXT_KEY = 'monaco'

/** roomCode → { doc: Y.Doc, ytext: Y.Text } */
const docs = new Map()
/** roomCode → pending persist timer */
const persistTimers = new Map()

function toUint8(data) {
  if (data instanceof Uint8Array) return data
  if (data instanceof ArrayBuffer) return new Uint8Array(data)
  if (Buffer.isBuffer(data)) return new Uint8Array(data)
  if (Array.isArray(data)) return new Uint8Array(data)
  return null
}

export function u8ToB64(u8) {
  return Buffer.from(u8).toString('base64')
}

export function b64ToU8(b64) {
  if (typeof b64 !== 'string' || !b64) return null
  return new Uint8Array(Buffer.from(b64, 'base64'))
}

/** Seed a Y.Doc from legacy plain-text savedCode (or empty). */
export function ensureDoc(roomCode, savedCode = '') {
  if (!docs.has(roomCode)) {
    const doc = new Y.Doc()
    const ytext = doc.getText(YTEXT_KEY)
    if (typeof savedCode === 'string' && savedCode.length > 0) {
      doc.transact(() => {
        ytext.insert(0, savedCode)
      }, 'load')
    }
    docs.set(roomCode, { doc, ytext })
  }
  return docs.get(roomCode)
}

export function getDoc(roomCode) {
  return docs.get(roomCode) ?? null
}

export function getText(roomCode) {
  const entry = docs.get(roomCode)
  return entry ? entry.ytext.toString() : null
}

export function encodeFullState(roomCode) {
  const entry = docs.get(roomCode)
  if (!entry) return null
  return Y.encodeStateAsUpdate(entry.doc)
}

/**
 * Sync step: return updates the client is missing, plus our state vector
 * so the client can send us what we are missing.
 */
export function syncStep(roomCode, clientStateVectorB64) {
  const entry = docs.get(roomCode)
  if (!entry) return { ok: false, error: 'no_doc' }

  const clientSV = b64ToU8(clientStateVectorB64) ?? new Uint8Array()
  const update = Y.encodeStateAsUpdate(entry.doc, clientSV)
  const stateVector = Y.encodeStateVector(entry.doc)
  return {
    ok: true,
    update: u8ToB64(update),
    stateVector: u8ToB64(stateVector),
  }
}

/**
 * Apply a client update and return whether peers should receive it.
 */
export function applyClientUpdate(roomCode, updateB64OrU8) {
  const entry = docs.get(roomCode)
  if (!entry) return { ok: false, error: 'no_doc' }

  const update =
    typeof updateB64OrU8 === 'string'
      ? b64ToU8(updateB64OrU8)
      : toUint8(updateB64OrU8)

  if (!update || update.byteLength === 0) {
    return { ok: false, error: 'invalid' }
  }

  Y.applyUpdate(entry.doc, update, 'client')

  if (entry.ytext.length > MAX_CONTENT_LENGTH) {
    console.warn('yjs room exceeded max length:', roomCode, entry.ytext.length)
  }

  return { ok: true, update: u8ToB64(update) }
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

/** Persist plain text so REST /api/rooms/:code.savedCode stays readable. */
export async function flushPersist(roomCode) {
  const existing = persistTimers.get(roomCode)
  if (existing) {
    clearTimeout(existing)
    persistTimers.delete(roomCode)
  }

  const text = getText(roomCode)
  if (text === null) return

  try {
    await Room.updateOne({ code: roomCode }, { $set: { savedCode: text } })
  } catch (error) {
    console.error('savedCode persist failed:', roomCode, error)
  }
}

export { MAX_CONTENT_LENGTH, YTEXT_KEY }
