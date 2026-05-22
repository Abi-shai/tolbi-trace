import { cn } from '@/lib/utils'
import type { StepProgress } from '@/data/dashboard'

export default function StepProgressList({ steps }: { steps: StepProgress[] }) {
  return (
    <div className="bg-white border border-border rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-text-primary">Progression par étape</h2>
          <p className="text-xs text-text-tertiary mt-0.5">Sacs validés et en cours</p>
        </div>
        <span className="text-[11px] text-text-muted shrink-0">Sync il y a 2 min</span>
      </div>

      <div className="divide-y divide-border">
        {steps.map((step) => {
          const knownTotal = step.bagsTotal > 0
          const pct = knownTotal ? Math.round((step.bagsCompleted / step.bagsTotal) * 100) : 0
          const inProgressPct = knownTotal ? Math.round((step.bagsInProgress / step.bagsTotal) * 100) : 0

          return (
            <div key={step.stepId} className="px-5 py-4">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-brand-50 text-primary text-xs font-bold shrink-0">
                    {step.order}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">{step.name}</p>
                    <p className="text-xs text-text-tertiary">{step.agentRole}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0 text-right">
                  {knownTotal ? (
                    <span className="text-xs text-text-tertiary">
                      <span className="font-semibold text-text-primary">{step.bagsCompleted}</span>/{step.bagsTotal} sacs
                    </span>
                  ) : (
                    <span className="text-xs text-text-tertiary">
                      <span className="font-semibold text-text-primary">{step.bagsCompleted + step.bagsInProgress}</span> enregistrés
                    </span>
                  )}
                </div>
              </div>

              {knownTotal && (
                <div className="h-2 bg-surface-alt rounded-full overflow-hidden">
                  <div className="h-full flex">
                    {pct > 0 && (
                      <div
                        className="h-full bg-primary rounded-l-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    )}
                    {inProgressPct > 0 && (
                      <div
                        className={cn('h-full bg-orange-400 transition-all', pct === 0 && 'rounded-l-full')}
                        style={{ width: `${inProgressPct}%` }}
                      />
                    )}
                  </div>
                </div>
              )}

              <div className={cn('flex items-center gap-4', knownTotal ? 'mt-2' : '')}>
                <span className="flex items-center gap-1.5 text-xs text-text-tertiary">
                  <span className="w-2 h-2 rounded-full bg-primary inline-block" />
                  {step.bagsCompleted} validés
                </span>
                {step.bagsInProgress > 0 && (
                  <span className="flex items-center gap-1.5 text-xs text-text-tertiary">
                    <span className="w-2 h-2 rounded-full bg-orange-400 inline-block" />
                    {step.bagsInProgress} en cours
                  </span>
                )}
                {knownTotal && (
                  <span className="ml-auto text-xs font-semibold text-text-secondary">{pct}%</span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
