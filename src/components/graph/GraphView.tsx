'use client'

import { useEffect, useRef, useCallback } from 'react'
import cytoscape, { type Core, type NodeSingular } from 'cytoscape'
// eslint-disable-next-line @typescript-eslint/no-require-imports
const svgPlugin = require('cytoscape-svg')
// eslint-disable-next-line @typescript-eslint/no-require-imports
const dagre = require('cytoscape-dagre')
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react'
import type { GraphNode, GraphEdge, NodeType } from '@/data/graph'

let pluginsRegistered = false

// ─── Constants ────────────────────────────────────────────────────────────────

const NODE_COLORS: Record<NodeType, string> = {
  cooperative: '#7c3aed',
  step:        '#056033',
  agent:       '#475467',
  producer:    '#2563eb',
  bag:         '#ea580c',
}

const STATUS_BORDER: Record<string, string> = {
  done:        '#17b26a',
  in_progress: '#f79009',
  pending:     '#98a2b3',
  blocked:     '#f04438',
}

const NODE_TYPE_LABELS: Record<string, string> = {
  bag:         'Sac',
  cooperative: 'Coopérative',
  producer:    'Producteur',
  agent:       'Agent',
  step:        'Étape',
}

// ─── Layout helpers ────────────────────────────────────────────────────────────

function computeWorkflowPositions(
  nodes: GraphNode[],
  edges: GraphEdge[],
): Record<string, { x: number; y: number }> {
  const pos: Record<string, { x: number; y: number }> = {}

  const STEP_SPACING = 230
  const stepOrder = ['step-1', 'step-2', 'step-3', 'step-4', 'step-5']
  const stepX: Record<string, number> = {}
  stepOrder.forEach((id, i) => {
    pos[id] = { x: i * STEP_SPACING, y: 0 }
    stepX[id] = i * STEP_SPACING
  })

  // Cooperative — top center
  pos['coop-1'] = { x: 2 * STEP_SPACING, y: -280 }

  // Producers — row above steps
  const producers = nodes.filter((n) => n.type === 'producer')
  producers.forEach((n, i) => {
    pos[n.id] = { x: i * STEP_SPACING, y: -150 }
  })

  // Agents — row below steps, aligned to their primary step
  const agentPrimaryStep: Record<string, string> = {}
  edges
    .filter((e) => e.type === 'assigned_to')
    .forEach((e) => {
      if (!agentPrimaryStep[e.source]) agentPrimaryStep[e.source] = e.target
    })
  nodes.filter((n) => n.type === 'agent').forEach((n) => {
    const sid = agentPrimaryStep[n.id]
    pos[n.id] = { x: sid ? (stepX[sid] ?? 2 * STEP_SPACING) : 2 * STEP_SPACING, y: 155 }
  })

  // Bags — clustered below agents, grouped by current step
  const bagsByStep: Record<string, string[]> = {}
  edges
    .filter((e) => e.type === 'scanned_at')
    .forEach((e) => {
      bagsByStep[e.target] = bagsByStep[e.target] ?? []
      bagsByStep[e.target].push(e.source)
    })

  const PER_ROW = 3
  const GAP     = 42
  Object.entries(bagsByStep).forEach(([stepId, bagIds]) => {
    const cx      = stepX[stepId] ?? 2 * STEP_SPACING
    const cols    = Math.min(bagIds.length, PER_ROW)
    const startX  = cx - ((cols - 1) * GAP) / 2
    bagIds.forEach((bagId, i) => {
      const col = i % PER_ROW
      const row = Math.floor(i / PER_ROW)
      pos[bagId] = { x: startX + col * GAP, y: 300 + row * 52 }
    })
  })

  return pos
}

