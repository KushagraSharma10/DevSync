import http from 'node:http'
import { Server } from 'socket.io'
import app from './app.js'
import { connectDB } from './config/db.js'
import { allowedOrigins } from './config/corsOrigins.js'
import { env } from './config/env.js'
import { registerSockets } from './sockets/index.js'

async function start() {
  try {
    await connectDB()

    // HTTP server wraps Express so Socket.IO can share the same port.
    const server = http.createServer(app)
    const io = new Server(server, {
      cors: {
        origin: allowedOrigins(),
        credentials: true,
      },
    })

    registerSockets(io)

    server.listen(env.port, () => {
      console.log(`DevSync server listening on http://localhost:${env.port}`)
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

start()
