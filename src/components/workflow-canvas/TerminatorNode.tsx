'use client'

import { Handle, Position, type NodeProps } from '@xyflow/react'
import { Play, Square } from 'lucide-react'
import { cn } from '@/lib/utils'

type TerminatorData = { variant: 'start' | 'end' }

export function TerminatorNode({ data }: NodeProps) {
  const { variant } = data as TerminatorData
  const isStart = variant === 'start'

  return (
    <div className="nodrag nopan flex flex-col items-center gap-2 select-none w-[300px]">
      {!isStart && (
        <Handle
          type="target"
          position={Position.Top}
          className="!bg-border-strong !w-2.5 !h-2.5 !border-2 !border-white"
        />
      )}

      <div
        className={cn(
          'flex items-center justify-center w-14 h-14 rounded-full shadow-sm',
          isStart ? 'bg-[#12b76a]' : 'bg-[#f04438]',
        )}
      >
        {isStart
          ? <Play  size={20} className="text-white fill-white ml-1" />
          : <Square size={16} className="text-white fill-white" />
        }
      </div>

      <span className="text-xs font-semibold text-text-secondary pointer-events-none text-center leading-tight whitespace-nowrap">
        {isStart ? 'Début de processus' : 'Fin de processus'}
      </span>

      {isStart && (
        <Handle
          type="source"
          position={Position.Bottom}
          className="!bg-border-strong !w-2.5 !h-2.5 !border-2 !border-white"
        />
      )}
    </div>
  )
}
