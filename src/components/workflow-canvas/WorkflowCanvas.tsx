'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
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
import { StepNode }       from './StepNode'
import { GhostNode }      from './GhostNode'
import { TerminatorNode } from './TerminatorNode'
import { AddButtonEdge }  from './AddButtonEdge'
import { useWorkflowBuilderStore } from '@/store/workflow-builder'
import { cn } from '@/lib/utils'
import type { WorkflowStep } from '@/types/workflow-step'

// ─── Layout constants ─────────────────────────────────────────────────────────

const NODE_HEIGHT        = 160
const V_GAP              = 56
const TERMINATOR_HEIGHT  = 84
const GHOST_BUSY_HEIGHT  = 56
const GHOST_EMPTY_HEIGHT = 150

const GHOST_ID = '__ghost__'
const START_ID = '__start__'
const END_ID   = '__end__'

const NON_STEP_IDS = new Set([GHOST_ID, START_ID, END_ID])

const nodeTypes = { step: StepNode, ghost: GhostNode, terminator: TerminatorNode }
const edgeTypes = { addButton: AddButtonEdge }

// ─── Node builders ────────────────────────────────────────────────────────────

function stepsToNodes(steps: WorkflowStep[], selectedId: string | null): Node[] {
  return [...steps]
    .sort((a, b) => a.order - b.order)
    .map((step, i) => ({
      id:         step.id,
      type:       'step' as const,
      position:   { x: 0, y: i * (NODE_HEIGHT + V_GAP) },
      data:       { ...step, isSelected: step.id === selectedId },
      dragHandle: '.drag-handle',
    }))
}

function makeStartNode(): Node {
  return {
    id: START_ID, type: 'terminator',
    position:   { x: 0, y: -(TERMINATOR_HEIGHT + V_GAP) },
    data:       { variant: 'start' },
    draggable:  false, selectable: false,
  }
}

function makeGhostNode(steps: WorkflowStep[]): Node {
  return {
    id: GHOST_ID, type: 'ghost',
    position:   { x: 0, y: steps.length * (NODE_HEIGHT + V_GAP) },
    data:       { isEmpty: steps.length === 0 },
    draggable:  false, selectable: false,
  }
}

function makeEndNode(steps: WorkflowStep[]): Node {
  const ghostH = steps.length === 0 ? GHOST_EMPTY_HEIGHT : GHOST_BUSY_HEIGHT
  return {
    id: END_ID, type: 'terminator',
    position:   { x: 0, y: steps.length * (NODE_HEIGHT + V_GAP) + ghostH + V_GAP },
    data:       { variant: 'end' },
    draggable:  false, selectable: false,
  }
}

// ─── Edge builders ────────────────────────────────────────────────────────────

const EDGE_STYLE  = { stroke: '#d0d5dd', strokeWidth: 1.5 }
const EDGE_DASHED = { stroke: '#d0d5dd', strokeWidth: 1.5, strokeDasharray: '5 4' }
const MARKER_END  = { type: MarkerType.ArrowClosed, color: '#d0d5dd', width: 16, height: 16 }

function buildStepEdges(steps: WorkflowStep[]): Edge[] {
  const sorted = [...steps].sort((a, b) => a.order - b.order)
  return sorted.slice(0, -1).map((step, i) => ({
    id: `e-${step.id}-${sorted[i + 1].id}`,
    source: step.id, target: sorted[i + 1].id,
    type: 'addButton', style: EDGE_STYLE, markerEnd: MARKER_END,
  }))
}

function buildStartEdge(steps: WorkflowStep[]): Edge {
  const sorted = [...steps].sort((a, b) => a.order - b.order)
  const target = sorted.length > 0 ? sorted[0].id : GHOST_ID
  return {
    id: `e-${START_ID}-${target}`,
    source: START_ID, target,
    type: 'smoothstep', style: EDGE_STYLE, markerEnd: MARKER_END,
  }
}

function buildGhostEdge(steps: WorkflowStep[]): Edge | null {
  if (steps.length === 0) return null
  const sorted = [...steps].sort((a, b) => a.order - b.order)
  const lastId = sorted[sorted.length - 1].id
  return {
    id: `e-${lastId}-${GHOST_ID}`,
    source: lastId, target: GHOST_ID,
    type: 'smoothstep', style: EDGE_DASHED,
  }
}

