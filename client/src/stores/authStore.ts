import { create } from 'zustand'
import { authApi } from '../lib/api'
import type { PublicUser } from '../types/auth'

const TOKEN_KEY = 'devsync-token'

type AuthState = {
  user: PublicUser | null
  token: string | null
  // false until the stored token (if any) has been checked with /api/auth/me
  isReady: boolean
  hydrate: () => Promise<void>
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: localStorage.getItem(TOKEN_KEY),
  isReady: false,

  hydrate: async () => {
    const { token } = get()
    if (!token) {
      set({ isReady: true })
      return
    }

    try {
      const { user } = await authApi.me(token)
      set({ user, isReady: true })
    } catch {
      // Token invalid/expired or server unreachable — drop it and start clean
      localStorage.removeItem(TOKEN_KEY)
      set({ user: null, token: null, isReady: true })
    }
  },

  login: async (email, password) => {
    const { token, user } = await authApi.login({ email, password })
    localStorage.setItem(TOKEN_KEY, token)
    set({ token, user, isReady: true })
  },

  register: async (name, email, password) => {
    await authApi.register({ name, email, password })
    // Register returns no token, so log in right after to start a session
    await get().login(email, password)
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY)
    set({ user: null, token: null, isReady: true })
  },
}))
