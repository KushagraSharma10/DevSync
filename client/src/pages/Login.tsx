import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthInput } from '../components/AuthInput'
import { AuthLayout } from '../components/AuthLayout'
import { ApiError } from '../lib/api'
import { useAuthStore } from '../stores/authStore'

type LoginErrors = {
  email?: string
  password?: string
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const Login = () => {
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<LoginErrors>({})
  const [formError, setFormError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleEmailChange = (value: string) => {
    setEmail(value)
    // Credential error belongs to the email+password pair, so editing
    // either field clears the stale "incorrect" message.
    setErrors((prev) => ({ ...prev, email: undefined, password: undefined }))
    setFormError('')
  }

  const handlePasswordChange = (value: string) => {
    setPassword(value)
    setErrors((prev) => ({ ...prev, password: undefined }))
    setFormError('')
  }

  const handleSubmit = async (event: FormEvent) => {
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

    setIsSubmitting(true)
    setFormError('')
    try {
      await login(email.trim(), password)
      navigate('/dashboard')
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        // Real failed sign-in from the API (PDF frame 1 state)
        setErrors({ password: error.message })
      } else if (error instanceof ApiError && error.status === 400) {
        setErrors({ password: error.message })
      } else if (error instanceof ApiError) {
        setFormError(error.message)
      } else {
        setFormError('Something went wrong. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
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
        {formError ? (
          <p role="alert" className="text-[13px] text-(--danger)">
            {formError}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-(--accent) py-3 text-sm font-semibold text-(--on-accent) hover:bg-(--accent-dim) disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </AuthLayout>
  )
}

export default Login
