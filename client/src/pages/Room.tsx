import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { ChatPanel } from '../components/ChatPanel'
import { CodeEditor } from '../components/CodeEditor'
import { ParticipantsList } from '../components/ParticipantsList'
import { RoomHeader } from '../components/RoomHeader'
import {
  initialCode,
  mockRoom,
  type MockChatMessage,
} from '../data/mockRoom'
import { mockRooms } from '../data/mockRooms'

const Room = () => {
  const { code } = useParams<{ code: string }>()
  const roomCode = (code ?? 'K7P2QX').toUpperCase()
  const roomName =
    mockRooms.find((room) => room.code === roomCode)?.name ??
    `Room ${roomCode}`

  const [editorCode, setEditorCode] = useState(initialCode)
  const [cursor, setCursor] = useState({ line: 12, column: 23 })
  const [messages, setMessages] = useState<MockChatMessage[]>(mockRoom.messages)
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  const handleSendMessage = (text: string) => {
    const now = new Date()
    const time = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`
    setMessages((prev) => [
      ...prev,
      { id: String(Date.now()), author: 'You', time, text },
    ])
  }

  const lastMessage = messages[messages.length - 1]

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-(--bg) text-(--text)">
      <RoomHeader
        roomName={roomName}
        roomCode={roomCode}
        participants={mockRoom.participants}
      />

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        {/* Editor + status bar */}
        <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-(--bg)">
          <div className="relative min-h-0 flex-1 overflow-hidden">
            <CodeEditor
              value={editorCode}
              onChange={setEditorCode}
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
                {mockRoom.participants.length}
              </span>
            </div>
            <div className="mt-3.5">
              <ParticipantsList participants={mockRoom.participants} />
            </div>
          </div>

          <div className="flex min-h-0 flex-1 flex-col border-t border-(--border)">
            <ChatPanel messages={messages} onSendMessage={handleSendMessage} />
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
                    {mockRoom.participants.length}
                  </span>
                </div>
                <div className="mt-3">
                  <ParticipantsList
                    participants={mockRoom.participants}
                    variant="chips"
                  />
                </div>
              </div>

              <div className="flex min-h-0 flex-1 flex-col border-t border-(--border)">
                <ChatPanel
                  messages={messages}
                  onSendMessage={handleSendMessage}
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
                      {lastMessage.author}: {lastMessage.text}
                    </span>
                  ) : null}
                </span>
                <span className="ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-full border border-(--border) bg-(--bg) px-3 py-1.5 text-xs font-medium text-(--text)">
                  <span className="h-1.5 w-1.5 rounded-full bg-(--accent)" />
                  {mockRoom.participants.length} online
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
