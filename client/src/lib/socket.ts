import { io, type Socket } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ?? 'http://localhost:5000'

let socket: Socket | null = null

/**
 * One shared Socket.IO client for the app.
 * Connect with the same JWT used for REST (handshake.auth.token).
 */
export function getSocket(token: string): Socket {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
      auth: { token },
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
