import mongoose from 'mongoose'
import { env } from './env.js'

export async function connectDB() {
  mongoose.set('strictQuery', true)
  const connection = await mongoose.connect(env.mongoUri, { dbName: 'devsync' })
  console.log(`MongoDB connected: ${connection.connection.host}`)
}
