'use client'

import { Handle, Position, type NodeProps } from '@xyflow/react'
import { Plus } from 'lucide-react'
import { useWorkflowBuilderStore } from '@/store/workflow-builder'
import { cn } from '@/lib/utils'

type GhostData = { isEmpty: boolean }

export function GhostNode({ data }: NodeProps) {
  const addStep = useWorkflowBuilderStore((s) => s.addStep)
  const { isEmpty } = data as GhostData

  return (
    <div className="flex flex-col items-center gap-3 nodrag nopan w-[300px]">
      <Handle
        type="target"
        position={Position.Top}
        className="!opacity-0 !pointer-events-none"
        style={{ width: 0, height: 0 }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!opacity-0 !pointer-events-none"
        style={{ width: 0, height: 0 }}
      />

      <div className="relative group">
        <button
          onClick={addStep}
          className={cn(
            'flex items-center justify-center border-2 border-dashed rounded-xl transition-all',
            isEmpty
              ? 'w-[120px] h-[120px] border-border hover:border-primary hover:bg-brand-50/40'
              : 'w-[56px] h-[56px] border-border hover:border-primary hover:bg-brand-50/40',
          )}
        >
          <Plus
            size={isEmpty ? 22 : 16}
            className="text-text-muted group-hover:text-primary transition-colors"
          />
        </button>

        {!isEmpty && (
          <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
            <div className="bg-overlay text-white text-xs font-semibold px-2.5 py-1.5 rounded-md shadow-lg whitespace-nowrap">
              Ajouter une étape
            </div>
            <div className="mx-auto mt-0.5 h-0 w-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-overlay" />
          </div>
        )}
      </div>

      {isEmpty && (
        <span className="text-sm text-text-muted select-none pointer-events-none whitespace-nowrap">
          Ajouter une première étape…
        </span>
      )}
    </div>
  )
}
