import { User } from '../models/User.js'
import { Room } from '../models/Room.js'
import { verifyToken } from '../utils/token.js'
import { createMessage, listRecentMessages } from './chatService.js'
import {
  applyClientUpdate,
  encodeFullState,
  ensureDoc,
  flushPersist,
  schedulePersist,
  syncStep,
  u8ToB64,
} from './yjsStore.js'
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
 * RT2: yjs:sync / yjs:update (+ savedCode debounce persist)
 * RT3: chat:send / chat:new + recent history on join
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
        socket.data.roomId = room.id

        ensureDoc(code, room.savedCode)
        const yjsState = encodeFullState(code)
        const messages = await listRecentMessages(room.id)

        broadcastPresence(io, code)
        reply({
          ok: true,
          participants: listParticipants(code),
          yjsState: yjsState ? u8ToB64(yjsState) : null,
          messages,
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
        socket.data.roomId = undefined
      }
      broadcastPresence(io, code)
      void flushPersist(code)
      reply({ ok: true })
    })

    socket.on('yjs:sync', (payload, ack) => {
      const reply = typeof ack === 'function' ? ack : () => {}
      const roomCode = socket.data.roomCode
      if (!roomCode) {
        reply({ ok: false, message: 'Not in a room.' })
        return
      }

      const result = syncStep(roomCode, payload?.stateVector)
      if (!result.ok) {
        reply({ ok: false, message: 'No document for this room.' })
        return
      }
      reply(result)
    })

    socket.on('yjs:update', (payload) => {
      const roomCode = socket.data.roomCode
      if (!roomCode) return

      const result = applyClientUpdate(roomCode, payload?.update)
      if (!result.ok) return

      socket.to(roomCode).emit('yjs:update', { update: result.update })
      schedulePersist(roomCode)
    })

    socket.on('chat:send', async (payload, ack) => {
      const reply = typeof ack === 'function' ? ack : () => {}
      const roomCode = socket.data.roomCode
      const roomId = socket.data.roomId
      if (!roomCode || !roomId) {
        reply({ ok: false, message: 'Join a room before chatting.' })
        return
      }

      try {
        const result = await createMessage({
          roomId,
          userId: socket.data.userId,
          userName: socket.data.userName,
          text: payload?.text,
        })

        if (result.error) {
          reply({ ok: false, message: result.error })
          return
        }

        io.to(roomCode).emit('chat:new', { message: result.message })
        reply({ ok: true, message: result.message })
      } catch (error) {
        console.error('chat:send failed:', error)
        reply({ ok: false, message: 'Unable to send message.' })
      }
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
