'use client'

import { useState } from 'react'
import { getSmoothStepPath, EdgeLabelRenderer, type EdgeProps } from '@xyflow/react'
import { Plus } from 'lucide-react'
import { useWorkflowBuilderStore } from '@/store/workflow-builder'

export function AddButtonEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  markerEnd,
  source,
}: EdgeProps) {
  const insertStep = useWorkflowBuilderStore((s) => s.insertStep)
  const [hovered, setHovered] = useState(false)

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  return (
    <>
      {/* Wide invisible stroke for easy hover detection */}
      <path
        d={edgePath}
        fill="none"
        strokeWidth={20}
        stroke="transparent"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      />
      {/* Visible stroke */}
      <path
        id={id}
        d={edgePath}
        fill="none"
        strokeWidth={1.5}
        stroke="#d0d5dd"
        markerEnd={markerEnd as string}
        className="react-flow__edge-path"
      />

      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
            opacity: hovered ? 1 : 0,
            transition: 'opacity 0.12s',
          }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <button
            onClick={() => insertStep(source)}
            className="flex items-center justify-center w-5 h-5 rounded bg-white border border-border shadow-sm text-text-muted hover:border-primary hover:text-primary hover:bg-brand-50 transition-colors"
          >
            <Plus size={11} />
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  )
}
