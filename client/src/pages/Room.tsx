import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ChatPanel } from '../components/ChatPanel'
import { CodeEditor } from '../components/CodeEditor'
import { ParticipantsList } from '../components/ParticipantsList'
import { RoomHeader } from '../components/RoomHeader'
import { useRoomSocket } from '../hooks/useRoomSocket'
import { ApiError, roomsApi } from '../lib/api'
import { useAuthStore } from '../stores/authStore'

const Room = () => {
  const { code } = useParams<{ code: string }>()
  const roomCode = (code ?? '').toUpperCase()
  const token = useAuthStore((state) => state.token)
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)

  const canLoadRoom = Boolean(token && roomCode)
  const [roomName, setRoomName] = useState(
    roomCode ? `Room ${roomCode}` : 'Room',
  )
  const [isLoadingRoom, setIsLoadingRoom] = useState(canLoadRoom)
  const [roomError, setRoomError] = useState(
    roomCode ? '' : 'Room code is missing.',
  )

  // Local React state only — never put editor text in Zustand
  const [editorCode, setEditorCode] = useState('')
  const [cursor, setCursor] = useState({ line: 1, column: 1 })
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  // When we apply a remote snapshot, Monaco may fire onChange — skip re-emit
  const applyingRemoteRef = useRef(false)

  const roomReady = !isLoadingRoom && !roomError
  const {
    participants,
    messages,
    connectionStatus,
    isConnected,
    socketError,
    emitCodeUpdate,
    emitChatMessage,
  } = useRoomSocket({
    roomCode,
    token,
    currentUserId: user?.id ?? null,
    enabled: roomReady,
    onRemoteCode: (content) => {
      applyingRemoteRef.current = true
      setEditorCode(content)
      queueMicrotask(() => {
        applyingRemoteRef.current = false
      })
    },
  })

  const handleEditorChange = (value: string) => {
    setEditorCode(value)
    if (!applyingRemoteRef.current) {
      emitCodeUpdate(value)
    }
  }

  useEffect(() => {
    if (!token || !roomCode) return

    const authToken = token
    const codeToLoad = roomCode
    let cancelled = false

    async function loadRoom() {
      setIsLoadingRoom(true)
      setRoomError('')
      try {
        const { room } = await roomsApi.getByCode(authToken, codeToLoad)
        if (cancelled) return
        setRoomName(room.name)
        // REST seed; socket join ack may overwrite with newer in-memory snapshot
        if (typeof room.savedCode === 'string') {
          setEditorCode(room.savedCode)
        }
      } catch (error) {
        if (cancelled) return
        if (error instanceof ApiError && error.status === 401) {
          logout()
          return
        }
        setRoomError(
          error instanceof ApiError
            ? error.message
            : 'Unable to load this room. Please try again.',
        )
      } finally {
        if (!cancelled) setIsLoadingRoom(false)
      }
    }

    void loadRoom()
    return () => {
      cancelled = true
    }
  }, [token, roomCode, logout])

  const lastMessage = messages[messages.length - 1]
  const currentUserId = user?.id ?? null
  const chatDisabled = connectionStatus !== 'live'

  if (isLoadingRoom) {
    return (
      <div className="flex h-dvh flex-col items-center justify-center gap-3 bg-(--bg) text-(--text)">
        <p className="text-[15px] text-(--text-muted)">Loading room…</p>
      </div>
    )
  }

  if (roomError) {
    return (
      <div className="flex h-dvh flex-col items-center justify-center gap-4 bg-(--bg) px-6 text-center text-(--text)">
        <p className="text-[15px] text-(--danger)" role="alert">
          {roomError}
        </p>
        <Link
          to="/dashboard"
          className="rounded-lg border border-(--border) bg-(--bg-elevated) px-4 py-2.5 text-sm font-medium text-(--text) hover:border-(--accent)"
        >
          Back to dashboard
        </Link>
      </div>
    )
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-(--bg) text-(--text)">
      <RoomHeader
        roomName={roomName}
        roomCode={roomCode}
        participants={participants}
        connectionStatus={connectionStatus}
      />

      {connectionStatus === 'reconnecting' ? (
        <div className="anim-banner border-b border-(--border) bg-(--bg-elevated) px-4 py-2 text-center text-sm text-(--text-muted)">
          Connection lost — reconnecting…
        </div>
      ) : null}

      {socketError ? (
        <div
          className="anim-banner border-b border-(--border) bg-(--bg-elevated) px-4 py-2 text-center text-sm text-(--danger)"
          role="alert"
        >
          {socketError}
        </div>
      ) : null}

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        {/* Editor + status bar */}
        <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-(--bg)">
          <div className="relative min-h-0 flex-1 overflow-hidden">
            <CodeEditor
              value={editorCode}
              onChange={handleEditorChange}
              onCursorChange={(line, column) => setCursor({ line, column })}
            />
          </div>
          <footer className="flex shrink-0 items-center justify-between border-t border-(--border) bg-(--bg-elevated) px-4 py-1.5 text-xs text-(--text-muted)">
            <span>JavaScript</span>
            <span>
              Ln {cursor.line}, Col {cursor.column}
            </span>
          </footer>
        </section>

        {/* Desktop sidebar */}
        <aside className="hidden w-[360px] shrink-0 flex-col border-l border-(--border) bg-(--bg-elevated) lg:flex xl:w-[440px]">
          <div className="shrink-0 px-5 pt-5 pb-4">
            <div className="flex items-center justify-between">
              <h2 className="text-[13px] font-semibold text-(--text)">
                Participants
              </h2>
              <span className="text-xs text-(--text-muted)">
                {participants.length}
              </span>
            </div>
            <div className="mt-3.5">
              {participants.length === 0 ? (
                <p className="text-sm text-(--text-muted)">
                  {isConnected
                    ? 'Waiting for people to join…'
                    : 'Connecting to live presence…'}
                </p>
              ) : (
                <ParticipantsList participants={participants} />
              )}
            </div>
          </div>

          <div className="flex min-h-0 flex-1 flex-col border-t border-(--border)">
            <ChatPanel
              messages={messages}
              currentUserId={currentUserId}
              onSendMessage={emitChatMessage}
              disabled={chatDisabled}
            />
          </div>
        </aside>

        {/* Mobile bottom sheet */}
        <div className="shrink-0 lg:hidden">
          {isSheetOpen ? (
            <div className="flex h-[62dvh] flex-col rounded-t-2xl border-t border-(--border) bg-(--bg-elevated)">
              <button
                type="button"
                onClick={() => setIsSheetOpen(false)}
                aria-label="Collapse chat"
                className="flex shrink-0 flex-col items-center px-5 pt-2.5 pb-1"
              >
                <span className="h-1 w-10 rounded-full bg-(--border)" />
              </button>

              <div className="shrink-0 px-5 pt-2 pb-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-[15px] font-semibold text-(--text)">
                    Participants
                  </h2>
                  <span className="text-xs text-(--text-muted)">
                    {participants.length}
                  </span>
                </div>
                <div className="mt-3">
                  {participants.length === 0 ? (
                    <p className="text-sm text-(--text-muted)">
                      {isConnected
                        ? 'Waiting for people to join…'
                        : 'Connecting to live presence…'}
                    </p>
                  ) : (
                    <ParticipantsList
                      participants={participants}
                      variant="chips"
                    />
                  )}
                </div>
              </div>

              <div className="flex min-h-0 flex-1 flex-col border-t border-(--border)">
                <ChatPanel
                  messages={messages}
                  currentUserId={currentUserId}
                  onSendMessage={emitChatMessage}
                  disabled={chatDisabled}
                />
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsSheetOpen(true)}
              aria-label="Expand chat"
              className="block w-full rounded-t-2xl border-t border-(--border) bg-(--bg-elevated) px-5 pt-2.5 pb-4 text-left"
            >
              <span className="mx-auto block h-1 w-10 rounded-full bg-(--border)" />
              <span className="mt-3 flex items-center gap-3">
                <span className="min-w-0">
                  <span className="block text-[15px] font-semibold text-(--text)">
                    Chat
                  </span>
                  {lastMessage ? (
                    <span className="mt-0.5 block truncate text-sm text-(--text-muted)">
                      {currentUserId &&
                      lastMessage.authorId === currentUserId
                        ? 'You'
                        : lastMessage.author}
                      : {lastMessage.text}
                    </span>
                  ) : null}
                </span>
                <span className="ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-full border border-(--border) bg-(--bg) px-3 py-1.5 text-xs font-medium text-(--text)">
                  <span className="h-1.5 w-1.5 rounded-full bg-(--accent)" />
                  {participants.length} online
                </span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4 shrink-0 text-(--text-muted)"
                  aria-hidden="true"
                >
                  <path d="m18 15-6-6-6 6" />
                </svg>
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default Room
