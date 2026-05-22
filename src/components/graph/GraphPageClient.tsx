'use client'

import { useState, useRef } from 'react'
import { Download, ChevronDown, Network, Package } from 'lucide-react'
import Header from '@/components/layout/Header'
import GraphLoader from '@/components/graph/GraphLoader'
import { cn } from '@/lib/utils'
import type { GraphNode, GraphEdge } from '@/data/graph'
import { NODE_COLORS, STATUS_BORDER, type GraphExportFns } from '@/components/graph/GraphView'
import { getBagEvents } from '@/data/bag-events'

// ─── Constants ────────────────────────────────────────────────────────────────

const LEGEND_NODES = [
  { type: 'step'        as const, label: 'Étape'      },
  { type: 'bag'         as const, label: 'Sac'         },
  { type: 'producer'    as const, label: 'Producteur'  },
  { type: 'agent'       as const, label: 'Agent'       },
  { type: 'cooperative' as const, label: 'Coopérative' },
]

const STATUS_LEGEND = [
  { color: STATUS_BORDER.done,        label: 'Terminée'   },
  { color: STATUS_BORDER.in_progress, label: 'En cours'   },
  { color: STATUS_BORDER.pending,     label: 'En attente' },
  { color: STATUS_BORDER.blocked,     label: 'Bloquée'    },
]

const EDGE_LEGEND = [
  { color: '#056033', dash: false, label: 'Séquence workflow'  },
  { color: '#ea580c', dash: true,  label: 'Sac → Étape'        },
  { color: '#93c5fd', dash: true,  label: 'Sac → Producteur'   },
  { color: '#9ca3af', dash: true,  label: 'Agent → Étape'      },
  { color: '#c4b5fd', dash: true,  label: 'Producteur → Coop'  },
]

const EXPORT_OPTIONS: { label: string; desc: string; key: keyof GraphExportFns }[] = [
  { label: 'Image PNG',    desc: 'Haute résolution ×2',  key: 'png' },
  { label: 'Image SVG',    desc: 'Vectoriel',             key: 'svg' },
  { label: 'Document PDF', desc: 'Via impression',        key: 'pdf' },
]

// ─── Component ────────────────────────────────────────────────────────────────

type ViewMode = 'workflow' | 'focus'

