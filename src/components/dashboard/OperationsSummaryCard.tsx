'use client'

import { useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { workflows } from '@/data/workflows'
import { cn } from '@/lib/utils'

const activeWorkflows = workflows.filter((w) => w.status === 'active')
const activeBagsTotal     = activeWorkflows.reduce((s, w) => s + w.bagsTotal, 0)
const activeBagsCompleted = activeWorkflows.reduce((s, w) => s + w.bagsCompleted, 0)
const avgCompletion = activeBagsTotal > 0
  ? Math.round((activeBagsCompleted / activeBagsTotal) * 100)
  : 0

export default function OperationsSummaryCard() {
  const [lastRefreshed, setLastRefreshed] = useState<string>('Il y a 3 min')
  const [spinning,      setSpinning]      = useState(false)

  function handleRefresh() {
    setSpinning(true)
    setTimeout(() => {
      setLastRefreshed('À l\'instant')
      setSpinning(false)
    }, 700)
  }

  return (
    <div className="bg-white border border-border rounded-xl overflow-hidden">

      {/* En-tête */}
      <div className="px-4 py-3 border-b border-border flex items-center gap-2">
        <span className="text-sm font-semibold text-text-primary flex-1">Résumé global</span>
        <span className="text-xs text-text-muted">{lastRefreshed}</span>
        <button
          onClick={handleRefresh}
          title="Actualiser"
          className="flex items-center justify-center w-6 h-6 rounded-md text-text-muted hover:text-text-secondary hover:bg-surface transition-colors"
        >
          <RefreshCw size={12} className={cn(spinning && 'animate-spin')} />
        </button>
      </div>

      {/* Synthèse multi-workflow */}
      <div className="px-4 py-4 border-b border-border space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-2xl font-bold tabular-nums text-text-primary leading-tight">
              {activeWorkflows.length}
            </p>
            <p className="text-xs text-text-muted mt-0.5">
              processus actif{activeWorkflows.length > 1 ? 's' : ''}
            </p>
          </div>
          <div>
            <p className="text-2xl font-bold tabular-nums text-primary leading-tight">
              {avgCompletion}%
            </p>
            <p className="text-xs text-text-muted mt-0.5">taux d'achèvement moyen</p>
          </div>
        </div>
        <div className="space-y-1">
          <div className="h-1.5 bg-surface rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${avgCompletion}%` }}
            />
          </div>
          <p className="text-[11px] text-text-muted">
            {activeBagsCompleted} / {activeBagsTotal} QR codes complétés sur les processus actifs
          </p>
        </div>
      </div>

      {/* Étapes critiques + délais estimés */}
    </div>
  )
}