// Returns a semantically scoped ego-network for a bag node:
//   distance 0 — the bag itself
//   distance 1 — its current step (scanned_at) + its producer (belongs_to)
//   distance 2 — agent(s) assigned to that step + cooperative of that producer
// Generic BFS is intentionally avoided: it would pull in sibling bags
// sharing the same step node, which pollutes the view.
function getFocusSubgraph(
  selectedId: string,
  nodes: GraphNode[],
  edges: GraphEdge[],
): { visibleNodes: GraphNode[]; visibleEdges: GraphEdge[]; distanceMap: Map<string, number> } {
  const nodeMap   = new Map(nodes.map((n) => [n.id, n]))
  const distanceMap = new Map<string, number>([[selectedId, 0]])

  // Distance 1: step (scanned_at) and producer (belongs_to) of the bag
  for (const e of edges) {
    if (e.source !== selectedId) continue
    if (e.type === 'scanned_at' || e.type === 'belongs_to') {
      distanceMap.set(e.target, 1)
    }
  }

  // Distance 2: agents assigned to the step, cooperative of the producer
  for (const [id, dist] of distanceMap) {
    if (dist !== 1) continue
    const n = nodeMap.get(id)
    if (!n) continue

    if (n.type === 'step') {
      // agents whose assigned_to target is this step
      for (const e of edges) {
        if (e.type === 'assigned_to' && e.target === id) {
          if (!distanceMap.has(e.source)) distanceMap.set(e.source, 2)
        }
      }
    }
    if (n.type === 'producer') {
      // cooperative this producer belongs to
      for (const e of edges) {
        if (e.type === 'member_of' && e.source === id) {
          if (!distanceMap.has(e.target)) distanceMap.set(e.target, 2)
        }
      }
    }
  }

  const visibleIds   = new Set(distanceMap.keys())
  const visibleNodes = nodes.filter((n) => visibleIds.has(n.id))
  const visibleEdges = edges.filter((e) => visibleIds.has(e.source) && visibleIds.has(e.target))

  return { visibleNodes, visibleEdges, distanceMap }
}

// ─── Cytoscape stylesheet ─────────────────────────────────────────────────────

function buildStylesheet(): cytoscape.StylesheetStyle[] {
  return [
    {
      selector: 'node',
      style: {
        label:          'data(label)',
        'text-wrap':    'wrap',
        'text-valign':  'center',
        'text-halign':  'center',
        'font-family':  'Inter, sans-serif',
        'font-size':    10,
        color:          '#fff',
        'font-weight':  600,
        'transition-property':  'opacity' as any,
        'transition-duration':  '140ms',
      },
    },
    {
      selector: 'node[type="step"]',
      style: {
        'background-color': NODE_COLORS.step,
        width: 100, height: 42,
        shape: 'round-rectangle',
        'font-size': 11,
      },
    },
    ...(['done', 'in_progress', 'pending', 'blocked'] as const).map((s) => ({
      selector: `node[type="step"][status="${s}"]`,
      style: { 'border-color': STATUS_BORDER[s], 'border-width': s === 'pending' ? 2 : 3 },
    })),
    {
      selector: 'node[type="bag"]',
      style: {
        'background-color': NODE_COLORS.bag,
        width: 34, height: 34,
        shape: 'ellipse',
        'font-size': 9,
      },
    },
    {
      selector: 'node[type="agent"]',
      style: {
        'background-color': NODE_COLORS.agent,
        width: 54, height: 54,
        shape: 'ellipse',
        'font-size': 9,
      },
    },
    {
      selector: 'node[type="producer"]',
      style: {
        'background-color': NODE_COLORS.producer,
        width: 54, height: 54,
        shape: 'ellipse',
        'font-size': 9,
      },
    },
    {
      selector: 'node[type="cooperative"]',
      style: {
        'background-color': NODE_COLORS.cooperative,
        width: 72, height: 72,
        shape: 'ellipse',
        'font-size': 10,
      },
    },
    {
      selector: 'node:selected',
      style: {
        'border-color':   '#ffffff',
        'border-width':   3,
        'border-opacity': 0.9,
      },
    },
    { selector: 'node.dimmed', style: { opacity: 0.1 } as any },
    {
      selector: 'edge',
      style: {
        width:                  1.5,
        'line-color':           '#d0d5dd',
        'target-arrow-color':   '#d0d5dd',
        'target-arrow-shape':   'triangle',
        'curve-style':          'bezier',
        'arrow-scale':          0.8,
        'transition-property':  'opacity' as any,
        'transition-duration':  '140ms',
      },
    },
    {
      selector: 'edge[type="sequence"]',
      style: {
        'line-color':         '#056033',
        'target-arrow-color': '#056033',
        width: 2.5,
        opacity: 0.7,
      },
    },
    {
      selector: 'edge[type="scanned_at"]',
      style: {
        'line-color':         '#ea580c',
        'target-arrow-color': '#ea580c',
        'line-style':         'dashed',
        'line-dash-pattern':  [4, 3],
        opacity: 0.7,
      },
    },
    {
      selector: 'edge[type="belongs_to"]',
      style: {
        'line-color':        '#93c5fd',
        'target-arrow-shape': 'none',
        'line-style':         'dashed',
        'line-dash-pattern':  [3, 4],
        opacity: 0.5,
      },
    },
    {
      selector: 'edge[type="assigned_to"]',
      style: {
        'line-color':        '#9ca3af',
        'target-arrow-shape': 'none',
        'line-style':         'dotted',
        opacity: 0.5,
      },
    },
    {
      selector: 'edge[type="member_of"]',
      style: {
        'line-color':        '#c4b5fd',
        'target-arrow-shape': 'none',
        'line-style':         'dotted',
        opacity: 0.4,
      },
    },
    { selector: 'edge.dimmed', style: { opacity: 0.05 } as any },
  ]
}