export default function GraphPageClient({ nodes, edges }: { nodes: GraphNode[]; edges: GraphEdge[] }) {
  const [showExport, setShowExport]       = useState(false)
  const [mode, setMode]                   = useState<ViewMode>('workflow')
  const [selected, setSelected]           = useState<GraphNode | null>(null)
  const [sacBtnRect, setSacBtnRect]       = useState<DOMRect | null>(null)
  const exportRef = useRef<GraphExportFns | null>(null)

  const isBagSelected = selected?.type === 'bag'

  function handleNodeSelect(node: GraphNode | null) {
    setSelected(node)
    if (!node || node.type !== 'bag') {
      setMode('workflow')
    } else {
      setMode('focus')
    }
  }

  function switchToFocus() {
    if (isBagSelected) setMode('focus')
  }

  function switchToWorkflow() {
    setMode('workflow')
  }

  // ─── Bag detail ─────────────────────────────────────────────────────────────

  const bagDetail = (() => {
    if (!selected || selected.type !== 'bag') return null
    const qrId       = selected.id.replace('bag-', 'qr-')
    const scanEdge   = edges.find((e) => e.source === selected.id && e.type === 'scanned_at')
    const currentStep = scanEdge ? parseInt(scanEdge.target.replace('step-', ''), 10) : 1
    const events     = getBagEvents(qrId, currentStep)
    const belongsEdge = edges.find((e) => e.source === selected.id && e.type === 'belongs_to')
    const producer   = belongsEdge ? nodes.find((n) => n.id === belongsEdge.target) : null
    const code       = `KLK-2025-${qrId.replace('qr-', '')}`
    return { qrId, currentStep, events, producer, code }
  })()

  // ─── Export dropdown ─────────────────────────────────────────────────────────

  const exportActions = (
    <div className="relative">
      <button
        onClick={() => setShowExport((v) => !v)}
        className="flex items-center gap-1.5 px-3 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-hover transition-colors shadow-xs"
      >
        <Download size={15} />
        Exporter
        <ChevronDown size={14} className={cn('transition-transform', showExport && 'rotate-180')} />
      </button>
      {showExport && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setShowExport(false)} />
          <div className="absolute right-0 top-[calc(100%+4px)] bg-white border border-border rounded-lg shadow-lg overflow-hidden z-20 w-44">
            {EXPORT_OPTIONS.map(({ label, desc, key }) => (
              <button
                key={key}
                onClick={() => { exportRef.current?.[key](); setShowExport(false) }}
                className="flex flex-col items-start w-full px-3 py-2.5 text-left hover:bg-surface transition-colors border-b border-border last:border-0"
              >
                <span className="text-xs font-semibold text-text-primary">{label}</span>
                <span className="text-[10px] text-text-muted">{desc}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )

  // ─── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
      <Header
        title="Traçabilité"
        description="Visualise les relations entre sacs, producteurs, étapes et agents."
        actions={exportActions}
      />

      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* ── Left panel ────────────────────────────────────────────────────── */}
        <aside className="flex flex-col w-56 shrink-0 border-r border-border bg-white overflow-y-auto">

          {/* Mode toggle */}
          <div className="px-3 py-3 border-b border-border">
            <div className="flex bg-surface rounded-lg p-0.5 border border-border gap-0.5">
              <button
                onClick={switchToWorkflow}
                className={cn(
                  'flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-sm font-semibold transition-colors',
                  mode === 'workflow'
                    ? 'bg-white text-text-primary shadow-xs border border-border'
                    : 'text-text-tertiary hover:text-text-secondary',
                )}
              >
                <Network size={14} />
                Workflow
              </button>
              <button
                onClick={switchToFocus}
                onMouseEnter={(e) => !isBagSelected && setSacBtnRect((e.currentTarget as HTMLElement).getBoundingClientRect())}
                onMouseLeave={() => setSacBtnRect(null)}
                className={cn(
                  'flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-sm font-semibold transition-colors',
                  mode === 'focus'
                    ? 'bg-white text-text-primary shadow-xs border border-border'
                    : isBagSelected
                      ? 'text-text-tertiary hover:text-text-secondary'
                      : 'text-text-muted cursor-not-allowed',
                )}
              >
                <Package size={14} />
                Sac
              </button>
            </div>
          </div>

          {/* Workflow legends */}
          {mode === 'workflow' && (
            <>
              <div className="px-4 py-4 border-b border-border">
                <p className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wider mb-3">Nœuds</p>
                <ul className="space-y-2">
                  {LEGEND_NODES.map(({ type, label }) => (
                    <li key={type} className="flex items-center gap-2.5 text-xs text-text-secondary">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: NODE_COLORS[type] }} />
                      {label}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="px-4 py-4 border-b border-border">
                <p className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wider mb-3">Statut étapes</p>
                <ul className="space-y-2">
                  {STATUS_LEGEND.map(({ color, label }) => (
                    <li key={label} className="flex items-center gap-2 text-xs text-text-secondary">
                      <span className="w-2.5 h-2.5 rounded-[3px] border-2 shrink-0" style={{ borderColor: color }} />
                      {label}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="px-4 py-4">
                <p className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wider mb-3">Relations</p>
                <ul className="space-y-2">
                  {EDGE_LEGEND.map(({ color, dash, label }) => (
                    <li key={label} className="flex items-center gap-2.5">
                      <svg width="18" height="8" className="shrink-0">
                        <line x1="0" y1="4" x2="18" y2="4" stroke={color} strokeWidth="1.5" strokeDasharray={dash ? '4 3' : undefined} />
                      </svg>
                      <span className="text-[11px] text-text-tertiary">{label}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}

          {/* Selected node summary (workflow mode, non-bag) */}
          {selected && mode === 'workflow' && selected.type !== 'bag' && (
            <div className="px-4 py-4 border-t border-border">
              <p className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wider mb-3">Sélection</p>
              <div
                className="flex items-center justify-center w-9 h-9 rounded-full mb-2"
                style={{ backgroundColor: NODE_COLORS[selected.type] }}
              >
                <span className="text-white text-[10px] font-bold">
                  {selected.label.replace(/\n/g, ' ')[0]}
                </span>
              </div>
              <p className="text-sm font-semibold text-text-primary leading-tight">
                {selected.label.replace(/\n/g, ' ')}
              </p>
              <p className="text-xs text-text-tertiary capitalize mt-0.5">{selected.type}</p>
            </div>
          )}

          {/* Bag detail panel — focus mode only */}
          {mode === 'focus' && bagDetail && (
            <div className="flex flex-col flex-1 overflow-y-auto border-t border-border">
              {/* Bag header */}
              <div className="px-4 py-4 border-b border-border">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="flex items-center justify-center w-7 h-7 rounded-full shrink-0 text-white text-[9px] font-bold"
                    style={{ backgroundColor: NODE_COLORS.bag }}
                  >
                    S
                  </span>
                  <p className="text-sm font-mono font-semibold text-text-primary">{bagDetail.code}</p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-text-tertiary">Étape</span>
                    <span className="text-[11px] font-semibold text-text-primary">{bagDetail.currentStep} / 5</span>
                  </div>
                  {bagDetail.producer && (
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] text-text-tertiary">Producteur</span>
                      <span className="text-[11px] font-semibold text-text-primary truncate">
                        {bagDetail.producer.label.replace(/\n/g, ' ')}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Event history */}
              <div className="px-4 py-4">
                <p className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wider mb-4">
                  Historique
                </p>
                <ol className="relative flex flex-col gap-0">
                  {bagDetail.events.map((event, i) => (
                    <li key={event.id} className="relative pl-5 pb-4 last:pb-0">
                      {/* Dot */}
                      <div
                        className="absolute left-0 top-[3px] w-2.5 h-2.5 rounded-full border-2 border-white ring-1"
                        style={{ backgroundColor: NODE_COLORS.step, boxShadow: `0 0 0 1px ${NODE_COLORS.step}` }}
                      />
                      {/* Line */}
                      {i < bagDetail.events.length - 1 && (
                        <div className="absolute left-[4px] top-[14px] bottom-0 w-px bg-border" />
                      )}
                      <p className="text-[11px] font-semibold text-text-primary leading-snug">
                        {event.stepName}
                      </p>
                      <p className="text-[10px] text-text-secondary mt-0.5">{event.agentName}</p>
                      <p className="text-[10px] text-text-muted">{event.timestamp}</p>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          )}
        </aside>

        {/* ── Canvas ────────────────────────────────────────────────────────── */}
        <div className="relative flex-1 min-h-0">

          {/* Focus mode pill */}
          {mode === 'focus' && selected && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-white border border-border rounded-full px-4 py-1.5 shadow-sm flex items-center gap-2">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: NODE_COLORS.bag }}
              />
              <span className="text-xs text-text-secondary">
                Focus ·{' '}
                <span className="font-mono font-semibold text-text-primary">
                  {bagDetail?.code}
                </span>
              </span>
              <button
                onClick={() => handleNodeSelect(null)}
                className="text-xs text-text-muted hover:text-text-secondary transition-colors ml-1"
              >
                ✕
              </button>
            </div>
          )}

          <GraphLoader
            nodes={nodes}
            edges={edges}
            mode={mode}
            focusBagId={mode === 'focus' ? (selected?.id ?? null) : null}
            onNodeSelect={handleNodeSelect}
            onExportReady={(fns) => { exportRef.current = fns }}
          />
        </div>
      </div>

      {/* Tooltip "Vue Sac" — aucun sac sélectionné */}
      {sacBtnRect && (
        <div
          className="fixed z-50 pointer-events-none flex items-center gap-1.5"
          style={{ top: sacBtnRect.top + sacBtnRect.height / 2, left: sacBtnRect.right + 8, transform: 'translateY(-50%)' }}
        >
          <div style={{ width: 0, height: 0, borderTop: '5px solid transparent', borderBottom: '5px solid transparent', borderRight: '6px solid #101828' }} />
          <span className="bg-overlay text-white text-xs font-semibold px-2.5 py-1.5 rounded-md whitespace-nowrap shadow-lg">
            Sélectionne d'abord un sac sur le graphe
          </span>
        </div>
      )}
    </div>
  )
}
