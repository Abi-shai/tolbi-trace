import { User, Clock, Wifi, WifiOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ActiveAgent } from '@/data/dashboard'

function parseMinutesAgo(lastSeen: string): number {
  const m = lastSeen.match(/Il y a (\d+) min/)
  return m ? parseInt(m[1], 10) : 999
}

function statusOf(lastSeen: string): 'active' | 'idle' | 'silent' {
  const min = parseMinutesAgo(lastSeen)
  if (min <= 10) return 'active'
  if (min <= 20) return 'idle'
  return 'silent'
}

const STATUS_DOT: Record<string, string> = {
  active: 'bg-green-500',
  idle:   'bg-orange-400',
  silent: 'bg-status-offline',
}

export default function AgentsNowCard({ agents }: { agents: ActiveAgent[] }) {
  return (
    <div className="bg-white border border-border rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div>
          <h2 className="text-sm font-semibold text-text-primary">Agents en ce moment</h2>
          <p className="text-xs text-text-tertiary mt-0.5">Activité terrain en temps réel</p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs font-medium text-green-700">{agents.length} actifs</span>
        </div>
      </div>

      <ul className="divide-y divide-border">
        {agents.map((agent) => {
          const status = statusOf(agent.lastSeen)
          const minAgo = parseMinutesAgo(agent.lastSeen)
          const pct    = Math.min(100, Math.round((agent.bagsScanned / agent.bagsTarget) * 100))
          const isSilent = status === 'silent'

          return (
            <li key={agent.id} className={cn('px-5 py-4', isSilent && 'bg-orange-50/40')}>
              <div className="flex items-start gap-3">

                {/* Avatar + status dot */}
                <div className="relative shrink-0">
                  <div className={cn(
                    'flex items-center justify-center w-9 h-9 rounded-full',
                    isSilent ? 'bg-[#fff3e0]' : 'bg-brand-50',
                  )}>
                    {isSilent
                      ? <WifiOff size={14} className="text-orange-500" />
                      : <User size={14} className="text-primary" />
                    }
                  </div>
                  <span className={cn(
                    'absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white',
                    STATUS_DOT[status],
                  )} />
                </div>

                <div className="flex-1 min-w-0">
                  {/* Name + last seen */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-text-primary leading-tight">{agent.name}</p>
                      <p className="text-xs text-text-tertiary truncate mt-0.5">{agent.currentStep}</p>
                    </div>
                    <div className={cn(
                      'flex items-center gap-1 shrink-0 text-[11px]',
                      isSilent ? 'text-orange-600 font-semibold' : 'text-text-muted',
                    )}>
                      <Clock size={10} />
                      {agent.lastSeen}
                    </div>
                  </div>

                  {/* Silence warning */}
                  {isSilent && (
                    <div className="mt-2 flex items-center gap-1.5 px-2.5 py-1.5 bg-orange-100 border border-orange-200 rounded-lg">
                      <WifiOff size={11} className="text-orange-600 shrink-0" />
                      <p className="text-xs font-semibold text-orange-700">
                        Silencieux depuis {minAgo} min — aucun scan enregistré
                      </p>
                    </div>
                  )}

                  {/* Progress bar */}
                  <div className="mt-2.5 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-text-muted">
                        {agent.bagsScanned} / {agent.bagsTarget} sacs aujourd'hui
                      </span>
                      <span className={cn(
                        'text-[11px] font-semibold',
                        pct >= 75 ? 'text-primary' : pct >= 50 ? 'text-text-secondary' : 'text-orange-500',
                      )}>
                        {pct}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-surface rounded-full overflow-hidden">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all duration-500',
                          pct >= 75 ? 'bg-primary' : 'bg-orange-400',
                        )}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
