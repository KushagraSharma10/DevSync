import { Link } from 'react-router-dom'
import type { MockParticipant } from '../data/mockRoom'
import { UserAvatar } from './UserAvatar'

type RoomHeaderProps = {
  roomName: string
  roomCode: string
  participants: MockParticipant[]
}

export function RoomHeader({ roomName, roomCode, participants }: RoomHeaderProps) {
  const handleCopyCode = () => {
    navigator.clipboard?.writeText(roomCode).catch(() => {
      // Clipboard unavailable — UI-only slice, ignore
    })
  }

  return (
    <header className="flex min-h-14 flex-wrap items-center gap-x-3 gap-y-2 border-b border-(--border) bg-(--bg) px-4 py-2 sm:h-14 sm:flex-nowrap sm:gap-x-4 sm:px-5">
      <span className="brand w-full shrink-0 text-base font-bold tracking-wide text-(--text) sm:w-auto sm:text-lg">
        DevSync
      </span>

      <span
        className="hidden h-6 w-px shrink-0 bg-(--border) sm:block"
        aria-hidden="true"
      />

      <h1 className="max-w-56 min-w-0 truncate text-xl font-semibold text-(--text) sm:max-w-72 sm:text-[15px]">
        {roomName}
      </h1>

      <span className="inline-flex shrink-0 items-center gap-1 rounded-md border border-(--border) bg-(--bg-soft) py-1 pr-1 pl-2.5">
        <span className="font-mono text-[13px] font-medium tracking-widest text-(--text)">
          {roomCode}
        </span>
        <button
          type="button"
          onClick={handleCopyCode}
          aria-label="Copy room code"
          className="rounded p-1 text-(--text-muted) hover:text-(--text)"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-3.5 w-3.5"
            aria-hidden="true"
          >
            <rect x="9" y="9" width="12" height="12" rx="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
        </button>
      </span>

      <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-emerald-400/40 bg-emerald-400/10 px-3 py-1 text-[13px] font-medium text-emerald-400">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
        Live
      </span>

      <span className="ml-auto hidden shrink-0 items-center md:inline-flex">
        <span className="flex -space-x-2">
          {participants.map((participant) => (
            <span
              key={participant.id}
              className="rounded-full ring-2 ring-(--bg)"
              title={participant.name}
            >
              <UserAvatar name={participant.name} />
            </span>
          ))}
        </span>
        <span className="ml-2.5 text-xs text-(--text-muted)">
          {participants.length} online
        </span>
      </span>

      <Link
        to="/dashboard"
        className="ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-(--border) px-3 py-1.5 text-[13px] font-medium text-(--text-muted) hover:border-(--accent) hover:text-(--text) md:ml-0"
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
        Leave
      </Link>
    </header>
  )
}
