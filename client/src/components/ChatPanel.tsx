import { useEffect, useRef, useState, type FormEvent } from 'react'
import type { ChatMessage } from '../types/room'
import { UserAvatar } from './UserAvatar'

type ChatPanelProps = {
  messages: ChatMessage[]
  currentUserId: string | null
  onSendMessage: (text: string) => void
  disabled?: boolean
  showHeading?: boolean
}

export function ChatPanel({
  messages,
  currentUserId,
  onSendMessage,
  disabled = false,
  showHeading = true,
}: ChatPanelProps) {
  const [draft, setDraft] = useState('')
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = listRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [messages.length])

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    const text = draft.trim()
    if (!text || disabled) return
    onSendMessage(text)
    setDraft('')
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div
        ref={listRef}
        className="thin-scroll min-h-0 flex-1 overflow-y-auto px-5 py-4"
      >
        {showHeading ? (
          <h3 className="text-[13px] font-semibold text-(--text)">Chat</h3>
        ) : null}

        {messages.length === 0 ? (
          <p
            className={`${showHeading ? 'mt-4' : ''} text-sm text-(--text-muted)`}
          >
            No messages yet. Say hi to start the conversation.
          </p>
        ) : (
          <ul className={`${showHeading ? 'mt-4' : ''} space-y-5`}>
            {messages.map((message) => {
              const isYou = Boolean(
                currentUserId && message.authorId === currentUserId,
              )

              return (
                <li key={message.id} className="flex gap-2.5">
                  <UserAvatar name={isYou ? 'You' : message.author} />
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px]">
                      <span className="font-semibold text-(--text)">
                        {isYou ? 'You' : message.author}
                      </span>
                      <span className="ml-1.5 text-[11px] text-(--text-muted)">
                        {message.time}
                      </span>
                    </p>
                    <p
                      className={`mt-1.5 rounded-xl rounded-tl-md px-3 py-2 text-sm leading-relaxed text-(--text) ${
                        isYou ? 'bg-(--accent)/15' : 'bg-(--bg-soft)'
                      }`}
                    >
                      {message.text}
                    </p>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex shrink-0 gap-2 border-t border-(--border) p-4"
      >
        <input
          type="text"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={disabled ? 'Reconnecting…' : 'Message the room'}
          aria-label="Message the room"
          disabled={disabled}
          maxLength={1000}
          className="min-w-0 flex-1 rounded-lg border border-(--border) bg-(--bg) px-3.5 py-2.5 text-sm text-(--text) outline-none placeholder:text-(--text-muted) focus:border-(--accent) disabled:opacity-60"
        />
        <button
          type="submit"
          aria-label="Send message"
          disabled={disabled}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-(--border) bg-(--bg) text-(--accent) hover:border-(--accent) disabled:opacity-60"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <path d="M3.4 20.4 21.85 12 3.4 3.6l-.01 6.53L14 12 3.39 13.87l.01 6.53Z" />
          </svg>
        </button>
      </form>
    </div>
  )
}
