import { User } from '../models/User.js'
import { Room } from '../models/Room.js'
import { verifyToken } from '../utils/token.js'
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
 * Auth: client sends JWT in handshake.auth.token (same token as REST).
 * RT1 events: room:join, room:leave, presence:update (server → client).
 */
export function registerSockets(io) {
  // Runs once per connection attempt — reject before "connection" if bad JWT.
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
          reply({ ok: false, message: 'Room not found. Check the code and try again.' })
          return
        }

        // Socket.IO "room" = broadcast group named by our join code
        await socket.join(code)
        addMember(code, socket.id, {
          userId: socket.data.userId,
          name: socket.data.userName,
        })
        socket.data.roomCode = code

        broadcastPresence(io, code)
        reply({
          ok: true,
          participants: listParticipants(code),
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
      reply({ ok: true })
    })

    socket.on('disconnect', () => {
      const leftCodes = removeSocketFromAll(socket.id)
      for (const code of leftCodes) {
        broadcastPresence(io, code)
      }
    })
  })
}
