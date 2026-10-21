import { AppError } from '../utils/AppError.js'

export function notFound(req, _res, next) {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404))
}

export function errorHandler(error, _req, res, _next) {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({ message: error.message })
    return
  }

  if (error instanceof SyntaxError && 'body' in error) {
    res.status(400).json({ message: 'Invalid JSON body.' })
    return
  }

  console.error(error)
  res.status(500).json({ message: 'Something went wrong. Please try again.' })
}
