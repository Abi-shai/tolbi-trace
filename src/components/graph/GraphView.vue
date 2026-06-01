<template>
  <div class="relative w-full h-full bg-surface">
    <div ref="containerRef" class="w-full h-full" />

    <!-- Tooltip -->
    <div
      ref="tooltipRef"
      class="absolute z-20 pointer-events-none -translate-x-1/2 -translate-y-full bg-white border border-border rounded-lg shadow-md px-3 py-2"
      style="display: none"
    >
      <div class="flex items-center gap-1.5 mb-0.5">
        <span ref="tooltipDotRef" class="w-2 h-2 rounded-full shrink-0" />
        <span ref="tooltipTypeRef" class="text-[10px] font-semibold text-text-tertiary uppercase tracking-wide" />
      </div>
      <span ref="tooltipLabelRef" class="block text-xs font-semibold text-text-primary max-w-[160px] leading-snug" />
    </div>

    <!-- Zoom controls -->
    <div class="absolute bottom-5 right-5 flex flex-col gap-1.5">
      <button
        v-for="ctrl in zoomControls"
        :key="ctrl.title"
        @click="ctrl.action()"
        :title="ctrl.title"
        class="flex items-center justify-center w-8 h-8 bg-white border border-border rounded-lg text-text-secondary hover:bg-surface shadow-xs transition-colors"
      >
        <component :is="ctrl.icon" :size="14" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-vue-next'
import cytoscape, { type Core, type NodeSingular } from 'cytoscape'
import type { GraphNode, GraphEdge, NodeType } from '~/data/graph'
import { NODE_COLORS, STATUS_BORDER } from './graph-constants'

const svgPlugin = (await import('cytoscape-svg')).default ?? (await import('cytoscape-svg'))
const dagre     = (await import('cytoscape-dagre')).default ?? (await import('cytoscape-dagre'))

// ─── Props & emits ────────────────────────────────────────────────────────────

export type GraphExportFns = { png: () => void; svg: () => void; pdf: () => void }

const props = defineProps<{
  nodes:       GraphNode[]
  edges:       GraphEdge[]
  mode:        'workflow' | 'focus'
  focusBagId:  string | null
}>()

const emit = defineEmits<{
  nodeSelect:   [node: GraphNode | null]
  exportReady:  [fns: GraphExportFns]
}>()

// ─── Template refs ────────────────────────────────────────────────────────────

const containerRef   = ref<HTMLElement | null>(null)
const tooltipRef     = ref<HTMLElement | null>(null)
const tooltipDotRef  = ref<HTMLElement | null>(null)
const tooltipTypeRef = ref<HTMLElement | null>(null)
const tooltipLabelRef = ref<HTMLElement | null>(null)

const cyRef            = ref<Core | null>(null)
const isFirstLayout    = ref(true)

