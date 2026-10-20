export function AppHeader() {
  return (
    <header className="flex items-center justify-between border-b border-(--border) bg-(--bg-header) px-6 py-3">
      <h1 className="brand text-xl font-bold tracking-wide text-(--text)">DevSync</h1>

      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Toggle theme"
          className="rounded-lg border border-(--border) bg-transparent p-2 text-(--text-muted) hover:text-(--text)"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
            />
          </svg>
        </button>

        <button
          type="button"
          aria-label="Account menu"
          className="flex items-center gap-1.5 rounded-lg border border-(--border) bg-transparent py-1 pr-2 pl-1 text-(--text)"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-(--bg-soft) text-xs font-semibold text-(--text)">
            M
          </span>
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
      </div>
    </header>
  )
}
