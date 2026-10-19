import { useState } from 'react'
import { Link } from 'react-router-dom'

const Register = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  return (
    <div className="auth-bg flex min-h-screen items-center justify-center px-4 py-10 text-(--text)">
      <div className="w-full max-w-md">
        <div className="text-center">
          <h1 className="brand text-5xl font-bold tracking-wider">DevSync</h1>
          <p className="mt-2 text-base text-(--text-muted)">Create your account.</p>
        </div>

        <div className="mt-10 rounded-xl border border-(--border) bg-(--bg-elevated) p-8">
          <h2 className="mb-6 text-xl font-semibold">Get started</h2>

          <form
            className="flex flex-col gap-5"
            onSubmit={(event) => event.preventDefault()}
          >
            <div className="flex flex-col gap-2">
              <label htmlFor="name" className="text-sm font-semibold text-(--text)">
                Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="Your full name"
                autoComplete="name"
                className="w-full rounded-lg border border-(--border) bg-(--bg) px-4 py-3 text-sm outline-none placeholder:text-(--text-muted) focus:border-(--accent)"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-sm font-semibold text-(--text)">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@company.com"
                autoComplete="email"
                className="w-full rounded-lg border border-(--border) bg-(--bg) px-4 py-3 text-sm outline-none placeholder:text-(--text-muted) focus:border-(--accent)"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="password" className="text-sm font-semibold text-(--text)">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                  className="w-full rounded-lg border border-(--border) bg-(--bg) px-4 py-3 pr-14 text-sm outline-none placeholder:text-(--text-muted) focus:border-(--accent)"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-sm text-(--text-muted) hover:text-(--accent)"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="confirmPassword"
                className="text-sm font-semibold text-(--text)"
              >
                Confirm password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                  className="w-full rounded-lg border border-(--border) bg-(--bg) px-4 py-3 pr-14 text-sm outline-none placeholder:text-(--text-muted) focus:border-(--accent)"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-sm text-(--text-muted) hover:text-(--accent)"
                >
                  {showConfirmPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-(--accent) py-3 text-sm font-semibold text-(--bg) hover:bg-(--accent-dim)"
            >
              Create account
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-(--text-muted)">
            Already have an account?{' '}
            <Link to="/login" className="text-(--accent)">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register
