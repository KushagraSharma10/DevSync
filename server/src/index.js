import http from 'node:http'
import mongoose from 'mongoose'
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

    server.on('error', (error) => {
      if (error?.code === 'EADDRINUSE') {
        console.error(
          `Port ${env.port} is already in use. Stop the other process using that port, then run npm run dev again.`,
        )
        process.exit(1)
      }
      console.error('Server error:', error)
      process.exit(1)
    })

    server.listen(env.port, () => {
      console.log(`DevSync server listening on http://localhost:${env.port}`)
    })

    // --watch restarts send SIGTERM; close cleanly so the port is released
    let shuttingDown = false
    async function shutdown(signal) {
      if (shuttingDown) return
      shuttingDown = true
      console.log(`Shutting down (${signal})…`)

      const forceTimer = setTimeout(() => {
        console.error('Forced exit after shutdown timeout')
        process.exit(1)
      }, 4000)
      forceTimer.unref()

      try {
        await new Promise((resolve) => {
          io.close(() => resolve())
        })
        await new Promise((resolve, reject) => {
          server.close((error) => (error ? reject(error) : resolve()))
        })
        await mongoose.connection.close()
      } catch (error) {
        console.error('Error during shutdown:', error)
      }
      process.exit(0)
    }

    process.once('SIGINT', () => void shutdown('SIGINT'))
    process.once('SIGTERM', () => void shutdown('SIGTERM'))
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

start()
