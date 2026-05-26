import { type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?:      string
  leadingIcon?: LucideIcon
  error?:      string
  hint?:       string
}

export default function Input({
  label,
  leadingIcon: LeadingIcon,
  error,
  hint,
  className,
  id,
  ...props
}: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-semibold text-text-secondary"
        >
          {label}
        </label>
      )}

      <div className="relative">
        {LeadingIcon && (
          <LeadingIcon
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
          />
        )}
        <input
          {...props}
          id={inputId}
          className={cn(
            'w-full py-2.5 text-sm bg-white border rounded-lg transition-colors',
            'placeholder:text-text-placeholder',
            'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'shadow-xs',
            error
              ? 'border-status-anomaly focus:ring-status-anomaly/20 focus:border-status-anomaly'
              : 'border-border-strong',
            LeadingIcon ? 'pl-9 pr-3.5' : 'px-3.5',
            className,
          )}
        />
      </div>

      {error && (
        <p className="text-xs text-status-anomaly leading-[18px]">{error}</p>
      )}
      {hint && !error && (
        <p className="text-xs text-text-muted leading-[18px]">{hint}</p>
      )}
    </div>
  )
}