// ─── Props & export types ──────────────────────────────────────────────────────

export type GraphExportFns = { png: () => void; svg: () => void; pdf: () => void }
export type { NodeType }
export { NODE_COLORS, STATUS_BORDER }

interface GraphViewProps {
  nodes: GraphNode[]
  edges: GraphEdge[]
  mode: 'workflow' | 'focus'
  focusBagId: string | null
  onNodeSelect: (node: GraphNode | null) => void
  onExportReady?: (fns: GraphExportFns) => void
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function GraphView({
  nodes,
  edges,
  mode,
  focusBagId,
  onNodeSelect,
  onExportReady,
}: GraphViewProps) {
  const containerRef     = useRef<HTMLDivElement>(null)
  const cyRef            = useRef<Core | null>(null)
  const onNodeSelectRef  = useRef(onNodeSelect)
  const isFirstLayoutRef = useRef(true)
  const tooltipRef       = useRef<HTMLDivElement>(null)
  const tooltipDotRef    = useRef<HTMLSpanElement>(null)
  const tooltipTypeRef   = useRef<HTMLSpanElement>(null)
  const tooltipLabelRef  = useRef<HTMLSpanElement>(null)

  useEffect(() => { onNodeSelectRef.current = onNodeSelect }, [onNodeSelect])

  if (!pluginsRegistered) {
    cytoscape.use(svgPlugin)
    cytoscape.use(dagre)
    pluginsRegistered = true
  }

  // ─── Export ─────────────────────────────────────────────────────────────────

  const exportPng = useCallback(() => {
    const cy = cyRef.current
    if (!cy) return
    const uri = cy.png({ output: 'base64uri', full: true, scale: 2, bg: '#f9fafb' })
    const a = document.createElement('a')
    a.href = uri; a.download = 'tracabilite.png'; a.click()
  }, [])

  const exportSvg = useCallback(() => {
    const cy = cyRef.current
    if (!cy) return
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const svgStr: string = (cy as any).svg({ full: true, bg: '#f9fafb' })
    const blob = new Blob([svgStr], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'tracabilite.svg'; a.click()
    URL.revokeObjectURL(url)
  }, [])

  const exportPdf = useCallback(() => {
    const cy = cyRef.current
    if (!cy) return
    const png = cy.png({ output: 'base64uri', full: true, scale: 2, bg: '#f9fafb' })
    const win = window.open('', '_blank')
    if (!win) return
    win.document.write(`<!DOCTYPE html><html><head><title>Traçabilité</title><style>*{margin:0;padding:0}body{display:flex;justify-content:center;padding:20px}img{max-width:100%;height:auto}@media print{body{padding:0}}</style></head><body><img src="${png}"/><script>window.onload=function(){window.print()}<\/script></body></html>`)
    win.document.close()
  }, [])

  // ─── Build elements ──────────────────────────────────────────────────────────

  const buildWorkflowElements = useCallback(() => {
    const positions = computeWorkflowPositions(nodes, edges)
    return {
      elements: [
        ...nodes.map((n) => ({
          data: { id: n.id, label: n.label, type: n.type, status: n.status ?? '' },
        })),
        ...edges.map((e) => ({
          data: { id: e.id, source: e.source, target: e.target, type: e.type },
        })),
      ],
      positions,
    }
  }, [nodes, edges])

  const buildFocusElements = useCallback((bagId: string) => {
    const { visibleNodes, visibleEdges, distanceMap } = getFocusSubgraph(bagId, nodes, edges)
    return [
      ...visibleNodes.map((n) => ({
        data: {
          id: n.id, label: n.label, type: n.type,
          status: n.status ?? '',
          distance: distanceMap.get(n.id) ?? 2,
        },
      })),
      ...visibleEdges.map((e) => ({
        data: { id: e.id, source: e.source, target: e.target, type: e.type },
      })),
    ]
  }, [nodes, edges])

  // ─── Init Cytoscape (once) ───────────────────────────────────────────────────

  useEffect(() => {
    if (!containerRef.current) return

    const cy = cytoscape({
      container: containerRef.current,
      elements: [],
      style: buildStylesheet(),
      userZoomingEnabled: true,
      userPanningEnabled: true,
      boxSelectionEnabled: false,
      minZoom: 0.15,
      maxZoom: 3,
    })

    cy.on('mouseover', 'node', (e) => {
      const node = e.target
      const bb   = node.renderedBoundingBox()
      const data = node.data() as { type: string; label: string }

      if (tooltipRef.current && tooltipDotRef.current && tooltipTypeRef.current && tooltipLabelRef.current) {
        tooltipDotRef.current.style.backgroundColor  = NODE_COLORS[data.type as NodeType] ?? '#9ca3af'
        tooltipTypeRef.current.textContent            = NODE_TYPE_LABELS[data.type] ?? data.type
        tooltipLabelRef.current.textContent           = data.label.replace(/\n/g, ' ')
        tooltipRef.current.style.left                 = `${(bb.x1 + bb.x2) / 2}px`
        tooltipRef.current.style.top                  = `${bb.y1 - 10}px`
        tooltipRef.current.style.display              = 'block'
      }

      cy.elements().not(node.closedNeighborhood()).addClass('dimmed')
    })
    cy.on('mouseout', 'node', () => {
      if (tooltipRef.current) tooltipRef.current.style.display = 'none'
      cy.elements().removeClass('dimmed')
    })
    cy.on('tap', 'node', (e) => {
      const found = nodes.find((n) => n.id === e.target.id()) ?? null
      onNodeSelectRef.current(found)
    })

    cyRef.current = cy
    onExportReady?.({ png: exportPng, svg: exportSvg, pdf: exportPdf })

    return () => {
      cy.stop(true, true)
      cy.destroy()
      cyRef.current = null
      isFirstLayoutRef.current = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ─── Single layout effect for all mode/focus changes ─────────────────────────

  useEffect(() => {
    const cy = cyRef.current
    if (!cy) return

    const firstRun = isFirstLayoutRef.current
    isFirstLayoutRef.current = false

    if (mode === 'workflow') {
      const { elements, positions } = buildWorkflowElements()
      cy.elements().remove()
      cy.add(elements)
      cy.layout({
        name: 'preset',
        positions: (node: NodeSingular) => positions[node.id()] ?? { x: 0, y: 0 },
        fit: true, padding: 60,
        animate: !firstRun,
        animationDuration: 450,
        animationEasing: 'ease-in-out',
      } as cytoscape.LayoutOptions).run()
    } else if (mode === 'focus' && focusBagId) {
      const elements = buildFocusElements(focusBagId)
      cy.elements().remove()
      cy.add(elements)
      cy.layout({
        name: 'concentric',
        concentric: (node: NodeSingular) => {
          const d = node.data('distance') as number
          return d === 0 ? 3 : d === 1 ? 2 : 1
        },
        levelWidth: () => 1,
        minNodeSpacing: 60,
        fit: true, padding: 80,
        animate: true,
        animationDuration: 450,
        animationEasing: 'ease-in-out',
        startAngle: Math.PI / 2,
      } as cytoscape.LayoutOptions).run()
      cy.getElementById(focusBagId).select()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, focusBagId])

  // ─── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="relative w-full h-full bg-surface">
      <div ref={containerRef} className="w-full h-full" />

      {/* Node tooltip */}
      <div
        ref={tooltipRef}
        className="absolute z-20 pointer-events-none -translate-x-1/2 -translate-y-full bg-white border border-border rounded-lg shadow-md px-3 py-2"
        style={{ display: 'none' }}
      >
        <div className="flex items-center gap-1.5 mb-0.5">
          <span ref={tooltipDotRef} className="w-2 h-2 rounded-full shrink-0" />
          <span ref={tooltipTypeRef} className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wide" />
        </div>
        <span ref={tooltipLabelRef} className="block text-xs font-semibold text-text-primary max-w-[160px] leading-snug" />
      </div>

      {/* Zoom controls */}
      <div className="absolute bottom-5 right-5 flex flex-col gap-1.5">
        {[
          { icon: ZoomIn,    title: 'Zoom avant',   action: () => cyRef.current?.zoom(cyRef.current.zoom() * 1.3) },
          { icon: ZoomOut,   title: 'Zoom arrière', action: () => cyRef.current?.zoom(cyRef.current.zoom() * 0.7) },
          { icon: Maximize2, title: 'Ajuster',      action: () => cyRef.current?.fit(undefined, 40) },
        ].map(({ icon: Icon, title, action }) => (
          <button
            key={title}
            onClick={action}
            title={title}
            className="flex items-center justify-center w-8 h-8 bg-white border border-border rounded-lg text-text-secondary hover:bg-surface shadow-xs transition-colors"
          >
            <Icon size={14} />
          </button>
        ))}
      </div>
    </div>
  )
}
