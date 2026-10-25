import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthInput } from '../components/AuthInput'
import { AuthLayout } from '../components/AuthLayout'
import { ApiError } from '../lib/api'
import { useAuthStore } from '../stores/authStore'

type RegisterErrors = {
  name?: string
  email?: string
  password?: string
  confirmPassword?: string
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const Register = () => {
  const navigate = useNavigate()
  const register = useAuthStore((state) => state.register)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState<RegisterErrors>({})
  const [formError, setFormError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handlePasswordChange = (value: string) => {
    setPassword(value)
    // A mismatch stops being accurate as soon as either password changes.
    setErrors((prev) => ({
      ...prev,
      password: undefined,
      confirmPassword: undefined,
    }))
    setFormError('')
  }

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value)
    setErrors((prev) => ({ ...prev, confirmPassword: undefined }))
    setFormError('')
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()

    const nextErrors: RegisterErrors = {}

    if (!name.trim()) {
      nextErrors.name = 'Name is required.'
    }

    if (!email.trim()) {
      nextErrors.email = 'Email is required.'
    } else if (!EMAIL_PATTERN.test(email.trim())) {
      nextErrors.email = 'Enter a valid email address.'
    }

    if (!password) {
      nextErrors.password = 'Password is required.'
    } else if (password.length < 8) {
      nextErrors.password = 'Password must be at least 8 characters.'
    }

    if (!confirmPassword) {
      nextErrors.confirmPassword = 'Please re-enter your password.'
    } else if (password && confirmPassword !== password) {
      nextErrors.confirmPassword = 'Passwords do not match.'
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    setIsSubmitting(true)
    setFormError('')
    try {
      await register(name.trim(), email.trim(), password)
      navigate('/dashboard')
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        setErrors({ email: error.message })
      } else if (error instanceof ApiError && error.status === 400) {
        setFormError(error.message)
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
      tagline="Create your account."
      title="Get started"
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="text-(--accent)">
            Sign in
          </Link>
        </>
      }
    >
      <form className="flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
        <AuthInput
          id="name"
          name="name"
          label="Name"
          type="text"
          placeholder="Your full name"
          autoComplete="name"
          value={name}
          onChange={(value) => {
            setName(value)
            setErrors((prev) => ({ ...prev, name: undefined }))
            setFormError('')
          }}
          error={errors.name}
        />
        <AuthInput
          id="email"
          name="email"
          label="Email"
          type="email"
          placeholder="you@company.com"
          autoComplete="email"
          value={email}
          onChange={(value) => {
            setEmail(value)
            setErrors((prev) => ({ ...prev, email: undefined }))
            setFormError('')
          }}
          error={errors.email}
        />
        <AuthInput
          id="password"
          name="password"
          label="Password"
          type="password"
          placeholder="At least 8 characters"
          autoComplete="new-password"
          showPasswordToggle
          value={password}
          onChange={handlePasswordChange}
          error={errors.password}
        />
        <AuthInput
          id="confirmPassword"
          name="confirmPassword"
          label="Confirm password"
          type="password"
          placeholder="Re-enter your password"
          autoComplete="new-password"
          showPasswordToggle
          value={confirmPassword}
          onChange={handleConfirmPasswordChange}
          error={errors.confirmPassword}
        />
        {formError ? (
          <p role="alert" className="text-[13px] text-(--danger)">
            {formError}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-press w-full rounded-lg bg-(--accent) py-3 text-sm font-semibold text-(--on-accent) hover:bg-(--accent-dim) disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>
    </AuthLayout>
  )
}

export default Register
