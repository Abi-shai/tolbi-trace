import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { stepProgress } from '@/data/dashboard'

const SHORT_NAMES = ['Collecte', 'Pesée', 'Chargement', 'Réception', 'Contrôle final']
const STEP_DATES  = ['12 nov.', '13 nov.', '14 nov.', '15 nov.', '14 nov.']

type StepStatus = 'complete' | 'active' | 'upcoming'

function getStatus(bagsCompleted: number, bagsInProgress: number): StepStatus {
  if (bagsInProgress > 0) return 'active'
  if (bagsCompleted > 0)  return 'complete'
  return 'upcoming'
}

function bagCountLabel(order: number, completed: number, inProgress: number, total: number): string {
  const status = getStatus(completed, inProgress)
  if (status === 'upcoming') return 'En attente'
  if (order === 1)           return `${completed + inProgress} sacs`
  if (status === 'complete') return `${completed} sacs validés`
  return `${completed} / ${total} sacs`
}

export default function ProcessStepper() {
  const n = stepProgress.length
  const statuses = stepProgress.map((s) => getStatus(s.bagsCompleted, s.bagsInProgress))

  // Rightmost non-upcoming step — determines green fill %
  const lastFilledIdx = statuses.reduce((last, s, i) => (s !== 'upcoming' ? i : last), -1)
  // Track container spans from center of first circle to center of last (inset-x-3 = 12px).
  // Green fill is a % of that track container: k/(n-1) × 100%
  const greenPct = lastFilledIdx >= 0 ? (lastFilledIdx / (n - 1)) * 100 : 0

  // Deepest active step gets the glow ring and brand text colours
  const glowIdx = statuses.reduce((last, s, i) => (s === 'active' ? i : last), -1)

  return (
    <div className="bg-white border border-border rounded-xl p-4">

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <p className="text-lg font-semibold text-text-primary leading-7 shrink-0">
          Progression de la campagne
        </p>
        <span className="flex items-center px-2 py-0.5 rounded-full border text-xs font-medium bg-warning-bg border-warning-border text-warning-text">
          En cours
        </span>
      </div>

      {/* Stepper */}
      <div className="relative w-full">

        {/*
          Track container: left-3/right-3 = 12px = half of 24px circle.
          It sits exactly between the center of the first and last circle.
          The gray background fills it fully; the green div grows inside it.
        */}
        <div
          className="absolute h-[2px] bg-border overflow-hidden"
          style={{ top: '12px', left: '12px', right: '12px' }}
        >
          {greenPct > 0 && (
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${greenPct}%` }}
            />
          )}
        </div>

        {/* Circles — justify-between: first flush left, last flush right, rest evenly spaced */}
        <div className="flex justify-between relative z-10">
          {stepProgress.map((step, i) => {
            const status = statuses[i]
            const isGlow = i === glowIdx

            return (
              <div key={step.stepId} className={cn(
                'relative w-6 h-6 rounded-full overflow-hidden shrink-0',
                (status === 'complete' || status === 'active') ? 'bg-[#e6f0eb]' : 'bg-surface',
                isGlow && 'shadow-[0px_0px_0px_4px_rgba(5,96,51,0.24)]',
              )}>
                {status === 'complete' && (
                  <div className="absolute inset-0 rounded-full bg-primary flex items-center justify-center">
                    <Check size={12} className="text-white" strokeWidth={2.5} />
                  </div>
                )}
                {status === 'active' && (
                  <div className="absolute inset-0 rounded-full bg-primary flex items-center justify-center">
                    <span className="w-2 h-2 rounded-full bg-white" />
                  </div>
                )}
                {status === 'upcoming' && (
                  <div className="absolute inset-0 rounded-full border-[1.5px] border-border flex items-center justify-center">
                    <span className="w-2 h-2 rounded-full bg-status-offline" />
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/*
          Labels — same justify-between, each label cell is w-6 (matches the circle).
          Text overflows naturally: first=left, middle=center, last=right.
        */}
        <div className="flex justify-between mt-3">
          {stepProgress.map((step, i) => {
            const status  = statuses[i]
            const isGlow  = i === glowIdx
            const isFirst = i === 0
            const isLast  = i === n - 1

            const alignment = isFirst ? 'items-start text-left'
                            : isLast  ? 'items-end text-right'
                            :           'items-center text-center'

            return (
              <div key={step.stepId} className={cn('w-6 flex flex-col gap-1', alignment)}>
                <p className={cn(
                  'text-sm font-semibold leading-5 whitespace-nowrap',
                  isGlow                ? 'text-brand-700' :
                  status === 'upcoming' ? 'text-[#98a2b3]' :
                                          'text-text-secondary',
                )}>
                  {SHORT_NAMES[i]}
                </p>

                <p className={cn(
                  'text-sm leading-5 whitespace-nowrap',
                  isGlow                ? 'text-[#056033]' :
                  status === 'upcoming' ? 'text-text-disabled'  :
                                          'text-text-tertiary',
                )}>
                  {STEP_DATES[i]}
                </p>

                <p className={cn(
                  'text-xs tabular-nums whitespace-nowrap',
                  isGlow                ? 'text-[#056033] font-medium' :
                  status === 'complete' ? 'text-primary font-medium'   :
                  status === 'active'   ? 'text-text-tertiary'             :
                                          'text-text-disabled',
                )}>
                  {bagCountLabel(step.order, step.bagsCompleted, step.bagsInProgress, step.bagsTotal)}
                </p>

              </div>
            )
          })}
        </div>

      </div>
    </div>
  )
}
