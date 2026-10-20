import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppHeader } from '../components/AppHeader'
import { RoomListItem } from '../components/RoomListItem'
import { mockRooms } from '../data/mockRooms'

const Dashboard = () => {
  const navigate = useNavigate()
  const [roomCode, setRoomCode] = useState('')

  const handleCreateRoom = () => {
    // UI-only for now — API comes later
  }

  const handleJoin = (event: FormEvent) => {
    event.preventDefault()
    const code = roomCode.trim().toUpperCase()
    if (!code) return
    navigate(`/room/${code}`)
  }

  return (
    <div className="app-bg min-h-screen text-(--text)">
      <AppHeader />

      <main className="mx-auto w-full max-w-4xl px-6 pt-12 pb-10">
        <h2 className="text-3xl font-semibold tracking-tight">Your rooms</h2>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={handleCreateRoom}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-(--accent) px-4 py-2.5 text-sm font-semibold text-(--bg) hover:bg-(--accent-dim)"
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

          <form onSubmit={handleJoin} className="flex w-full gap-2 sm:w-96">
            <input
              type="text"
              value={roomCode}
              onChange={(event) => setRoomCode(event.target.value)}
              placeholder="Enter room code"
              aria-label="Room code"
              className="min-w-0 flex-1 rounded-lg border border-(--border) bg-(--bg) px-4 py-2.5 text-sm outline-none placeholder:text-(--text-muted) focus:border-(--accent)"
            />
            <button
              type="submit"
              className="shrink-0 rounded-lg border border-(--border) bg-(--bg-elevated) px-4 py-2.5 text-sm font-medium text-(--text) hover:border-(--accent)"
            >
              Join
            </button>
          </form>
        </div>

        <section className="mt-10">
          <h3 className="mb-3 text-sm text-(--text-muted)">Recent rooms</h3>

          <div className="overflow-hidden rounded-xl border border-(--border) bg-(--bg-elevated)">
            {mockRooms.length === 0 ? (
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
                {mockRooms.map((room) => (
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
