'use client'

import { useCallback, useMemo } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  Connection,
  useEdgesState,
  useNodesState,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { CustomNode } from './CustomNode'
import { FlowchartContent } from '@/types/flow'

interface StudyFlowProps {
  initialData?: FlowchartContent
}

const mockFlowchartData: FlowchartContent = {
  nodes: [
    {
      id: '1',
      type: 'start-node',
      position: { x: 250, y: 50 },
      data: {
        label: 'Paciente chega ao PS',
        description: 'Triagem inicial',
      },
    },
    {
      id: '2',
      type: 'decision-node',
      position: { x: 250, y: 200 },
      data: {
        label: 'Estado crítico?',
        description: 'Avaliar sinais vitais',
      },
    },
    {
      id: '3',
      type: 'action-node',
      position: { x: 100, y: 350 },
      data: {
        label: 'Protocolo de emergência',
        description: 'Ativar equipe de reanimação',
      },
    },
    {
      id: '4',
      type: 'action-node',
      position: { x: 400, y: 350 },
      data: {
        label: 'Triagem padrão',
        description: 'Encaminhar para avaliação',
      },
    },
    {
      id: '5',
      type: 'risk-node',
      position: { x: 250, y: 500 },
      data: {
        label: 'Monitorar sinais vitais',
        description: 'Atenção contínua',
      },
    },
  ],
  edges: [
    {
      id: 'e1-2',
      source: '1',
      target: '2',
      type: 'smoothstep',
      animated: true,
    },
    {
      id: 'e2-3',
      source: '2',
      target: '3',
      type: 'smoothstep',
      label: 'Sim',
      animated: true,
    },
    {
      id: 'e2-4',
      source: '2',
      target: '4',
      type: 'smoothstep',
      label: 'Não',
      animated: true,
    },
    {
      id: 'e3-5',
      source: '3',
      target: '5',
      type: 'smoothstep',
      animated: true,
    },
    {
      id: 'e4-5',
      source: '4',
      target: '5',
      type: 'smoothstep',
      animated: true,
    },
  ],
  viewport: { x: 0, y: 0, zoom: 1 },
}

const nodeTypes = {
  'start-node': CustomNode,
  'action-node': CustomNode,
  'decision-node': CustomNode,
  'risk-node': CustomNode,
}

export function StudyFlow({ initialData }: StudyFlowProps) {
  const flowchartData = initialData ?? mockFlowchartData
  const [nodes, setNodes, onNodesChange] = useNodesState(flowchartData.nodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(flowchartData.edges)

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => addEdge(params, eds))
    },
    [setEdges]
  )

  const miniMapNodeColor = useMemo(() => {
    return (node: any) => {
      switch (node.type) {
        case 'start-node':
          return '#0d9488'
        case 'action-node':
          return '#06b6d4'
        case 'decision-node':
          return '#eab308'
        case 'risk-node':
          return '#f43f5e'
        default:
          return '#64748b'
      }
    }
  }, [])

  return (
    <div className="w-full h-full bg-slate-950">
      <div className="h-full">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          className="bg-slate-950"
        >
          <Background color="#334155" gap={16} />
          <Controls className="bg-slate-800 border-slate-700" />
          <MiniMap className="bg-slate-800 border-slate-700" nodeColor={miniMapNodeColor} />
        </ReactFlow>
      </div>
    </div>
  )
}

