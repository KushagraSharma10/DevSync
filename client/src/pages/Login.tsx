import { Link } from 'react-router-dom'
import { AuthInput } from '../components/AuthInput'
import { AuthLayout } from '../components/AuthLayout'

const Login = () => {
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
      <form
        className="flex flex-col gap-5"
        onSubmit={(event) => event.preventDefault()}
      >
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
          placeholder="Password"
          autoComplete="current-password"
          showPasswordToggle
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
