import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'

function AuthLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-(--bg) text-sm text-(--text-muted)">
      Loading…
    </div>
  )
}

// For /dashboard and /room/:code — only signed-in users get in
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const token = useAuthStore((state) => state.token)
  const isReady = useAuthStore((state) => state.isReady)

  if (!isReady) return <AuthLoading />
  if (!token) return <Navigate to="/login" replace />
  return <>{children}</>
}

// For /login and /register — signed-in users go straight to the dashboard
export function GuestRoute({ children }: { children: ReactNode }) {
  const token = useAuthStore((state) => state.token)
  const isReady = useAuthStore((state) => state.isReady)

  if (!isReady) return <AuthLoading />
  if (token) return <Navigate to="/dashboard" replace />
  return <>{children}</>
}