const NODE_TYPE_LABELS: Record<string, string> = {
  bag: 'QR code', cooperative: 'Coopérative',
  producer: 'Producteur', agent: 'Agent', step: 'Étape',
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function computeWorkflowPositions(nodes: GraphNode[], edges: GraphEdge[]): Record<string, { x: number; y: number }> {
  const pos: Record<string, { x: number; y: number }> = {}
  const STEP_SPACING = 230
  const stepOrder    = ['step-1', 'step-2', 'step-3', 'step-4', 'step-5']
  const stepX: Record<string, number> = {}
  stepOrder.forEach((id, i) => { pos[id] = { x: i * STEP_SPACING, y: 0 }; stepX[id] = i * STEP_SPACING })
  pos['coop-1'] = { x: 2 * STEP_SPACING, y: -280 }
  const producers = nodes.filter((n) => n.type === 'producer')
  producers.forEach((n, i) => { pos[n.id] = { x: i * STEP_SPACING, y: -150 } })
  const agentPrimaryStep: Record<string, string> = {}
  edges.filter((e) => e.type === 'assigned_to').forEach((e) => { if (!agentPrimaryStep[e.source]) agentPrimaryStep[e.source] = e.target })
  nodes.filter((n) => n.type === 'agent').forEach((n) => {
    const sid = agentPrimaryStep[n.id]
    pos[n.id] = { x: sid ? (stepX[sid] ?? 2 * STEP_SPACING) : 2 * STEP_SPACING, y: 155 }
  })
  const bagsByStep: Record<string, string[]> = {}
  edges.filter((e) => e.type === 'scanned_at').forEach((e) => { bagsByStep[e.target] = bagsByStep[e.target] ?? []; bagsByStep[e.target].push(e.source) })
  const PER_ROW = 3, GAP = 42
  Object.entries(bagsByStep).forEach(([stepId, bagIds]) => {
    const cx = stepX[stepId] ?? 2 * STEP_SPACING
    const cols = Math.min(bagIds.length, PER_ROW)
    const startX = cx - ((cols - 1) * GAP) / 2
    bagIds.forEach((bagId, i) => { pos[bagId] = { x: startX + (i % PER_ROW) * GAP, y: 300 + Math.floor(i / PER_ROW) * 52 } })
  })
  return pos
}

function getFocusSubgraph(selectedId: string, nodes: GraphNode[], edges: GraphEdge[]) {
  const nodeMap     = new Map(nodes.map((n) => [n.id, n]))
  const distanceMap = new Map<string, number>([[selectedId, 0]])
  for (const e of edges) {
    if (e.source !== selectedId) continue
    if (e.type === 'scanned_at' || e.type === 'belongs_to') distanceMap.set(e.target, 1)
  }
  for (const [id, dist] of distanceMap) {
    if (dist !== 1) continue
    const n = nodeMap.get(id)
    if (!n) continue
    if (n.type === 'step') {
      for (const e of edges) { if (e.type === 'assigned_to' && e.target === id && !distanceMap.has(e.source)) distanceMap.set(e.source, 2) }
    }
    if (n.type === 'producer') {
      for (const e of edges) { if (e.type === 'member_of' && e.source === id && !distanceMap.has(e.target)) distanceMap.set(e.target, 2) }
    }
  }
  const visibleIds   = new Set(distanceMap.keys())
  const visibleNodes = nodes.filter((n) => visibleIds.has(n.id))
  const visibleEdges = edges.filter((e) => visibleIds.has(e.source) && visibleIds.has(e.target))
  return { visibleNodes, visibleEdges, distanceMap }
}

function buildStylesheet(): cytoscape.StylesheetStyle[] {
  return [
    { selector: 'node', style: { label: 'data(label)', 'text-wrap': 'wrap', 'text-valign': 'center', 'text-halign': 'center', 'font-family': 'Inter, sans-serif', 'font-size': 10, color: '#fff', 'font-weight': 600, 'transition-property': 'opacity' as any, 'transition-duration': '140ms' } },
    { selector: 'node[type="step"]', style: { 'background-color': NODE_COLORS.step, width: 100, height: 42, shape: 'round-rectangle', 'font-size': 11 } },
    ...(['done', 'in_progress', 'pending', 'blocked'] as const).map((s) => ({ selector: `node[type="step"][status="${s}"]`, style: { 'border-color': STATUS_BORDER[s], 'border-width': s === 'pending' ? 2 : 3 } })),
    { selector: 'node[type="bag"]',         style: { 'background-color': NODE_COLORS.bag,         width: 34, height: 34, shape: 'ellipse', 'font-size': 9 } },
    { selector: 'node[type="agent"]',       style: { 'background-color': NODE_COLORS.agent,       width: 54, height: 54, shape: 'ellipse', 'font-size': 9 } },
    { selector: 'node[type="producer"]',    style: { 'background-color': NODE_COLORS.producer,    width: 54, height: 54, shape: 'ellipse', 'font-size': 9 } },
    { selector: 'node[type="cooperative"]', style: { 'background-color': NODE_COLORS.cooperative, width: 72, height: 72, shape: 'ellipse', 'font-size': 10 } },
    { selector: 'node:selected', style: { 'border-color': '#ffffff', 'border-width': 3, 'border-opacity': 0.9 } },
    { selector: 'node.dimmed', style: { opacity: 0.1 } as any },
    { selector: 'edge', style: { width: 1.5, 'line-color': '#d0d5dd', 'target-arrow-color': '#d0d5dd', 'target-arrow-shape': 'triangle', 'curve-style': 'bezier', 'arrow-scale': 0.8, 'transition-property': 'opacity' as any, 'transition-duration': '140ms' } },
    { selector: 'edge[type="sequence"]',    style: { 'line-color': '#056033', 'target-arrow-color': '#056033', width: 2.5, opacity: 0.7 } },
    { selector: 'edge[type="scanned_at"]',  style: { 'line-color': '#ea580c', 'target-arrow-color': '#ea580c', 'line-style': 'dashed', 'line-dash-pattern': [4, 3], opacity: 0.7 } },
    { selector: 'edge[type="belongs_to"]',  style: { 'line-color': '#93c5fd', 'target-arrow-shape': 'none', 'line-style': 'dashed', 'line-dash-pattern': [3, 4], opacity: 0.5 } },
    { selector: 'edge[type="assigned_to"]', style: { 'line-color': '#9ca3af', 'target-arrow-shape': 'none', 'line-style': 'dotted', opacity: 0.5 } },
    { selector: 'edge[type="member_of"]',   style: { 'line-color': '#c4b5fd', 'target-arrow-shape': 'none', 'line-style': 'dotted', opacity: 0.4 } },
    { selector: 'edge.dimmed', style: { opacity: 0.05 } as any },
  ]
}

// ─── Export ───────────────────────────────────────────────────────────────────

function exportPng() {
  const cy = cyRef.value; if (!cy) return
  const uri = cy.png({ output: 'base64uri', full: true, scale: 2, bg: '#f9fafb' })
  const a = document.createElement('a'); a.href = uri; a.download = 'tracabilite.png'; a.click()
}
function exportSvg() {
  const cy = cyRef.value; if (!cy) return
  const svgStr: string = (cy as any).svg({ full: true, bg: '#f9fafb' })
  const blob = new Blob([svgStr], { type: 'image/svg+xml' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = 'tracabilite.svg'; a.click()
  URL.revokeObjectURL(url)
}
function exportPdf() {
  const cy = cyRef.value; if (!cy) return
  const png = cy.png({ output: 'base64uri', full: true, scale: 2, bg: '#f9fafb' })
  const win = window.open('', '_blank'); if (!win) return
  win.document.write(`<!DOCTYPE html><html><head><title>Traçabilité</title><style>*{margin:0;padding:0}body{display:flex;justify-content:center;padding:20px}img{max-width:100%;height:auto}@media print{body{padding:0}}</style></head><body><img src="${png}"/><script>window.onload=function(){window.print()}<\/script></body></html>`)
  win.document.close()
}

// ─── Zoom controls ────────────────────────────────────────────────────────────

const zoomControls = [
  { icon: ZoomIn,    title: 'Zoom avant',   action: () => cyRef.value?.zoom(cyRef.value.zoom() * 1.3) },
  { icon: ZoomOut,   title: 'Zoom arrière', action: () => cyRef.value?.zoom(cyRef.value.zoom() * 0.7) },
  { icon: Maximize2, title: 'Ajuster',      action: () => cyRef.value?.fit(undefined, 40) },
]

// ─── Build elements ───────────────────────────────────────────────────────────

function buildWorkflowElements() {
  const positions = computeWorkflowPositions(props.nodes, props.edges)
  return {
    elements: [
      ...props.nodes.map((n) => ({ data: { id: n.id, label: n.label, type: n.type, status: n.status ?? '' } })),
      ...props.edges.map((e) => ({ data: { id: e.id, source: e.source, target: e.target, type: e.type } })),
    ],
    positions,
  }
}

function buildFocusElements(bagId: string) {
  const { visibleNodes, visibleEdges, distanceMap } = getFocusSubgraph(bagId, props.nodes, props.edges)
  return [
    ...visibleNodes.map((n) => ({ data: { id: n.id, label: n.label, type: n.type, status: n.status ?? '', distance: distanceMap.get(n.id) ?? 2 } })),
    ...visibleEdges.map((e) => ({ data: { id: e.id, source: e.source, target: e.target, type: e.type } })),
  ]
}

function runLayout() {
  const cy = cyRef.value; if (!cy) return
  const firstRun = isFirstLayout.value; isFirstLayout.value = false

  if (props.mode === 'workflow') {
    const { elements, positions } = buildWorkflowElements()
    cy.elements().remove(); cy.add(elements)
    cy.layout({ name: 'preset', positions: (node: NodeSingular) => positions[node.id()] ?? { x: 0, y: 0 }, fit: true, padding: 60, animate: !firstRun, animationDuration: 450, animationEasing: 'ease-in-out' } as any).run()
  } else if (props.mode === 'focus' && props.focusBagId) {
    const elements = buildFocusElements(props.focusBagId)
    cy.elements().remove(); cy.add(elements)
    cy.layout({ name: 'concentric', concentric: (node: NodeSingular) => { const d = node.data('distance') as number; return d === 0 ? 3 : d === 1 ? 2 : 1 }, levelWidth: () => 1, minNodeSpacing: 60, fit: true, padding: 80, animate: true, animationDuration: 450, animationEasing: 'ease-in-out', startAngle: Math.PI / 2 } as any).run()
    cy.getElementById(props.focusBagId).select()
  }
}

// ─── Lifecycle ────────────────────────────────────────────────────────────────

let pluginsRegistered = false

onMounted(() => {
  if (!containerRef.value) return

  if (!pluginsRegistered) {
    cytoscape.use(svgPlugin as any)
    cytoscape.use(dagre as any)
    pluginsRegistered = true
  }

  const cy = cytoscape({
    container: containerRef.value,
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
    if (tooltipRef.value && tooltipDotRef.value && tooltipTypeRef.value && tooltipLabelRef.value) {
      tooltipDotRef.value.style.backgroundColor = NODE_COLORS[data.type as NodeType] ?? '#9ca3af'
      tooltipTypeRef.value.textContent           = NODE_TYPE_LABELS[data.type] ?? data.type
      tooltipLabelRef.value.textContent          = data.label.replace(/\n/g, ' ')
      tooltipRef.value.style.left                = `${(bb.x1 + bb.x2) / 2}px`
      tooltipRef.value.style.top                 = `${bb.y1 - 10}px`
      tooltipRef.value.style.display             = 'block'
    }
    cy.elements().not(node.closedNeighborhood()).addClass('dimmed')
  })
  cy.on('mouseout', 'node', () => {
    if (tooltipRef.value) tooltipRef.value.style.display = 'none'
    cy.elements().removeClass('dimmed')
  })
  cy.on('tap', 'node', (e) => {
    const found = props.nodes.find((n) => n.id === e.target.id()) ?? null
    emit('nodeSelect', found)
  })
  cy.on('tap', (e) => {
    if (e.target === cy) emit('nodeSelect', null)
  })

  cyRef.value = cy
  emit('exportReady', { png: exportPng, svg: exportSvg, pdf: exportPdf })

  runLayout()
})

onUnmounted(() => {
  cyRef.value?.stop(true, true)
  cyRef.value?.destroy()
  cyRef.value = null
})

watch([() => props.mode, () => props.focusBagId], () => runLayout())
</script>
