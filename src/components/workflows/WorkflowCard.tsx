import Link from 'next/link'
import { CheckCircle2, Circle, Layers } from 'lucide-react'
import type { Workflow, WorkflowStatus } from '@/types/workflow'
import { cn } from '@/lib/utils'

function StatusBadge({ status }: { status: WorkflowStatus }) {
  const config = {
    active: { label: 'Actif',      className: 'bg-brand-50 text-primary' },
    draft:  { label: 'Brouillon',  className: 'bg-surface-alt text-text-tertiary' },
  }[status]

  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded text-xs font-medium', config.className)}>
      {config.label}
    </span>
  )
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default function WorkflowCard({ workflow }: { workflow: Workflow }) {
  const {
    name, description, stepCount, status, createdAt,
    bagsTotal, bagsCompleted, bagsInProgress,
  } = workflow

  return (
    <Link href={`/workflows/${workflow.id}`} className="block bg-white border border-border rounded-lg p-5 hover:border-border-strong hover:shadow-[0px_1px_4px_rgba(16,24,40,0.08)] transition-all cursor-pointer">
      {/* Titre + badge */}
      <div className="flex items-start justify-between gap-4 mb-2">
        <h2 className="text-sm font-semibold text-text-primary leading-5 min-w-0 truncate">{name}</h2>
        <StatusBadge status={status} />
      </div>

      {/* Description */}
      <p className="text-sm text-text-tertiary leading-5 line-clamp-2 mb-4">{description}</p>

      {/* Métadonnées */}
      <div className="flex items-center justify-between text-xs text-text-tertiary">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <Layers size={13} className="text-text-muted" />
            {stepCount} étape{stepCount > 1 ? 's' : ''}
          </span>

          {bagsTotal > 0 && (
            <div className="flex items-center gap-2.5">
              <span className="flex items-center gap-1 text-status-completed">
                <CheckCircle2 size={12} />
                {bagsCompleted}
              </span>
              <span className="flex items-center gap-1 text-status-inprogress">
                <Circle size={12} />
                {bagsInProgress}
              </span>
              <span className="text-border-strong">·</span>
              <span>{bagsTotal} sacs</span>
            </div>
          )}
        </div>

        <span className="text-text-muted">Créé le {formatDate(createdAt)}</span>
      </div>
    </Link>
  )
}
