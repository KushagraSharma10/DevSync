import { Link } from 'react-router-dom'
import { AuthInput } from '../components/AuthInput'
import { AuthLayout } from '../components/AuthLayout'

const Register = () => {
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
      <form
        className="flex flex-col gap-5"
        onSubmit={(event) => event.preventDefault()}
      >
        <AuthInput
          id="name"
          name="name"
          label="Name"
          type="text"
          placeholder="Your full name"
          autoComplete="name"
        />
        <AuthInput
          id="email"
          name="email"
          label="Email"
          type="email"
          placeholder="you@company.com"
          autoComplete="email"
        />
        <AuthInput
          id="password"
          name="password"
          label="Password"
          type="password"
          placeholder="At least 8 characters"
          autoComplete="new-password"
          showPasswordToggle
        />
        <AuthInput
          id="confirmPassword"
          name="confirmPassword"
          label="Confirm password"
          type="password"
          placeholder="Re-enter your password"
          autoComplete="new-password"
          showPasswordToggle
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
