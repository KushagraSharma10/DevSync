import cors from 'cors'
import express from 'express'
import { env } from './config/env.js'
import authRoutes from './routes/authRoutes.js'
import { errorHandler, notFound } from './middleware/errorMiddleware.js'

const app = express()

// The client is opened as both localhost and 127.0.0.1 in local dev —
// allow the same origin with either host, not just the configured one.
function allowedOrigins() {
  const origins = new Set([env.clientUrl])
  try {
    const url = new URL(env.clientUrl)
    if (url.hostname === 'localhost') {
      url.hostname = '127.0.0.1'
      origins.add(url.origin)
    } else if (url.hostname === '127.0.0.1') {
      url.hostname = 'localhost'
      origins.add(url.origin)
    }
  } catch {
    // Invalid CLIENT_URL — fall back to the raw value only
  }
  return [...origins]
}

app.use(cors({ origin: allowedOrigins(), credentials: true }))
app.use(express.json())

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' })
})

app.use('/api/auth', authRoutes)

app.use(notFound)
app.use(errorHandler)

export default app
