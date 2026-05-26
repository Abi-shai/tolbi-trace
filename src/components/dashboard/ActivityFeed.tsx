'use client'

import { useState, useMemo } from 'react'
import { CheckCircle2, PlayCircle, ChevronDown, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { stepProgress, type RecentEvent } from '@/data/dashboard'

const ACTION_CONFIG = {
  validated: { label: 'Étape validée',  icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
  started:   { label: 'Étape démarrée', icon: PlayCircle,   color: 'text-primary',  bg: 'bg-brand-50' },
}

const ACTION_LABELS: Record<RecentEvent['action'], string> = {
  validated: 'Validé',
  started:   'Démarré',
}

const STEP_NAMES  = stepProgress.map((s) => s.name)


interface ActivityFeedProps {
  events: RecentEvent[]
  defaultExpanded?: boolean
}

export default function ActivityFeed({ events, defaultExpanded = true }: ActivityFeedProps) {
  const [expanded,        setExpanded]        = useState(defaultExpanded)
  const [filterStep,      setFilterStep]      = useState('')
  const [filterAgent,     setFilterAgent]     = useState('')
  const [filterAction,    setFilterAction]    = useState<RecentEvent['action'] | ''>('')
  const [filterDateStart, setFilterDateStart] = useState('')
  const [filterDateEnd,   setFilterDateEnd]   = useState('')

  const agentNames = useMemo(
    () => [...new Set(events.map((e) => e.agentName))],
    [events],
  )

  const filtered = useMemo(() => {
    return events.filter((ev) => {
      if (filterStep      && ev.stepName  !== filterStep)     return false
      if (filterAgent     && ev.agentName !== filterAgent)    return false
      if (filterAction    && ev.action    !== filterAction)   return false
      if (filterDateStart && ev.isoDate   <  filterDateStart) return false
      if (filterDateEnd   && ev.isoDate   >  filterDateEnd)   return false
      return true
    })
  }, [events, filterStep, filterAgent, filterAction, filterDateStart, filterDateEnd])

  const sorted = filtered

  const activeFilters = [
    filterStep      ? { key: 'step',  label: filterStep,                  clear: () => setFilterStep('')      } : null,
    filterAgent     ? { key: 'agent', label: filterAgent,                 clear: () => setFilterAgent('')     } : null,
    filterAction    ? { key: 'act',   label: ACTION_LABELS[filterAction], clear: () => setFilterAction('')    } : null,
    filterDateStart ? { key: 'ds',    label: `Depuis ${filterDateStart}`, clear: () => setFilterDateStart('') } : null,
    filterDateEnd   ? { key: 'de',    label: `Jusqu'au ${filterDateEnd}`, clear: () => setFilterDateEnd('')   } : null,
  ].filter(Boolean) as { key: string; label: string; clear: () => void }[]

  const hasFilters = activeFilters.length > 0

  function clearAll() {
    setFilterStep(''); setFilterAgent(''); setFilterAction('')
    setFilterDateStart(''); setFilterDateEnd('')
  }

  const selectClass = 'px-3 py-1.5 text-xs border border-border-strong rounded-lg bg-white text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors appearance-none cursor-pointer'

  return (
    <div className="bg-white border border-border rounded-xl overflow-hidden">

      {/* Header — collapsible */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 border-b border-border hover:bg-surface transition-colors text-left"
      >
        <div>
          <h2 className="text-sm font-semibold text-text-primary">Historique d'activité</h2>
          <p className="text-xs text-text-tertiary mt-0.5">Contexte chronologique des activités</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {hasFilters && (
            <span className="text-[10px] font-semibold px-1.5 py-0.5 bg-brand-50 text-primary border border-primary/20 rounded-full">
              {activeFilters.length} filtre{activeFilters.length > 1 ? 's' : ''}
            </span>
          )}
          <span className="text-xs text-text-muted">{sorted.length} év.</span>
          <ChevronDown
            size={14}
            className={cn('text-text-muted transition-transform', expanded && 'rotate-180')}
          />
        </div>
      </button>

      {expanded && (
        <>
          {/* Filtres inline */}
          <div className="px-5 py-3 border-b border-border bg-surface space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <select value={filterStep}   onChange={(e) => setFilterStep(e.target.value)}   className={selectClass}>
                <option value="">Toutes les étapes</option>
                {STEP_NAMES.map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
              <select value={filterAgent}  onChange={(e) => setFilterAgent(e.target.value)}  className={selectClass}>
                <option value="">Tous les agents</option>
                {agentNames.map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
              <select value={filterAction} onChange={(e) => setFilterAction(e.target.value as RecentEvent['action'] | '')} className={selectClass}>
                <option value="">Tous les statuts</option>
                {(Object.entries(ACTION_LABELS) as [RecentEvent['action'], string][]).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
              <div className="flex items-center gap-1.5 ml-auto">
                <span className="text-xs text-text-muted shrink-0">Période</span>
                <input type="date" value={filterDateStart} onChange={(e) => setFilterDateStart(e.target.value)}
                  className="px-2.5 py-1.5 text-xs border border-border-strong rounded-lg bg-white text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer" />
                <span className="text-xs text-text-muted">→</span>
                <input type="date" value={filterDateEnd}   onChange={(e) => setFilterDateEnd(e.target.value)}
                  className="px-2.5 py-1.5 text-xs border border-border-strong rounded-lg bg-white text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer" />
              </div>
              {hasFilters && (
                <button onClick={clearAll} className="text-xs text-text-muted hover:text-text-secondary transition-colors">
                  Effacer
                </button>
              )}
            </div>

            {hasFilters && (
              <div className="flex items-center gap-2 flex-wrap">
                {activeFilters.map((f) => (
                  <span key={f.key} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-brand-50 text-primary text-xs font-medium rounded-full border border-primary/20">
                    {f.label}
                    <button onClick={f.clear} className="flex items-center justify-center w-3.5 h-3.5 rounded-full hover:bg-primary/10">
                      <X size={9} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Feed */}
          {sorted.length === 0 ? (
            <div className="px-5 py-8 text-center">
              <p className="text-sm text-text-muted">Aucun événement correspondant</p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {sorted.map((event) => {
                const cfg = ACTION_CONFIG[event.action]
                const Icon = cfg.icon
                return (
                  <li key={event.id} className="flex items-start gap-3 px-5 py-3">
                    <div className={cn('flex items-center justify-center w-7 h-7 rounded-lg shrink-0 mt-0.5', cfg.bg)}>
                      <Icon size={13} className={cfg.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-mono font-semibold text-text-primary">{event.bagCode}</span>
                        <span className="text-xs text-text-muted shrink-0">{event.timestamp}</span>
                      </div>
                      <p className="text-xs text-text-secondary mt-0.5">{cfg.label} — {event.stepName}</p>
                      <p className="text-xs text-text-tertiary">par {event.agentName}</p>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </>
      )}
    </div>
  )
}
