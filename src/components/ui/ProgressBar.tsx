import { cn } from '@/lib/utils'

type Size    = 'sm' | 'md'
type Variant = 'brand' | 'success' | 'warning' | 'error'

interface ProgressBarProps {
  value:      number   // 0–100
  size?:      Size
  variant?:   Variant
  showLabel?: boolean
  className?: string
}

const SIZES: Record<Size, string> = {
  sm: 'h-1.5',
  md: 'h-2',
}

const FILL_VARIANTS: Record<Variant, string> = {
  brand:   'bg-primary',
  success: 'bg-status-completed',
  warning: 'bg-status-inprogress',
  error:   'bg-status-anomaly',
}

export default function ProgressBar({
  value,
  size     = 'md',
  variant  = 'brand',
  showLabel = false,
  className,
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value))

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className={cn('flex-1 bg-surface-alt rounded-full overflow-hidden', SIZES[size])}>
        <div
          className={cn('h-full rounded-full transition-all', FILL_VARIANTS[variant])}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-sm font-medium text-text-secondary tabular-nums w-9 shrink-0 text-right">
          {clamped}%
        </span>
      )}
    </div>
  )
}
