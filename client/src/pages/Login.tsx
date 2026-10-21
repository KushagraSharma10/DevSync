import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { AuthInput } from '../components/AuthInput'
import { AuthLayout } from '../components/AuthLayout'

type LoginErrors = {
  email?: string
  password?: string
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<LoginErrors>({})

  const handleEmailChange = (value: string) => {
    setEmail(value)
    // Credential error belongs to the email+password pair, so editing
    // either field clears the stale "incorrect" message.
    setErrors((prev) => ({ ...prev, email: undefined, password: undefined }))
  }

  const handlePasswordChange = (value: string) => {
    setPassword(value)
    setErrors((prev) => ({ ...prev, password: undefined }))
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()

    const nextErrors: LoginErrors = {}

    if (!email.trim()) {
      nextErrors.email = 'Email is required.'
    } else if (!EMAIL_PATTERN.test(email.trim())) {
      nextErrors.email = 'Enter a valid email address.'
    }

    if (!password) {
      nextErrors.password = 'Password is required.'
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    // UI-only slice: there is no auth API yet, so a well-formed submit
    // shows the design's failed sign-in state (PDF frame 1). When the
    // Auth API lands, this becomes the real 401 response and a success
    // will navigate to the dashboard instead.
    setErrors({ password: 'Incorrect email or password. Try again.' })
  }

  return (
    <AuthLayout
      tagline="Code together in realtime rooms."
      title="Welcome back"
      footer={
        <>
          New to DevSync?{' '}
          <Link to="/register" className="text-(--accent)">
            Create account
          </Link>
        </>
      }
      belowCard={
        <>
          Have a{' '}
          <span className="rounded-md bg-(--bg-soft) px-1.5 py-0.5 font-mono text-xs text-(--text)">
            room code
          </span>
          ? Sign in first, then join.
        </>
      }
    >
      <form className="flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
        <AuthInput
          id="email"
          name="email"
          label="Email"
          type="email"
          placeholder="you@company.com"
          autoComplete="email"
          value={email}
          onChange={handleEmailChange}
          error={errors.email}
        />
        <AuthInput
          id="password"
          name="password"
          label="Password"
          type="password"
          placeholder="Password"
          autoComplete="current-password"
          showPasswordToggle
          value={password}
          onChange={handlePasswordChange}
          error={errors.password}
        />
        <button
          type="submit"
          className="w-full rounded-lg bg-(--accent) py-3 text-sm font-semibold text-(--bg) hover:bg-(--accent-dim)"
        >
          Sign in
        </button>
      </form>
    </AuthLayout>
  )
}

export default Login
