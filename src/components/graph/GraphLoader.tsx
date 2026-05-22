'use client'

import dynamic from 'next/dynamic'
import type { GraphNode, GraphEdge } from '@/data/graph'
import type { GraphExportFns } from './GraphView'

const GraphView = dynamic(() => import('./GraphView'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center flex-1 h-full text-sm text-text-tertiary bg-surface">
      Chargement du graphe…
    </div>
  ),
})

export default function GraphLoader({
  nodes,
  edges,
  mode,
  focusBagId,
  onNodeSelect,
  onExportReady,
}: {
  nodes: GraphNode[]
  edges: GraphEdge[]
  mode: 'workflow' | 'focus'
  focusBagId: string | null
  onNodeSelect: (node: GraphNode | null) => void
  onExportReady?: (fns: GraphExportFns) => void
}) {
  return (
    <GraphView
      nodes={nodes}
      edges={edges}
      mode={mode}
      focusBagId={focusBagId}
      onNodeSelect={onNodeSelect}
      onExportReady={onExportReady}
    />
  )
}
