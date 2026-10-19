import { useState } from 'react'
import { Link } from 'react-router-dom'

const Login = () => {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="auth-bg flex min-h-screen items-center justify-center px-4 text-(--text)">
      <div className="w-full max-w-md">
        <div className="text-center">
          <h1 className="brand text-5xl font-bold tracking-wide">DevSync</h1>
          <p className="mt-2 text-base text-(--text-muted)">
            Code together in realtime rooms.
          </p>
        </div>

        <div className="mt-10 rounded-xl border border-(--border) bg-(--bg-elevated) p-8">
          <h2 className="mb-6 text-xl font-semibold">Welcome back</h2>

          <form
            className="flex flex-col gap-5"
            onSubmit={(event) => event.preventDefault()}
          >
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-sm text-(--text) font-semibold">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@company.com"
                autoComplete="email"
                className="w-full rounded-lg border border-(--border) bg-(--bg) px-4 py-3 text-sm outline-none placeholder:text-(--text-muted) focus:border-(--accent) "
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="password" className="text-sm text-(--text) font-semibold">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  autoComplete="current-password"
                  className="w-full rounded-lg border border-(--border) bg-(--bg) px-4 py-3 pr-14 text-sm outline-none placeholder:text-(--text-muted) focus:border-(--accent)"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-sm text-(--text-muted) hover:text-(--accent) "
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-(--accent) py-3 text-sm font-semibold text-(--bg) hover:bg-(--accent-dim) " 
            >
              Sign in
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-(--text-muted)">
            New to DevSync?{' '}
            <Link to="/register" className="text-(--accent)">
              Create account
            </Link>
          </p>
        </div>

        <p className="mt-6 text-center text-sm text-(--text-muted)">
          Have a{' '}
          <span className="rounded-md bg-(--bg-soft) px-1.5 py-0.5 font-mono text-xs text-(--text)">
            room code
          </span>
          ? Sign in first, then join.
        </p>
      </div>
    </div>
  )
}

export default Login
