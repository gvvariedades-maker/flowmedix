'use client'

import { useEffect } from 'react'
import {
  ReactFlow,
  Controls,
  MiniMap,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { CustomNode } from './CustomNode'
import { FlowchartContent } from '@/types/flow'

// Mapear todos os tipos de nodes possíveis para o CustomNode
// Isso garante compatibilidade com qualquer tipo definido no Laboratório
const nodeTypes: Record<string, typeof CustomNode> = {
  'start-node': CustomNode,
  'action-node': CustomNode,
  'decision-node': CustomNode,
  'risk-node': CustomNode,
  'custom': CustomNode,
  'acao': CustomNode,
  'decisao': CustomNode,
  'inicio': CustomNode,
  'risco': CustomNode,
  // Fallback padrão para qualquer tipo não mapeado
  'default': CustomNode,
}

export interface FlowViewerProps {
  data: FlowchartContent
}

function FlowViewerInner() {
  const { fitView } = useReactFlow()

  // Aplicar fitView quando o componente montar
  useEffect(() => {
    const timer = setTimeout(() => {
      fitView({ padding: 0.2, duration: 400, maxZoom: 1.2 })
    }, 200)
    return () => clearTimeout(timer)
  }, [fitView])

  return (
    <>
      {/* Removido Background dots para visual mais limpo */}
      <Controls className="bg-slate-900 border-slate-800" />
      <MiniMap nodeColor={() => '#22d3ee'} />
    </>
  )
}

export function FlowViewer({ data }: FlowViewerProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(data.nodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(data.edges)

  useEffect(() => {
    // Garantir que todos os nodes tenham um tipo válido
    const normalizedNodes = data.nodes.map((node) => ({
      ...node,
      type: node.type && nodeTypes[node.type] ? node.type : 'action-node',
    }))
    setNodes(normalizedNodes)
  }, [data.nodes, setNodes])

  useEffect(() => {
    setEdges(data.edges)
  }, [data.edges, setEdges])

  return (
    <div className="h-full w-full rounded-2xl border border-slate-800 bg-slate-950 shadow-inner">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        defaultNodeOptions={{
          type: 'action-node',
        }}
        fitView
        fitViewOptions={{ padding: 0.2, duration: 400, maxZoom: 1.2 }}
        nodesConnectable={false}
        nodesDraggable={false}
        zoomOnScroll
        panOnScroll
        minZoom={0.5}
        maxZoom={2.5}
        className="h-full bg-slate-950"
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
      >
        <FlowViewerInner />
      </ReactFlow>
    </div>
  )
}










