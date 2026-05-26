import { User } from 'lucide-react'
import { cn } from '@/lib/utils'

type Size    = 'sm' | 'md' | 'lg'
type Variant = 'icon' | 'initials'

interface AvatarProps {
  name?:     string
  size?:     Size
  variant?:  Variant
  className?: string
}

const SIZES: Record<Size, { wrapper: string; icon: number; text: string }> = {
  sm: { wrapper: 'w-7 h-7',  icon: 13, text: 'text-[10px]' },
  md: { wrapper: 'w-10 h-10', icon: 16, text: 'text-sm'    },
  lg: { wrapper: 'w-12 h-12', icon: 20, text: 'text-base'  },
}

function getInitials(name: string): string {
  const parts = name.trim().split(' ')
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

export default function Avatar({ name, size = 'md', variant, className }: AvatarProps) {
  const s = SIZES[size]
  const resolvedVariant = variant ?? (name ? 'initials' : 'icon')

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full shrink-0',
        'bg-surface-alt ring-[0.75px] ring-black/[0.08]',
        s.wrapper,
        className,
      )}
    >
      {resolvedVariant === 'initials' && name ? (
        <span className={cn('font-semibold text-text-tertiary leading-none', s.text)}>
          {getInitials(name)}
        </span>
      ) : (
        <User size={s.icon} className="text-text-tertiary" />
      )}
    </div>
  )
}
