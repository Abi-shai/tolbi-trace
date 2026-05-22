import { User, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ActiveAgent } from '@/data/dashboard'

function parseMinutesAgo(lastSeen: string): number {
  const m = lastSeen.match(/Il y a (\d+) min/)
  return m ? parseInt(m[1], 10) : 999
}

function onlineStatus(lastSeen: string): 'online' | 'away' | 'offline' {
  const min = parseMinutesAgo(lastSeen)
  if (min <= 10) return 'online'
  if (min <= 25) return 'away'
  return 'offline'
}

const STATUS_DOT: Record<string, string> = {
  online:  'bg-green-500',
  away:    'bg-orange-400',
  offline: 'bg-[#d0d5dd]',
}

export default function ActiveAgentsCard({ agents }: { agents: ActiveAgent[] }) {
  return (
    <div className="bg-white border border-border rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div>
          <h2 className="text-sm font-semibold text-text-primary">Agents actifs</h2>
          <p className="text-xs text-text-tertiary mt-0.5">Sur le terrain aujourd'hui</p>
        </div>
        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-green-50 text-green-700 text-xs font-bold">
          {agents.length}
        </span>
      </div>

      <ul className="divide-y divide-border">
        {agents.map((agent) => {
          const status = onlineStatus(agent.lastSeen)
          const pct = Math.min(100, Math.round((agent.bagsScanned / agent.bagsTarget) * 100))

          return (
            <li key={agent.id} className="px-5 py-3.5">
              <div className="flex items-start gap-3">
                <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-brand-50 shrink-0">
                  <User size={14} className="text-primary" />
                  <span className={cn(
                    'absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white',
                    STATUS_DOT[status],
                  )} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-text-primary leading-tight">{agent.name}</p>
                    <span className="flex items-center gap-1 text-[11px] text-text-muted shrink-0">
                      <Clock size={9} />
                      {agent.lastSeen}
                    </span>
                  </div>
                  <p className="text-xs text-text-tertiary truncate mt-0.5">{agent.currentStep}</p>

                  {/* Progress bar */}
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-text-muted">
                        {agent.bagsScanned} / {agent.bagsTarget} sacs
                      </span>
                      <span className="text-[11px] font-semibold text-text-secondary">{pct}%</span>
                    </div>
                    <div className="h-1 bg-surface rounded-full overflow-hidden">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all duration-500',
                          pct >= 100 ? 'bg-primary' : pct >= 60 ? 'bg-primary' : 'bg-orange-400',
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
