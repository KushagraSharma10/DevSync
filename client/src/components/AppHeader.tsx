import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { ThemeToggle } from './ThemeToggle'
import { UserAvatar } from './UserAvatar'

export function AppHeader() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    setIsMenuOpen(false)
    navigate('/login')
  }

  return (
    <header className="flex items-center justify-between border-b border-(--border) bg-(--bg-header) px-6 py-3">
      <h1 className="brand text-xl font-bold tracking-wide text-(--text)">
        DevSync
      </h1>

      <div className="flex items-center gap-3">
        <ThemeToggle />

        <div className="relative">
          <button
            type="button"
            aria-label="Account menu"
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className="flex items-center gap-1.5 rounded-lg border border-(--border) bg-transparent py-1 pr-2 pl-1 text-(--text)"
          >
            {user ? (
              <UserAvatar name={user.name} size="sm" />
            ) : (
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-(--accent)/15 text-[10px] font-semibold text-(--accent)">
                ?
              </span>
            )}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-4 w-4 text-(--text-muted)"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.17l3.71-3.94a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          {isMenuOpen ? (
            <div className="absolute top-full right-0 z-20 mt-2 w-60 rounded-xl border border-(--border) bg-(--bg-elevated) p-2 shadow-xl">
              {user ? (
                <div className="px-3 py-2">
                  <p className="truncate text-sm font-semibold text-(--text)">
                    {user.name}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-(--text-muted)">
                    {user.email}
                  </p>
                </div>
              ) : null}
              <button
                type="button"
                onClick={handleLogout}
                className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-(--danger) hover:bg-(--bg-soft)"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <path d="m16 17 5-5-5-5" />
                  <path d="M21 12H9" />
                </svg>
                Log out
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  )
}
