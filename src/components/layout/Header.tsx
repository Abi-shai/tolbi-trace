import { ReactNode } from 'react'

interface HeaderProps {
  title: string
  description?: string
  actions?: ReactNode
}

export default function Header({ title, description, actions }: HeaderProps) {
  return (
    <div className="flex flex-col shrink-0 px-6 pt-6 gap-3">
      <div className={`flex justify-between gap-4 ${description ? 'items-start' : 'items-center'}`}>
        <div className="flex flex-col gap-0.5">
          <h1 className="text-2xl font-semibold text-text-primary leading-8">{title}</h1>
          {description && (
            <p className="text-sm text-text-tertiary leading-5">{description}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-3 shrink-0">{actions}</div>}
      </div>
      <div className="h-px bg-border" />
    </div>
  )
}

