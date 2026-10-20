import { Link } from 'react-router-dom'
import type { MockRoom } from '../data/mockRooms'

type RoomListItemProps = {
  room: MockRoom
}

export function RoomListItem({ room }: RoomListItemProps) {
  return (
    <div className="flex items-center gap-3 px-5 py-4">
      <p className="min-w-0 flex-1 truncate text-[15px] font-medium text-(--text)">
        {room.name}
      </p>
      <span className="inline-flex h-9 shrink-0 items-center justify-center rounded-md border border-(--border) bg-(--bg-soft) px-3 font-mono text-xs font-medium tracking-widest text-(--text)">
        {room.code}
      </span>
      <Link
        to={`/room/${room.code}`}
        className="inline-flex h-9 shrink-0 items-center justify-center rounded-lg border border-(--border) bg-transparent px-4 text-sm font-medium text-(--text) hover:border-(--accent)"
      >
        Open
      </Link>
    </div>
  )
}
