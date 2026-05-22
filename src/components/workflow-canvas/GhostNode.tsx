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
    <div className="flex flex-col items-center gap-3 nodrag nopan">
      {!isEmpty && (
        <Handle
          type="target"
          position={Position.Top}
          className="!opacity-0 !pointer-events-none"
          style={{ width: 0, height: 0 }}
        />
      )}

      <button
        onClick={addStep}
        className={cn(
          'flex items-center justify-center border-2 border-dashed rounded-xl transition-all group',
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

      {isEmpty && (
        <span className="text-sm text-text-muted select-none pointer-events-none whitespace-nowrap">
          Ajouter une première étape…
        </span>
      )}
    </div>
  )
}
