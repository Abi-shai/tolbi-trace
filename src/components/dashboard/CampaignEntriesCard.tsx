'use client'

import { useState } from 'react'
import { CheckCircle2, PlayCircle, ChevronRight, RefreshCw } from 'lucide-react'
import { stepProgress, recentEvents } from '@/data/dashboard'
import { cn } from '@/lib/utils'

const SHORT_NAMES = ['Collecte', 'Pesée', 'Chargement', 'Réception', 'Contrôle final']

const ACTION_CONFIG = {
  validated: { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50', label: 'Validé'  },
  started:   { icon: PlayCircle,   color: 'text-primary',  bg: 'bg-brand-50', label: 'Démarré' },
}

export default function CampaignEntriesCard() {
  const [activeStepId, setActiveStepId] = useState<string>('all')
  const [spinning,     setSpinning]     = useState(false)

  function handleRefresh() {
    setSpinning(true)
    setTimeout(() => setSpinning(false), 600)
  }

  const activeStep = stepProgress.find((s) => s.stepId === activeStepId)

  const filtered = activeStepId === 'all'
    ? recentEvents
    : recentEvents.filter((e) => activeStep && e.stepName === activeStep.name)

  return (
    <div className="bg-white border border-border rounded-xl overflow-hidden flex flex-col">

      {/* Header */}
      <div className="px-5 py-4 border-b border-border flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-semibold text-text-primary">Informations sur la campagne</h2>
          <p className="text-xs text-text-tertiary mt-0.5">Activité récente par étape</p>
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center justify-center w-7 h-7 rounded-lg text-text-muted hover:text-text-secondary hover:bg-surface transition-colors shrink-0"
        >
          <RefreshCw size={13} className={cn(spinning && 'animate-spin')} />
        </button>
      </div>

      {/* Tab bar */}
      <div className="flex items-center gap-0 px-5 pt-3 border-b border-border overflow-x-auto">
        <TabButton
          label="Tous"
          active={activeStepId === 'all'}
          count={recentEvents.length}
          onClick={() => setActiveStepId('all')}
        />
        {stepProgress.map((step, i) => {
          const count = recentEvents.filter((e) => e.stepName === step.name).length
          return (
            <TabButton
              key={step.stepId}
              label={SHORT_NAMES[i]}
              active={activeStepId === step.stepId}
              count={count}
              hasActivity={step.bagsInProgress > 0}
              onClick={() => setActiveStepId(step.stepId)}
            />
          )
        })}
      </div>

      {/* Step summary strip */}
      {activeStep && (
        <div className="flex items-center gap-4 px-5 py-2.5 bg-surface border-b border-border">
          <Pill color="green"  value={activeStep.bagsCompleted}  label="validés"  />
          {activeStep.bagsInProgress > 0 && (
            <Pill color="orange" value={activeStep.bagsInProgress} label="en cours" />
          )}
          <span className="text-[11px] text-text-muted ml-auto">{activeStep.agentRole}</span>
        </div>
      )}

      {/* Entries list */}
      {filtered.length === 0 ? (
        <div className="px-5 py-8 text-center">
          <p className="text-sm text-text-muted">Aucune activité pour cette étape</p>
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {filtered.map((event) => {
            const cfg  = ACTION_CONFIG[event.action]
            const Icon = cfg.icon

            return (
              <li
                key={event.id}
                className="flex items-center gap-3 px-5 py-3 hover:bg-surface cursor-pointer transition-colors group"
              >
                <div className={cn('flex items-center justify-center w-7 h-7 rounded-lg shrink-0', cfg.bg)}>
                  <Icon size={13} className={cfg.color} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-semibold text-text-primary">
                      {event.bagCode}
                    </span>
                    <span className="text-[10px] text-text-muted">·</span>
                    <span className="text-xs text-text-secondary truncate">
                      {event.stepName}
                    </span>
                  </div>
                  <p className="text-xs text-text-tertiary mt-0.5">
                    {event.agentName} · {event.timestamp}
                  </p>
                </div>

                <ChevronRight
                  size={14}
                  className="text-text-muted shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

// ── helpers ───────────────────────────────────────────────────────────────────

function TabButton({
  label, active, count, hasActivity, onClick,
}: {
  label: string
  active: boolean
  count: number
  hasActivity?: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-1.5 px-3 py-2 text-xs font-medium whitespace-nowrap border-b-2 transition-colors',
        active
          ? 'border-primary text-primary'
          : 'border-transparent text-text-muted hover:text-text-secondary hover:border-border',
      )}
    >
      {label}
      {count > 0 && (
        <span className={cn(
          'flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-semibold',
          active ? 'bg-brand-50 text-primary' : 'bg-surface text-text-muted',
        )}>
          {count}
        </span>
      )}
      {hasActivity && (
        <span className="w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0" />
      )}
    </button>
  )
}

function Pill({ color, value, label }: { color: 'green' | 'orange'; value: number; label: string }) {
  const styles = { green: 'text-green-700', orange: 'text-orange-600' }
  return (
    <span className="flex items-center gap-1 text-[11px]">
      <span className={cn('font-semibold tabular-nums', styles[color])}>{value}</span>
      <span className="text-text-muted">{label}</span>
    </span>
  )
}
