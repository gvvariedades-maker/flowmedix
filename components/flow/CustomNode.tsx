'use client'

import { Handle, Position } from '@xyflow/react'
import { CustomNodeData, CustomNodeType } from '@/types/flow'
import { cn } from '@/lib/utils'
import { 
  PlayCircle, 
  Activity, 
  HelpCircle, 
  AlertTriangle 
} from 'lucide-react'

interface CustomNodeProps {
  data: CustomNodeData
  type: CustomNodeType
  selected?: boolean
}

const nodeConfig = {
  'start-node': {
    bgColor: 'bg-teal-600',
    borderColor: 'border-teal-500',
    icon: PlayCircle,
    label: 'Início',
  },
  'action-node': {
    bgColor: 'bg-cyan-500',
    borderColor: 'border-cyan-400',
    icon: Activity,
    label: 'Ação',
  },
  'decision-node': {
    bgColor: 'bg-yellow-500',
    borderColor: 'border-yellow-400',
    icon: HelpCircle,
    label: 'Decisão',
  },
  'risk-node': {
    bgColor: 'bg-rose-500',
    borderColor: 'border-rose-400',
    icon: AlertTriangle,
    label: 'Risco',
  },
}

export function CustomNode({ data, type, selected }: CustomNodeProps) {
  const config = nodeConfig[type]
  const Icon = config.icon

  return (
    <div
      className={cn(
        'px-4 py-3 shadow-lg rounded-lg border-2 min-w-[200px]',
        config.bgColor,
        config.borderColor,
        selected && 'ring-2 ring-offset-2 ring-cyan-400'
      )}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-teal-400 !w-3 !h-3"
      />
      
      <div className="flex items-start gap-2">
        <Icon className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <div className="text-xs font-semibold text-white/80 mb-1">
            {config.label}
          </div>
          <div className="text-sm font-medium text-white">
            {data.label}
          </div>
          {data.description && (
            <div className="text-xs text-white/70 mt-1">
              {data.description}
            </div>
          )}
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-teal-400 !w-3 !h-3"
      />
    </div>
  )
}

