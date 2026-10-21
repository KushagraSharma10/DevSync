import 'dotenv/config'

function requiredEnv(name) {
  const value = process.env[name]?.trim()
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

export const env = {
  port: Number(process.env.PORT) || 5000,
  mongoUri: requiredEnv('MONGO_URI'),
  jwtSecret: requiredEnv('JWT_SECRET'),
  clientUrl: process.env.CLIENT_URL?.trim() || 'http://localhost:5173',
}
