import { ReactNode } from 'react'

interface HeaderProps {
  title: string
  description?: string
  actions?: ReactNode
}

export default function Header({ title, description, actions }: HeaderProps) {
  return (
    <div className="flex items-start justify-between px-6 pt-6 pb-5 border-b border-border bg-surface shrink-0">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-text-primary leading-8">{title}</h1>
        {description && (
          <p className="text-sm text-text-tertiary leading-5">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  )
}
