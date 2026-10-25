import cors from 'cors'
import express from 'express'
import { allowedOrigins } from './config/corsOrigins.js'
import authRoutes from './routes/authRoutes.js'
import roomRoutes from './routes/roomRoutes.js'
import { errorHandler, notFound } from './middleware/errorMiddleware.js'

const app = express()

app.use(cors({ origin: allowedOrigins(), credentials: true }))
app.use(express.json())

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' })
})

app.use('/api/auth', authRoutes)
app.use('/api/rooms', roomRoutes)

app.use(notFound)
app.use(errorHandler)

export default app
