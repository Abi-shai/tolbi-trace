'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { QrCode, Search, Eye, Package, CheckCircle2, Clock } from 'lucide-react'
import Header from '@/components/layout/Header'
import MetricCard from '@/components/ui/MetricCard'
import QRCodeViewerModal from './QRCodeViewerModal'
import { useQRCodesStore } from '@/store/qr-codes'
import type { QRCode as QRCodeType } from '@/types/qr-code'
import { cn } from '@/lib/utils'

const STEP_LABELS = ['Collecte', 'Pesée', 'Chargement', 'Réception', 'Qualité']
const TOTAL_STEPS = 5

type Filter = 'all' | 1 | 2 | 3 | 4 | 5


function StepDots({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: TOTAL_STEPS }, (_, i) => {
        const step = i + 1
        return (
          <span
            key={step}
            className={cn(
              'w-2 h-2 rounded-full transition-colors',
              step <= currentStep ? 'bg-primary' : 'bg-border',
            )}
          />
        )
      })}
      <span className="ml-1 text-xs text-text-tertiary tabular-nums">
        {currentStep}/{TOTAL_STEPS}
      </span>
    </div>
  )
}

interface QRCodesClientProps {
  initialCodes: QRCodeType[]
  workflowId: string
}

export default function QRCodesClient({ initialCodes, workflowId }: QRCodesClientProps) {
  const { codes, initialized, initCodes } = useQRCodesStore()

  useEffect(() => {
    if (!initialized) initCodes(initialCodes)
  }, [initialized, initialCodes, initCodes])

  const [search,      setSearch]      = useState('')
  const [filter,      setFilter]      = useState<Filter>('all')
  const [viewingCode, setViewingCode] = useState<QRCodeType | null>(null)

  const activeCodes = initialized ? codes : initialCodes

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return activeCodes.filter((c) => {
      const matchSearch = !q ||
        c.code.toLowerCase().includes(q) ||
        c.producerName?.toLowerCase().includes(q)
      const matchFilter = filter === 'all' ? true : c.currentStep === filter
      return matchSearch && matchFilter
    })
  }, [activeCodes, search, filter])

  return (
    <>
      <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
        <Header
          title="QR Codes"
          description="Suivez les QR codes collectés par vos agents terrain."
        />

        <main className="flex-1 overflow-y-auto px-6 py-6 space-y-5">

          {/* Métriques */}
          <div className="flex gap-4 w-full">
            <MetricCard
              icon={Package}
              label="QR codes enregistrés"
              value={activeCodes.length}
            />
            <MetricCard
              icon={CheckCircle2}
              label="Complétés"
              value={activeCodes.filter((c) => c.currentStep === 5).length}
            />
            <MetricCard
              icon={Clock}
              label="En cours"
              value={activeCodes.filter((c) => c.currentStep > 1 && c.currentStep < 5).length}
            />
          </div>

          {/* Filtres */}
          <div className="flex items-center gap-3">
            <div className="relative w-[260px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher un code ou un producteur…"
                className="w-full pl-9 pr-3.5 py-2.5 text-sm bg-white border border-border-strong rounded-lg shadow-xs placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              />
            </div>

            <select
              value={String(filter)}
              onChange={(e) => setFilter(e.target.value === 'all' ? 'all' : Number(e.target.value) as Filter)}
              className="px-3 py-2 text-sm border border-border-strong rounded-lg bg-white text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors appearance-none cursor-pointer"
            >
              <option value="all">Toutes les étapes</option>
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>Étape {n}</option>
              ))}
            </select>

            <span className="text-xs text-text-muted ml-auto">
              {filtered.length} résultat{filtered.length > 1 ? 's' : ''}
            </span>
          </div>

          {/* Tableau */}
          <div className="bg-white border border-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-tertiary uppercase tracking-wider">Code</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-tertiary uppercase tracking-wider">Producteur</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-tertiary uppercase tracking-wider">Coopérative</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-tertiary uppercase tracking-wider">Progression</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-tertiary uppercase tracking-wider">Étape actuelle</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((qr) => (
                  <tr key={qr.id} className="hover:bg-surface/60 transition-colors group">
                    <td className="px-4 py-3">
                      <Link
                        href={`/workflows/${workflowId}/sacs/${qr.id}`}
                        className="font-mono text-sm font-medium text-text-primary hover:text-primary hover:underline transition-colors"
                      >
                        {qr.code}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      {qr.producerName
                        ? <span className="text-sm text-text-primary">{qr.producerName}</span>
                        : <span className="text-sm text-text-muted">—</span>
                      }
                    </td>
                    <td className="px-4 py-3">
                      {qr.cooperativeName
                        ? <span className="text-xs text-text-tertiary">{qr.cooperativeName}</span>
                        : <span className="text-sm text-text-muted">—</span>
                      }
                    </td>
                    <td className="px-4 py-3">
                      <StepDots currentStep={qr.currentStep} />
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-text-secondary">
                        {STEP_LABELS[qr.currentStep - 1]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setViewingCode(qr)}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-text-secondary border border-border rounded-md hover:bg-surface transition-colors"
                        >
                          <Eye size={13} />
                          Voir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center">
                      <QrCode size={24} className="mx-auto text-text-muted mb-2" />
                      <p className="text-sm font-medium text-text-secondary">Aucun QR code trouvé</p>
                      <p className="text-xs text-text-muted mt-1">Modifiez les filtres pour affiner la recherche.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      {viewingCode && (
        <QRCodeViewerModal
          qrCode={viewingCode}
          onClose={() => setViewingCode(null)}
        />
      )}
    </>
  )
}
