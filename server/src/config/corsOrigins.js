import { env } from './env.js'

// Client may open as localhost or 127.0.0.1 — allow both forms of CLIENT_URL.
export function allowedOrigins() {
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
