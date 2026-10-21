import app from './app.js'
import { connectDB } from './config/db.js'
import { env } from './config/env.js'

async function start() {
  try {
    await connectDB()
    app.listen(env.port, () => {
      console.log(`DevSync server listening on http://localhost:${env.port}`)
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

start()
