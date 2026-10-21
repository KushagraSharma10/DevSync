import type { AuthResponse, PublicUser } from '../types/auth'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000'

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

type ApiOptions = {
  method?: string
  body?: unknown
  token?: string | null
}

async function apiFetch<T>(path: string, options: ApiOptions = {}): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${API_URL}${path}`, {
      method: options.method ?? 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(options.token
          ? { Authorization: `Bearer ${options.token}` }
          : {}),
      },
      body:
        options.body !== undefined ? JSON.stringify(options.body) : undefined,
    })
  } catch {
    // Server unreachable (offline / not running) — status 0 marks "no response"
    throw new ApiError('Unable to reach the server. Please try again.', 0)
  }

  const data = (await response.json().catch(() => null)) as
    | { message?: string }
    | null

  if (!response.ok) {
    throw new ApiError(
      data?.message ?? 'Something went wrong. Please try again.',
      response.status,
    )
  }

  return data as T
}

export const authApi = {
  register: (input: { name: string; email: string; password: string }) =>
    apiFetch<{ user: PublicUser }>('/api/auth/register', {
      method: 'POST',
      body: input,
    }),
  login: (input: { email: string; password: string }) =>
    apiFetch<AuthResponse>('/api/auth/login', { method: 'POST', body: input }),
  me: (token: string) =>
    apiFetch<{ user: PublicUser }>('/api/auth/me', { token }),
}
