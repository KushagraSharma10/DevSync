import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { AuthInput } from '../components/AuthInput'
import { AuthLayout } from '../components/AuthLayout'

type RegisterErrors = {
  name?: string
  email?: string
  password?: string
  confirmPassword?: string
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const Register = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState<RegisterErrors>({})

  const handlePasswordChange = (value: string) => {
    setPassword(value)
    // A mismatch stops being accurate as soon as either password changes.
    setErrors((prev) => ({
      ...prev,
      password: undefined,
      confirmPassword: undefined,
    }))
  }

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value)
    setErrors((prev) => ({ ...prev, confirmPassword: undefined }))
  }

  const handleSubmit = (event: FormEvent) => {
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

    setErrors(nextErrors)
    // UI-only slice: on success the errors clear and the form stays put.
    // Account creation + navigation arrive with the Auth API wiring.
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
        <button
          type="submit"
          className="w-full rounded-lg bg-(--accent) py-3 text-sm font-semibold text-(--bg) hover:bg-(--accent-dim)"
        >
          Create account
        </button>
      </form>
    </AuthLayout>
  )
}

export default Register
