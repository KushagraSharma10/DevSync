import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Participant } from '../types/room'
import { ThemeToggle } from './ThemeToggle'
import { UserAvatar } from './UserAvatar'

type RoomHeaderProps = {
  roomName: string
  roomCode: string
  participants: Participant[]
  /** live | connecting | reconnecting */
  connectionStatus?: 'live' | 'connecting' | 'reconnecting'
}

export function RoomHeader({
  roomName,
  roomCode,
  participants,
  connectionStatus = 'connecting',
}: RoomHeaderProps) {
  const [copied, setCopied] = useState(false)
  const copiedTimerRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (copiedTimerRef.current !== null) {
        window.clearTimeout(copiedTimerRef.current)
      }
    }
  }, [])

  const handleCopyCode = () => {
    const showCopied = () => {
      setCopied(true)
      if (copiedTimerRef.current !== null) {
        window.clearTimeout(copiedTimerRef.current)
      }
      copiedTimerRef.current = window.setTimeout(() => {
        setCopied(false)
        copiedTimerRef.current = null
      }, 1800)
    }

    if (!navigator.clipboard?.writeText) return

    navigator.clipboard.writeText(roomCode).then(showCopied).catch(() => {
      // Clipboard unavailable — no false success
    })
  }

  return (
    <header className="flex min-h-14 flex-wrap items-center gap-x-3 gap-y-2 border-b border-(--border) bg-(--bg-header) px-4 py-2 sm:h-14 sm:flex-nowrap sm:gap-x-4 sm:px-5">
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

      <span className="inline-flex shrink-0 items-center gap-1 overflow-visible rounded-md border border-(--border) bg-(--bg-soft) py-1 pr-1 pl-2.5">
        <span className="font-mono text-[13px] font-medium tracking-widest text-(--text)">
          {roomCode}
        </span>
        <button
          type="button"
          onClick={handleCopyCode}
          aria-label={copied ? 'Room code copied' : 'Copy room code'}
          title={copied ? 'Copied' : 'Copy code'}
          className={`relative flex h-7 w-7 shrink-0 items-center justify-center overflow-visible rounded-full ${
            copied
              ? ''
              : 'text-(--text-muted) hover:text-(--text)'
          }`}
        >
          {copied ? (
            <svg
              key="copied"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 40 40"
              className="copy-success-icon h-7 w-7"
              aria-hidden="true"
            >
              {/* Sparks — long at cardinals, shorter in between */}
              {(
                [
                  [0, 12, 19],
                  [30, 13, 18],
                  [60, 12, 19],
                  [90, 13, 18],
                  [120, 12, 19],
                  [150, 13, 18],
                  [180, 12, 19],
                  [210, 13, 18],
                  [240, 12, 19],
                  [270, 13, 18],
                  [300, 12, 19],
                  [330, 13, 18],
                ] as const
              ).map(([rot, inner, outer]) => (
                <line
                  key={rot}
                  className="copy-spark"
                  style={{ ['--spark-rot' as string]: `${rot}deg` }}
                  x1="20"
                  y1={20 - outer}
                  x2="20"
                  y2={20 - inner}
                  stroke="#009B3A"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              ))}
              <circle className="copy-circle" cx="20" cy="20" r="10" fill="#009B3A" />
              <path
                className="copy-check"
                d="M13.8 20.2 17.8 24.2 26.2 15.5"
                fill="none"
                stroke="#fff"
                strokeWidth="2.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <svg
              key="copy"
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
          )}
        </button>
      </span>

      {connectionStatus === 'live' ? (
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-emerald-500/35 bg-emerald-500/10 px-3 py-1 text-[13px] font-medium text-emerald-600">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
          Live
        </span>
      ) : (
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-(--border) bg-(--bg-soft) px-3 py-1 text-[13px] font-medium text-(--text-muted)">
          {connectionStatus === 'reconnecting'
            ? 'Reconnecting…'
            : 'Connecting…'}
        </span>
      )}

      <span className="ml-auto hidden shrink-0 items-center md:inline-flex">
        <span className="flex -space-x-2">
          {participants.map((participant) => (
            <span
              key={participant.id}
              className="rounded-full ring-2 ring-(--bg-header)"
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

      <span className="ml-auto inline-flex shrink-0 items-center gap-2 md:ml-0">
        <ThemeToggle />
        <Link
          to="/dashboard"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-(--danger) px-3 py-1.5 text-[13px] font-semibold text-white hover:opacity-90"
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
      </span>
    </header>
  )
}
