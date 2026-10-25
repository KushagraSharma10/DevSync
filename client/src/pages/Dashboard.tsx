import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppHeader } from '../components/AppHeader'
import { RoomListItem } from '../components/RoomListItem'
import { ApiError, roomsApi } from '../lib/api'
import { useAuthStore } from '../stores/authStore'
import type { Room } from '../types/room'

const Dashboard = () => {
  const navigate = useNavigate()
  const token = useAuthStore((state) => state.token)
  const logout = useAuthStore((state) => state.logout)

  const [rooms, setRooms] = useState<Room[]>([])
  const [isLoadingRooms, setIsLoadingRooms] = useState(true)
  const [listError, setListError] = useState('')

  const [isCreating, setIsCreating] = useState(false)
  const [roomName, setRoomName] = useState('')
  const [createError, setCreateError] = useState('')
  const [isCreateSubmitting, setIsCreateSubmitting] = useState(false)

  const [roomCode, setRoomCode] = useState('')
  const [joinError, setJoinError] = useState('')
  const [isJoinSubmitting, setIsJoinSubmitting] = useState(false)

  useEffect(() => {
    if (!token) return

    let cancelled = false

    async function loadRooms() {
      setIsLoadingRooms(true)
      setListError('')
      try {
        const { rooms: nextRooms } = await roomsApi.list(token!)
        if (!cancelled) setRooms(nextRooms)
      } catch (error) {
        if (cancelled) return
        if (error instanceof ApiError && error.status === 401) {
          logout()
          return
        }
        setListError(
          error instanceof ApiError
            ? error.message
            : 'Unable to load rooms. Please try again.',
        )
      } finally {
        if (!cancelled) setIsLoadingRooms(false)
      }
    }

    void loadRooms()
    return () => {
      cancelled = true
    }
  }, [token, logout])

  const handleStartCreate = () => {
    setIsCreating(true)
    setCreateError('')
  }

  const handleCancelCreate = () => {
    setIsCreating(false)
    setRoomName('')
    setCreateError('')
  }

  const handleCreateRoom = async (event: FormEvent) => {
    event.preventDefault()
    if (!token) return

    const name = roomName.trim()
    if (!name) {
      setCreateError('Room name is required.')
      return
    }

    setIsCreateSubmitting(true)
    setCreateError('')
    try {
      const { room } = await roomsApi.create(token, { name })
      navigate(`/room/${room.code}`)
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        logout()
        return
      }
      setCreateError(
        error instanceof ApiError
          ? error.message
          : 'Unable to create room. Please try again.',
      )
    } finally {
      setIsCreateSubmitting(false)
    }
  }

  const handleJoin = async (event: FormEvent) => {
    event.preventDefault()
    if (!token) return

    const code = roomCode.trim().toUpperCase()
    if (!code) {
      setJoinError('Enter a room code.')
      return
    }

    setIsJoinSubmitting(true)
    setJoinError('')
    try {
      const { room } = await roomsApi.getByCode(token, code)
      navigate(`/room/${room.code}`)
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        logout()
        return
      }
      setJoinError(
        error instanceof ApiError
          ? error.message
          : 'Unable to join room. Please try again.',
      )
    } finally {
      setIsJoinSubmitting(false)
    }
  }

  return (
    <div className="app-bg min-h-screen text-(--text)">
      <AppHeader />

      <main className="mx-auto w-full max-w-4xl px-6 pt-12 pb-10">
        <h2 className="text-3xl font-semibold tracking-tight">Your rooms</h2>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          {isCreating ? (
            <form
              onSubmit={handleCreateRoom}
              className="flex w-full flex-col gap-2 sm:w-auto sm:min-w-72"
            >
              <div className="flex gap-2">
                <input
                  type="text"
                  value={roomName}
                  onChange={(event) => {
                    setRoomName(event.target.value)
                    setCreateError('')
                  }}
                  placeholder="Room name"
                  aria-label="Room name"
                  aria-invalid={createError ? true : undefined}
                  autoFocus
                  disabled={isCreateSubmitting}
                  className="min-w-0 flex-1 rounded-lg border border-(--border) bg-(--bg-elevated) px-4 py-2.5 text-sm outline-none placeholder:text-(--text-muted) focus:border-(--accent) disabled:opacity-60 aria-invalid:border-(--danger)"
                />
                <button
                  type="submit"
                  disabled={isCreateSubmitting}
                  className="shrink-0 rounded-lg bg-(--accent) px-4 py-2.5 text-sm font-semibold text-(--on-accent) hover:bg-(--accent-dim) disabled:opacity-60"
                >
                  {isCreateSubmitting ? 'Creating…' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={handleCancelCreate}
                  disabled={isCreateSubmitting}
                  className="shrink-0 rounded-lg border border-(--border) bg-(--bg-elevated) px-3 py-2.5 text-sm font-medium text-(--text-muted) hover:border-(--accent) hover:text-(--text) disabled:opacity-60"
                >
                  Cancel
                </button>
              </div>
              {createError ? (
                <p className="text-sm text-(--danger)" role="alert">
                  {createError}
                </p>
              ) : null}
            </form>
          ) : (
            <button
              type="button"
              onClick={handleStartCreate}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-(--accent) px-4 py-2.5 text-sm font-semibold text-(--on-accent) hover:bg-(--accent-dim)"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                className="h-4 w-4 shrink-0"
                aria-hidden="true"
              >
                <path d="M12 4.5v15M19.5 12h-15" />
              </svg>
              Create room
            </button>
          )}

          <form
            onSubmit={handleJoin}
            className="flex w-full flex-col gap-2 sm:w-96"
          >
            <div className="flex gap-2">
              <input
                type="text"
                value={roomCode}
                onChange={(event) => {
                  setRoomCode(event.target.value)
                  setJoinError('')
                }}
                placeholder="Enter room code"
                aria-label="Room code"
                aria-invalid={joinError ? true : undefined}
                disabled={isJoinSubmitting}
                className="min-w-0 flex-1 rounded-lg border border-(--border) bg-(--bg-elevated) px-4 py-2.5 text-sm outline-none placeholder:text-(--text-muted) focus:border-(--accent) disabled:opacity-60 aria-invalid:border-(--danger)"
              />
              <button
                type="submit"
                disabled={isJoinSubmitting}
                className="shrink-0 rounded-lg bg-(--accent) px-4 py-2.5 text-sm font-semibold text-(--on-accent) hover:bg-(--accent-dim) disabled:opacity-60"
              >
                {isJoinSubmitting ? 'Joining…' : 'Join'}
              </button>
            </div>
            {joinError ? (
              <p className="text-sm text-(--danger)" role="alert">
                {joinError}
              </p>
            ) : null}
          </form>
        </div>

        <section className="mt-10">
          <h3 className="mb-3 text-sm text-(--text-muted)">Recent rooms</h3>

          <div className="overflow-hidden rounded-xl border border-(--border) bg-(--bg-elevated)">
            {isLoadingRooms ? (
              <div className="px-6 py-16 text-center text-[15px] text-(--text-muted)">
                Loading rooms…
              </div>
            ) : listError ? (
              <div className="px-6 py-16 text-center text-[15px] text-(--danger)" role="alert">
                {listError}
              </div>
            ) : rooms.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-4 px-6 py-20 text-center">
                <span className="flex h-11 w-11 items-center justify-center rounded-lg border border-(--border) bg-(--bg-soft) text-(--text-muted)">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                    aria-hidden="true"
                  >
                    <path d="m8 7-5 5 5 5" />
                    <path d="m16 7 5 5-5 5" />
                    <path d="m13.5 4-3 16" />
                  </svg>
                </span>
                <p className="text-[15px] text-(--text)">
                  No rooms yet. Create one to start pairing.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-(--border)/50">
                {rooms.map((room) => (
                  <li key={room.id}>
                    <RoomListItem room={room} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}

export default Dashboard
