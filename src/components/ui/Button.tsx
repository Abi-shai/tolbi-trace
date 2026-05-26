import { type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size    = 'sm' | 'md'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:  Variant
  size?:     Size
  icon?:     LucideIcon
  iconRight?: LucideIcon
  fullWidth?: boolean
}

const VARIANTS: Record<Variant, string> = {
  primary:   'bg-primary text-white hover:bg-primary-hover shadow-xs',
  secondary: 'bg-white border border-border-strong text-text-secondary hover:bg-surface shadow-xs',
  ghost:     'text-text-secondary hover:bg-surface',
  danger:    'bg-status-anomaly text-white hover:opacity-90 shadow-xs',
}

const SIZES: Record<Size, string> = {
  sm: 'px-3 py-2    text-sm gap-1',
  md: 'px-3.5 py-2.5 text-sm gap-1',
}

const ICON_SIZE: Record<Size, number> = { sm: 16, md: 16 }

export default function Button({
  variant  = 'primary',
  size     = 'md',
  icon: Icon,
  iconRight: IconRight,
  fullWidth = false,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      className={cn(
        'inline-flex items-center justify-center rounded-lg font-semibold transition-colors',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        VARIANTS[variant],
        SIZES[size],
        fullWidth && 'w-full',
        className,
      )}
    >
      {Icon      && <Icon      size={ICON_SIZE[size]} className="shrink-0" />}
      {children && <span className="px-[2px]">{children}</span>}
      {IconRight && <IconRight size={ICON_SIZE[size]} className="shrink-0" />}
    </button>
  )
}
