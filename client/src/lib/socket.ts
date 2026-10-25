import { io, type Socket } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ?? 'http://localhost:5000'

let socket: Socket | null = null

/**
 * One shared Socket.IO client for the app.
 * Connect with the same JWT used for REST (handshake.auth.token).
 * reconnection stays on so brief network drops auto-recover (RT3).
 */
export function getSocket(token: string): Socket {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
      auth: { token },
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 800,
      reconnectionDelayMax: 5000,
    })
  } else {
    socket.auth = { token }
  }
  return socket
}

export function disconnectSocket() {
  if (!socket) return
  socket.disconnect()
  socket = null
}