function buildEndEdge(): Edge {
  return {
    id: `e-${GHOST_ID}-${END_ID}`,
    source: GHOST_ID, target: END_ID,
    type: 'smoothstep', style: EDGE_DASHED,
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function WorkflowCanvas({ steps: initialSteps }: { steps: WorkflowStep[] }) {
  const initSteps    = useWorkflowBuilderStore((s) => s.initSteps)
  const storeSteps   = useWorkflowBuilderStore((s) => s.steps)
  const selectedId   = useWorkflowBuilderStore((s) => s.selectedStepId)
  const selectStep   = useWorkflowBuilderStore((s) => s.selectStep)
  const reorderSteps = useWorkflowBuilderStore((s) => s.reorderSteps)

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])
  const [dragging, setDragging]          = useState(false)

  const mountDone    = useRef(false)
  const storeReady   = useRef(false)
  const isDragging   = useRef(false)
  // Tracks the live-preview order so handleNodeDragStop uses the right order,
  // not currentNodes which can lag behind our setNodes updates.
  const dragOrderRef = useRef<string[]>([])

  useEffect(() => {
    if (mountDone.current) return
    mountDone.current = true
    initSteps(initialSteps)
  }, [initialSteps, initSteps])

  // Sync store → canvas, skip while dragging to avoid fighting the drag
  useEffect(() => {
    if (storeSteps.length > 0) storeReady.current = true
    if (!storeReady.current) return
    if (isDragging.current) return

    const stepNodes = stepsToNodes(storeSteps, selectedId)
    setNodes([makeStartNode(), ...stepNodes, makeGhostNode(storeSteps), makeEndNode(storeSteps)])

    const ge = buildGhostEdge(storeSteps)
    setEdges([buildStartEdge(storeSteps), ...buildStepEdges(storeSteps), ...(ge ? [ge] : []), buildEndEdge()])
  }, [storeSteps, selectedId, setNodes, setEdges])

  const handleNodeClick: NodeMouseHandler = useCallback(
    (_e, node) => { if (!NON_STEP_IDS.has(node.id)) selectStep(node.id) },
    [selectStep],
  )

  const handlePaneClick = useCallback(() => selectStep(null), [selectStep])

  const handleNodeDragStart: OnNodeDrag = useCallback(() => {
    isDragging.current = true
    setDragging(true)
    dragOrderRef.current = []  // reset; handleNodeDrag will populate it
  }, [])

  // Live preview: slide other steps aside as the dragged step passes through them.
  // We also record the latest sort order in dragOrderRef so handleNodeDragStop
  // commits the order that the user actually sees, not a stale currentNodes snapshot.
  const handleNodeDrag: OnNodeDrag = useCallback(
    (_e, draggedNode) => {
      const dragY = draggedNode.position.y
      setNodes((prev) => {
        const stepNodes = prev.filter((n) => !NON_STEP_IDS.has(n.id))

        const sorted = [...stepNodes].sort((a, b) => {
          const ay = a.id === draggedNode.id ? dragY : a.position.y
          const by = b.id === draggedNode.id ? dragY : b.position.y
          return ay - by
        })

        // Keep the committed order in sync with what the user sees
        dragOrderRef.current = sorted.map((n) => n.id)

        return prev.map((n) => {
          if (NON_STEP_IDS.has(n.id)) return n
          if (n.id === draggedNode.id) return n  // React Flow owns the dragged position
          const newIdx = sorted.findIndex((s) => s.id === n.id)
          if (newIdx === -1) return n
          return { ...n, position: { x: 0, y: newIdx * (NODE_HEIGHT + V_GAP) } }
        })
      })
    },
    [setNodes],
  )

  // On drop: commit the live-preview order, snap every node to its grid slot
  const handleNodeDragStop: OnNodeDrag = useCallback(() => {
    isDragging.current = false
    setDragging(false)

    const orderedIds = dragOrderRef.current
    if (orderedIds.length === 0) return  // node was clicked but not actually moved

    reorderSteps(orderedIds)

    setNodes((prev) =>
      prev.map((n) => {
        if (NON_STEP_IDS.has(n.id)) return n
        const idx = orderedIds.indexOf(n.id)
        if (idx === -1) return n
        return { ...n, position: { x: 0, y: idx * (NODE_HEIGHT + V_GAP) } }
      }),
    )
  }, [reorderSteps, setNodes])

  return (
    <div className="flex-1 min-h-0">
      <ReactFlow
        nodes={nodes}
        edges={dragging ? [] : edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        onPaneClick={handlePaneClick}
        onNodeDragStart={handleNodeDragStart}
        onNodeDrag={handleNodeDrag}
        onNodeDragStop={handleNodeDragStop}
        nodesDraggable
        nodeDragThreshold={2}
        fitView
        fitViewOptions={{ padding: 0.18 }}
        minZoom={0.25}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
        className="bg-surface"
        selectionOnDrag={false}
        elementsSelectable={false}
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
