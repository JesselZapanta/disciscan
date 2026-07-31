import { cn } from '@/lib/utils'

const STORAGE_URL = 'http://localhost:8000/storage'

export default function UserAvatar({ user, className, textClassName }) {
  const initials = (user?.name || '?')
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div
      className={cn(
        'bg-border overflow-hidden flex items-center justify-center font-bold text-primary font-mono shrink-0',
        className,
        textClassName
      )}
      aria-hidden="true"
    >
      {user?.profile ? (
        <img
          src={`${STORAGE_URL}/${user.profile}`}
          alt={user.name}
          className="w-full h-full object-cover"
        />
      ) : (
        initials
      )}
    </div>
  )
}
