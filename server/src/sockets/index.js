import { User } from '../models/User.js'
import { Room } from '../models/Room.js'
import { verifyToken } from '../utils/token.js'
import {
  ensureCode,
  flushPersist,
  getCode,
  schedulePersist,
  setCode,
} from './codeStore.js'
import {
  addMember,
  listParticipants,
  removeMember,
  removeSocketFromAll,
} from './presenceStore.js'

function readCode(payload) {
  if (!payload || typeof payload.code !== 'string') return ''
  return payload.code.trim().toUpperCase()
}

function broadcastPresence(io, roomCode) {
  io.to(roomCode).emit('presence:update', {
    participants: listParticipants(roomCode),
  })
}

/**
 * Attach Socket.IO handlers.
 * Auth: JWT in handshake.auth.token
 * RT1: room:join / leave / presence:update
 * RT2: code:update / code:request_sync / code:sync (+ savedCode debounce persist)
 */
export function registerSockets(io) {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token
      if (typeof token !== 'string' || !token.trim()) {
        next(new Error('Authentication required.'))
        return
      }

      const { userId } = verifyToken(token.trim())
      const user = await User.findById(userId)
      if (!user) {
        next(new Error('User not found.'))
        return
      }

      socket.data.userId = user.id
      socket.data.userName = user.name
      next()
    } catch {
      next(new Error('Invalid or expired token.'))
    }
  })

  io.on('connection', (socket) => {
    socket.on('room:join', async (payload, ack) => {
      const reply = typeof ack === 'function' ? ack : () => {}

      try {
        const code = readCode(payload)
        if (!code) {
          reply({ ok: false, message: 'Room code is required.' })
          return
        }

        const room = await Room.findOne({ code })
        if (!room) {
          reply({
            ok: false,
            message: 'Room not found. Check the code and try again.',
          })
          return
        }

        await socket.join(code)
        addMember(code, socket.id, {
          userId: socket.data.userId,
          name: socket.data.userName,
        })
        socket.data.roomCode = code

        // Live snapshot: memory first, else seed from Mongo savedCode
        const content = ensureCode(code, room.savedCode)

        broadcastPresence(io, code)
        reply({
          ok: true,
          participants: listParticipants(code),
          content,
        })
      } catch (error) {
        console.error('room:join failed:', error)
        reply({ ok: false, message: 'Unable to join room.' })
      }
    })

    socket.on('room:leave', (payload, ack) => {
      const reply = typeof ack === 'function' ? ack : () => {}
      const code = readCode(payload) || socket.data.roomCode
      if (!code) {
        reply({ ok: true })
        return
      }

      socket.leave(code)
      removeMember(code, socket.id)
      if (socket.data.roomCode === code) {
        socket.data.roomCode = undefined
      }
      broadcastPresence(io, code)
      void flushPersist(code)
      reply({ ok: true })
    })

    // Last-Write-Wins: latest content overwrites; relay to everyone else in the room
    socket.on('code:update', (payload) => {
      const roomCode = socket.data.roomCode
      if (!roomCode) return

      const next = setCode(roomCode, payload?.content)
      if (next === null) return

      socket.to(roomCode).emit('code:update', { content: next })
      schedulePersist(roomCode)
    })

    // Late joiner / reconnect: ask server for full snapshot
    socket.on('code:request_sync', (payload, ack) => {
      const reply = typeof ack === 'function' ? ack : () => {}
      const roomCode = readCode(payload) || socket.data.roomCode
      if (!roomCode) {
        reply({ ok: false, message: 'Not in a room.' })
        return
      }

      const content = getCode(roomCode)
      if (content === null) {
        reply({ ok: false, message: 'No code snapshot yet.' })
        return
      }

      reply({ ok: true, content })
      socket.emit('code:sync', { content })
    })

    socket.on('disconnect', () => {
      const leftCodes = removeSocketFromAll(socket.id)
      for (const code of leftCodes) {
        broadcastPresence(io, code)
        void flushPersist(code)
      }
    })
  })
}
