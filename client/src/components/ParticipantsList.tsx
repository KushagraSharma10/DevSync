import type { MockParticipant } from '../data/mockRoom'
import { UserAvatar } from './UserAvatar'

type ParticipantsListProps = {
  participants: MockParticipant[]
  variant?: 'list' | 'chips'
}

export function ParticipantsList({
  participants,
  variant = 'list',
}: ParticipantsListProps) {
  if (variant === 'chips') {
    return (
      <div className="flex gap-2 overflow-x-auto pb-1">
        {participants.map((participant) => (
          <span
            key={participant.id}
            className="inline-flex shrink-0 items-center gap-2 rounded-full border border-(--border) bg-(--bg) py-1.5 pr-3 pl-1.5 text-sm whitespace-nowrap text-(--text)"
          >
            <UserAvatar name={participant.name} size="sm" />
            {participant.name}
            {participant.isYou ? (
              <span className="rounded-full bg-(--accent)/10 px-1.5 py-0.5 text-[10px] font-medium text-(--accent)">
                you
              </span>
            ) : null}
          </span>
        ))}
      </div>
    )
  }

  return (
    <ul className="-mx-2 space-y-1">
      {participants.map((participant) => (
        <li
          key={participant.id}
          className="flex items-center gap-2.5 rounded-lg px-2 py-2 transition-colors hover:bg-(--bg-soft)"
        >
          <UserAvatar name={participant.name} showOnline />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm text-(--text)">
              {participant.name}
            </span>
            <span className="block text-[11px] text-(--text-muted)">Online</span>
          </span>
          {participant.isYou ? (
            <span className="shrink-0 rounded-full bg-(--accent)/10 px-2 py-0.5 text-[10px] font-medium text-(--accent)">
              you
            </span>
          ) : null}
        </li>
      ))}
    </ul>
  )
}
