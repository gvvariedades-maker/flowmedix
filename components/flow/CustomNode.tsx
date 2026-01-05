'use client'

import { Handle, Position } from '@xyflow/react'
import { CustomNodeData, CustomNodeType } from '@/types/flow'
import * as Icons from 'lucide-react'

interface CustomNodeProps {
  data: CustomNodeData
  type?: CustomNodeType
  selected?: boolean
}

export function CustomNode({ data, type, selected }: CustomNodeProps) {
  // Buscar ícone do lucide-react usando o nome do ícone em data.icon
  const iconName = (data.icon || 'Zap') as keyof typeof Icons
  const RawIcon = Icons[iconName]
  const IconComponent = typeof RawIcon === 'function' ? (RawIcon as React.ComponentType<any>) : Icons.Zap
  
  // Cores do gradiente (mesmas do Laboratório)
  const colorStart = data.colorStart || '#2563eb'
  const colorEnd = data.colorEnd || '#1e40af'
  
  // Labels e títulos
  const nodeLabel = data.label || 'PASSO'
  const nodeTitle = data.title || data.label || 'Sem Título'
  
  return (
    <div
      className="relative aspect-square w-[280px] rounded-[3rem] p-8 overflow-hidden border border-white/30 group transition-all flex flex-col items-center justify-center text-center"
      style={{
        background: `linear-gradient(135deg, ${colorStart} 0%, ${colorEnd} 100%)`,
        boxShadow: `0 25px 50px -12px ${colorStart}66`,
      }}
    >
      {/* Handles invisíveis */}
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-transparent !border-none !w-0 !h-0 !min-w-0 !min-h-0"
        style={{
          background: 'transparent',
          border: 'none',
          width: 0,
          height: 0,
          minWidth: 0,
          minHeight: 0,
          pointerEvents: 'none',
        }}
      />
      
      {/* Camada de Vidro Superior (Glassmorphism) */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/25 to-transparent opacity-40 pointer-events-none" />
      
      {/* Brilho de Fundo Dinâmico */}
      <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />

      {/* Ícone Estilo Cápsula */}
      <div className="relative z-10 p-5 bg-white/20 backdrop-blur-2xl rounded-[2.2rem] mb-6 border border-white/40 shadow-xl group-hover:rotate-12 transition-transform duration-500">
        <IconComponent className="text-white drop-shadow-lg" size={48} strokeWidth={2.5} />
      </div>

      {/* Texto Hierárquico */}
      <div className="relative z-10 space-y-2">
        <span className="text-[11px] font-black text-white/80 uppercase tracking-[0.5em] block">
          {nodeLabel}
        </span>
        <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter leading-none drop-shadow-2xl px-2">
          {nodeTitle}
        </h3>
      </div>

      {/* Efeito de Varredura de Luz (Sweep) */}
      <div className="absolute inset-0 translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent rotate-12 pointer-events-none" />

      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-transparent !border-none !w-0 !h-0 !min-w-0 !min-h-0"
        style={{
          background: 'transparent',
          border: 'none',
          width: 0,
          height: 0,
          minWidth: 0,
          minHeight: 0,
          pointerEvents: 'none',
        }}
      />
    </div>
  )
}

