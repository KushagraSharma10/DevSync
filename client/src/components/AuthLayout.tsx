import type { ReactNode } from 'react'

type AuthLayoutProps = {
  tagline: string
  title: string
  children: ReactNode
  footer: ReactNode
  belowCard?: ReactNode
}

export function AuthLayout({
  tagline,
  title,
  children,
  footer,
  belowCard,
}: AuthLayoutProps) {
  return (
    <div className="auth-bg flex min-h-screen items-center justify-center px-4 py-10 text-(--text)">
      <div className="anim-page w-full max-w-md">
        <div className="text-center">
          <h1 className="brand text-5xl font-bold tracking-wide">DevSync</h1>
          <p className="mt-2 text-base text-(--text-muted)">{tagline}</p>
        </div>

        <div className="mt-10 rounded-xl border border-(--border) bg-(--bg-elevated) p-8">
          <h2 className="mb-6 text-xl font-semibold">{title}</h2>
          {children}
          <div className="mt-6 text-center text-sm text-(--text-muted)">{footer}</div>
        </div>

        {belowCard ? (
          <div className="mt-6 text-center text-sm text-(--text-muted)">{belowCard}</div>
        ) : null}
      </div>
    </div>
  )
}
