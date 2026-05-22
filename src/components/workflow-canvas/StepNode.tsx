import { Handle, Position, type NodeProps } from '@xyflow/react'
import { User, GripHorizontal } from 'lucide-react'
import { QUESTION_TYPE_LABELS } from '@/types/workflow-step'
import { useAgentsStore } from '@/store/agents'
import { cn } from '@/lib/utils'
import type { Question } from '@/types/workflow-step'

export function StepNode({ data }: NodeProps) {
  const { order, name, agentRole, agentId, questions, isSelected } = data as {
    order:     number
    name:      string
    agentRole: string
    agentId?:  string
    questions: Question[]
    isSelected: boolean
  }

  const agents     = useAgentsStore((s) => s.agents)
  const agentName  = agentId ? (agents.find((a) => a.id === agentId)?.name ?? agentRole) : agentRole
  const agentTitle = agentId ? (agents.find((a) => a.id === agentId)?.role ?? '') : ''
  const uniqueTypes = [...new Set(questions.map((q) => q.type))]

  return (
    <div
      className={cn(
        'step-node-card bg-white rounded-xl border transition-all w-[300px] cursor-pointer',
        isSelected
          ? 'border-primary ring-2 ring-primary/20 shadow-[0px_4px_12px_rgba(5,96,51,0.15)]'
          : 'border-border shadow-[0px_1px_3px_rgba(16,24,40,0.08)] hover:border-border-strong hover:shadow-[0px_2px_8px_rgba(16,24,40,0.10)]',
      )}
    >
      <Handle type="target" position={Position.Top}
        className="!bg-border-strong !w-2.5 !h-2.5 !border-2 !border-white" />

      {/* Drag handle — only zone that triggers React Flow drag */}
      <div className="drag-handle flex items-center justify-center py-2 border-b border-border cursor-grab active:cursor-grabbing hover:bg-surface transition-colors">
        <GripHorizontal size={14} className="text-text-muted" />
      </div>

      <div className="nodrag p-4">
        <div className="flex items-start gap-3 mb-3">
          <span className={cn(
            'flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold shrink-0 mt-0.5 transition-colors',
            isSelected ? 'bg-primary text-white' : 'bg-brand-50 text-primary',
          )}>
            {order}
          </span>
          <h3 className="text-sm font-semibold text-text-primary leading-5">{name}</h3>
        </div>

        {agentName && (
          <div className="flex items-start gap-2 mb-3">
            <User size={12} className="text-text-muted shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-xs text-text-secondary leading-4 font-medium truncate">{agentName}</p>
              {agentTitle && (
                <p className="text-[10px] text-text-muted leading-3 mt-0.5 truncate">{agentTitle}</p>
              )}
            </div>
          </div>
        )}

        {uniqueTypes.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {uniqueTypes.map((type) => (
              <span key={type}
                className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-surface text-text-tertiary border border-border">
                {QUESTION_TYPE_LABELS[type] ?? type}
              </span>
            ))}
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Bottom}
        className="!bg-border-strong !w-2.5 !h-2.5 !border-2 !border-white" />
    </div>
  )
}
