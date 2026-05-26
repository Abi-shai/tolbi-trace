import Link from 'next/link'
import { ArrowLeft, CheckCircle2, Clock, Circle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { QRCode } from '@/types/qr-code'
import type { BagEvent } from '@/types/bag-event'

const TOTAL_STEPS = 5
const STEP_NAMES = [
  'Collecte chez le producteur',
  'Pesée et contrôle humidité',
  'Chargement transport',
  'Réception entrepôt',
  'Contrôle qualité final',
]

function stepState(stepOrder: number, currentStep: number) {
  if (stepOrder < currentStep)  return 'done'
  if (stepOrder === currentStep) return 'current'
  return 'pending'
}

export default function BagDetail({ bag, events, workflowId }: { bag: QRCode; events: BagEvent[]; workflowId: string }) {
  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden">

      {/* Header */}
      <div className="flex items-start justify-between px-6 pt-6 pb-5 border-b border-border bg-surface shrink-0">
        <div className="flex items-start gap-4">
          <Link
            href={`/workflows/${workflowId}/qr-codes`}
            className="flex items-center justify-center w-8 h-8 rounded-lg border border-border text-text-tertiary hover:bg-white hover:text-text-secondary transition-colors mt-0.5 shrink-0"
          >
            <ArrowLeft size={15} />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-text-primary font-mono leading-8 mb-1">{bag.code}</h1>
            <p className="text-sm text-text-tertiary">
              {bag.producerName
                ? <>{bag.producerName} · {bag.cooperativeName}</>
                : 'Producteur non attribué'
              }
            </p>
          </div>
        </div>

        {/* Step progress chips */}
        <div className="flex items-center gap-1.5 shrink-0">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => {
            const state = stepState(i + 1, bag.currentStep)
            return (
              <div
                key={i}
                className={cn(
                  'flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-colors',
                  state === 'done'    && 'bg-primary text-white',
                  state === 'current' && 'bg-primary text-white ring-2 ring-primary/30',
                  state === 'pending' && 'bg-surface-alt text-text-muted border border-border',
                )}
              >
                {i + 1}
              </div>
            )
          })}
          <span className="ml-2 text-sm text-text-tertiary">
            Étape {bag.currentStep}/{TOTAL_STEPS}
          </span>
        </div>
      </div>

      <main className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-3xl">

          {/* Info card */}
          <div className="bg-white border border-border rounded-xl mb-8 flex items-stretch divide-x divide-border">
            <div className="flex-1 min-w-0 px-5 py-4">
              <p className="text-xs text-text-tertiary mb-1">Code QR</p>
              <p className="text-sm font-mono font-semibold text-text-primary">{bag.code}</p>
            </div>
            <div className="flex-1 min-w-0 px-5 py-4">
              <p className="text-xs text-text-tertiary mb-1">Producteur</p>
              <p className="text-sm font-semibold text-text-primary">{bag.producerName ?? '—'}</p>
            </div>
            <div className="flex-1 min-w-0 px-5 py-4">
              <p className="text-xs text-text-tertiary mb-1">Processus</p>
              <p className="text-sm font-semibold text-text-primary">Collecte maïs 2025</p>
            </div>
          </div>

          {/* Timeline */}
          <div className="relative">
            <div className="absolute left-[15px] top-4 bottom-4 w-px bg-border" />

            <ol className="space-y-0">
              {Array.from({ length: TOTAL_STEPS }, (_, i) => {
                const order = i + 1
                const event = events.find((e) => e.stepOrder === order)
                const state = stepState(order, bag.currentStep)

                return (
                  <li key={order} className="relative flex gap-5 pb-8 last:pb-0">
                    {/* Step dot */}
                    <div className="relative z-10 shrink-0 mt-0.5">
                      {state === 'done' && (
                        <div className="flex items-center justify-center w-[30px] h-[30px] rounded-full bg-primary">
                          <CheckCircle2 size={14} className="text-white" />
                        </div>
                      )}
                      {state === 'current' && (
                        <div className="flex items-center justify-center w-[30px] h-[30px] rounded-full bg-primary ring-4 ring-primary/15">
                          <Clock size={13} className="text-white" />
                        </div>
                      )}
                      {state === 'pending' && (
                        <div className="flex items-center justify-center w-[30px] h-[30px] rounded-full bg-white border-2 border-border">
                          <Circle size={10} className="text-text-muted" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className={cn(
                        'flex items-center justify-between gap-2 mb-1',
                        state === 'pending' && 'opacity-40',
                      )}>
                        <p className="text-sm font-semibold text-text-primary">
                          {STEP_NAMES[i]}
                        </p>
                        {event && (
                          <span className="text-xs text-text-muted shrink-0">{event.timestamp}</span>
                        )}
                      </div>

                      {event ? (
                        <div className="bg-white border border-border rounded-lg px-4 py-3">
                          <p className="text-xs text-text-tertiary mb-2">
                            {event.agentName} · {event.agentRole}
                          </p>
                          <dl className="space-y-1.5">
                            {event.entries.map((entry) => (
                              <div key={entry.label} className="flex items-baseline justify-between gap-3">
                                <dt className="text-xs text-text-tertiary shrink-0">{entry.label}</dt>
                                <dd className="text-xs font-semibold text-text-primary text-right">{entry.value}</dd>
                              </div>
                            ))}
                          </dl>
                        </div>
                      ) : state !== 'pending' ? (
                        <div className="bg-white border border-border rounded-lg px-4 py-3">
                          <p className="text-xs text-text-muted">En cours de traitement…</p>
                        </div>
                      ) : (
                        <p className="text-xs text-text-muted mt-0.5">Non atteinte</p>
                      )}
                    </div>
                  </li>
                )
              })}
            </ol>
          </div>
        </div>
      </main>
    </div>
  )
}
