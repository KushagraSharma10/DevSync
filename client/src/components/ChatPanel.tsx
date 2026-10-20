import { useState, type FormEvent } from 'react'
import type { MockChatMessage } from '../data/mockRoom'
import { UserAvatar } from './UserAvatar'

type ChatPanelProps = {
  messages: MockChatMessage[]
  onSendMessage: (text: string) => void
  showHeading?: boolean
}

export function ChatPanel({
  messages,
  onSendMessage,
  showHeading = true,
}: ChatPanelProps) {
  const [draft, setDraft] = useState('')

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    const text = draft.trim()
    if (!text) return
    onSendMessage(text)
    setDraft('')
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="thin-scroll min-h-0 flex-1 overflow-y-auto px-5 py-4">
        {showHeading ? (
          <h3 className="text-[13px] font-semibold text-(--text)">Chat</h3>
        ) : null}

        <ul className={`${showHeading ? 'mt-4' : ''} space-y-5`}>
          {messages.map((message) => {
            const isYou = message.author === 'You'

            return (
              <li key={message.id} className="flex gap-2.5">
                <UserAvatar name={message.author} />
                <div className="min-w-0 flex-1">
                  <p className="text-[13px]">
                    <span className="font-semibold text-(--text)">
                      {message.author}
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
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex shrink-0 gap-2 border-t border-(--border) p-4"
      >
        <input
          type="text"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Message the room"
          aria-label="Message the room"
          className="min-w-0 flex-1 rounded-lg border border-(--border) bg-(--bg) px-3.5 py-2.5 text-sm text-(--text) outline-none placeholder:text-(--text-muted) focus:border-(--accent)"
        />
        <button
          type="submit"
          aria-label="Send message"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-(--border) bg-(--bg) text-(--accent) hover:border-(--accent)"
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
