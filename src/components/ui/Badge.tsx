import { cn } from '@/lib/utils'

type Variant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'neutral'

interface BadgeProps {
  children:  React.ReactNode
  variant?:  Variant
  dot?:      boolean
  className?: string
}

const VARIANTS: Record<Variant, string> = {
  default: 'bg-surface       text-text-secondary  border-border',
  success: 'bg-brand-50      text-primary         border-brand-50',
  warning: 'bg-warning-bg    text-warning-text    border-warning-border',
  error:   'bg-red-50        text-status-anomaly  border-red-200',
  info:    'bg-blue-50       text-blue-700        border-blue-200',
  neutral: 'bg-surface-alt   text-text-tertiary   border-border',
}

const DOT_VARIANTS: Record<Variant, string> = {
  default: 'bg-text-disabled',
  success: 'bg-primary',
  warning: 'bg-warning-text',
  error:   'bg-status-anomaly',
  info:    'bg-blue-500',
  neutral: 'bg-text-disabled',
}

export default function Badge({ children, variant = 'default', dot = false, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border',
        VARIANTS[variant],
        className,
      )}
    >
      {dot && (
        <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', DOT_VARIANTS[variant])} />
      )}
      {children}
    </span>
  )
}
