import cors from 'cors'
import express from 'express'
import { env } from './config/env.js'
import { errorHandler, notFound } from './middleware/errorMiddleware.js'

const app = express()

app.use(cors({ origin: env.clientUrl, credentials: true }))
app.use(express.json())

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' })
})

app.use(notFound)
app.use(errorHandler)

export default app
