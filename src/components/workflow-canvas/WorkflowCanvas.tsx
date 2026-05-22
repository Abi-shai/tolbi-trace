'use client'

import { useEffect, useRef, useCallback } from 'react'
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  useNodesState,
  useEdgesState,
  MarkerType,
  type Node,
  type Edge,
  type NodeMouseHandler,
  type OnNodeDrag,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { StepNode } from './StepNode'
import { GhostNode } from './GhostNode'
import { AddButtonEdge } from './AddButtonEdge'
import { useWorkflowBuilderStore } from '@/store/workflow-builder'
import type { WorkflowStep } from '@/types/workflow-step'

const NODE_HEIGHT = 160
const V_GAP       = 56
const GHOST_ID    = '__ghost__'

const nodeTypes = { step: StepNode, ghost: GhostNode }
const edgeTypes = { addButton: AddButtonEdge }

// Positions always derived from order — no stale prev-position logic
function stepsToNodes(steps: WorkflowStep[], selectedId: string | null): Node[] {
  return [...steps]
    .sort((a, b) => a.order - b.order)
    .map((step, i) => ({
      id:       step.id,
      type:     'step' as const,
      position: { x: 0, y: i * (NODE_HEIGHT + V_GAP) },
      data:     { ...step, isSelected: step.id === selectedId },
    }))
}

function makeGhostNode(steps: WorkflowStep[]): Node {
  return {
    id:         GHOST_ID,
    type:       'ghost',
    position:   { x: 0, y: steps.length * (NODE_HEIGHT + V_GAP) },
    data:       { isEmpty: steps.length === 0 },
    draggable:  false,
    selectable: false,
  }
}

const EDGE_STYLE = { stroke: '#d0d5dd', strokeWidth: 1.5 }
const MARKER_END = { type: MarkerType.ArrowClosed, color: '#d0d5dd', width: 16, height: 16 }

function buildEdges(steps: WorkflowStep[]): Edge[] {
  const sorted = [...steps].sort((a, b) => a.order - b.order)
  return sorted.slice(0, -1).map((step, i) => ({
    id:        `e-${step.id}-${sorted[i + 1].id}`,
    source:    step.id,
    target:    sorted[i + 1].id,
    type:      'addButton',
    style:     EDGE_STYLE,
    markerEnd: MARKER_END,
  }))
}

function buildGhostEdge(steps: WorkflowStep[]): Edge | null {
  if (steps.length === 0) return null
  const sorted = [...steps].sort((a, b) => a.order - b.order)
  const lastId = sorted[sorted.length - 1].id
  return {
    id:     `e-${lastId}-${GHOST_ID}`,
    source: lastId,
    target: GHOST_ID,
    type:   'smoothstep',
    style:  { stroke: '#d0d5dd', strokeWidth: 1.5, strokeDasharray: '5 4' },
  }
}

interface WorkflowCanvasProps {
  steps: WorkflowStep[]
}

export default function WorkflowCanvas({ steps: initialSteps }: WorkflowCanvasProps) {
  const initSteps    = useWorkflowBuilderStore((s) => s.initSteps)
  const storeSteps   = useWorkflowBuilderStore((s) => s.steps)
  const selectedId   = useWorkflowBuilderStore((s) => s.selectedStepId)
  const selectStep   = useWorkflowBuilderStore((s) => s.selectStep)
  const reorderSteps = useWorkflowBuilderStore((s) => s.reorderSteps)

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])

  const mountDone  = useRef(false)
  const storeReady = useRef(false)

  // Initialize store once on mount
  useEffect(() => {
    if (mountDone.current) return
    mountDone.current = true
    initSteps(initialSteps)
  }, [initialSteps, initSteps])

  // Sync store → canvas. Guard prevents rendering before the store is populated.
  useEffect(() => {
    if (storeSteps.length > 0) storeReady.current = true
    if (!storeReady.current) return

    const stepNodes = stepsToNodes(storeSteps, selectedId)
    const ghost     = makeGhostNode(storeSteps)
    setNodes([...stepNodes, ghost])

    const ge = buildGhostEdge(storeSteps)
    setEdges([...buildEdges(storeSteps), ...(ge ? [ge] : [])])
  }, [storeSteps, selectedId, setNodes, setEdges])

  const handleNodeClick: NodeMouseHandler = useCallback(
    (_e, node) => { if (node.id !== GHOST_ID) selectStep(node.id) },
    [selectStep],
  )

  const handlePaneClick = useCallback(() => selectStep(null), [selectStep])

  const handleNodeDragStop: OnNodeDrag = useCallback(
    (_e, _node, currentNodes) => {
      const sorted     = [...currentNodes]
        .filter((n) => n.id !== GHOST_ID)
        .sort((a, b) => a.position.y - b.position.y)
      const orderedIds = sorted.map((n) => n.id)
      reorderSteps(orderedIds)
      // Snap immediately to ordered positions (sync effect will agree)
      setNodes((prev) =>
        prev.map((n) => {
          if (n.id === GHOST_ID) return n
          const idx = orderedIds.indexOf(n.id)
          return { ...n, position: { x: 0, y: idx * (NODE_HEIGHT + V_GAP) } }
        }),
      )
    },
    [reorderSteps, setNodes],
  )

  return (
    <div className="flex-1 min-h-0">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        onPaneClick={handlePaneClick}
        onNodeDragStop={handleNodeDragStop}
        fitView
        fitViewOptions={{ padding: 0.18 }}
        minZoom={0.25}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
        className="bg-surface"
        selectionOnDrag={false}
        elementsSelectable={false}
        nodesDraggable
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#d0d5dd" />
        <Controls
          className="!shadow-none !border !border-border !rounded-lg overflow-hidden"
          showInteractive={false}
        />
      </ReactFlow>
    </div>
  )
}
