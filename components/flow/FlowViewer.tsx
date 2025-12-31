'use client'

import { useEffect } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useEdgesState,
  useNodesState,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { CustomNode } from './CustomNode'
import { FlowchartContent } from '@/types/flow'

const nodeTypes = {
  'start-node': CustomNode,
  'action-node': CustomNode,
  'decision-node': CustomNode,
  'risk-node': CustomNode,
}

export interface FlowViewerProps {
  data: FlowchartContent
}

export function FlowViewer({ data }: FlowViewerProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(data.nodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(data.edges)

  useEffect(() => {
    setNodes(data.nodes)
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
        fitView
        nodesConnectable={false}
        nodesDraggable={false}
        panOnScroll
        zoomOnScroll
        minZoom={0.5}
        maxZoom={2.5}
        className="h-full bg-slate-950"
      >
        <Background color="#0f172a" gap={16} />
        <Controls className="bg-slate-900 border-slate-800" />
        <MiniMap nodeColor={() => '#22d3ee'} />
      </ReactFlow>
    </div>
  )
}





