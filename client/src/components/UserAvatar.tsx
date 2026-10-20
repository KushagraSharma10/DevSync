type UserAvatarProps = {
  name: string
  size?: 'sm' | 'md'
  showOnline?: boolean
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

export function UserAvatar({
  name,
  size = 'md',
  showOnline = false,
}: UserAvatarProps) {
  const sizeClassName = size === 'sm' ? 'h-6 w-6 text-[9px]' : 'h-8 w-8 text-[11px]'

  return (
    <span className="relative shrink-0">
      <span
        className={`flex items-center justify-center rounded-full bg-(--accent)/15 font-semibold text-(--accent) ${sizeClassName}`}
        aria-hidden="true"
      >
        {getInitials(name)}
      </span>
      {showOnline ? (
        <span className="absolute right-0 bottom-0 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-(--bg-elevated)" />
      ) : null}
    </span>
  )
}
