'use client'

import { useEffect, useState, useMemo } from 'react'
import { FlowchartContent, CustomEdge, CustomNodeType } from '@/types/flow'
import { FlowViewer } from './flow/FlowViewer'

type SimplifiedStep = {
  id?: string
  title?: string
  description?: string
  icon?: string
  type?: CustomNodeType
}

type SimplifiedFlowchart = {
  steps?: SimplifiedStep[]
}

type FlowchartRawData = FlowchartContent | SimplifiedFlowchart | string | { conteudo_json?: FlowchartContent } | { content?: FlowchartContent }

const DEFAULT_VIEWPORT = { x: 0, y: 0, zoom: 1 }

function normalizeFlowchartContent(raw: FlowchartRawData): FlowchartContent {
  let data: any = raw
  
  // Parse string para objeto
  if (typeof raw === 'string') {
    try {
      data = JSON.parse(raw)
    } catch {
      console.warn('⚠️ Erro ao parsear string JSON')
      data = {}
    }
  }

  // Se for null ou undefined, retornar estrutura vazia
  if (!data || (typeof data === 'object' && Object.keys(data).length === 0)) {
    console.warn('⚠️ Dados vazios ou inválidos')
    return {
      nodes: [],
      edges: [],
      viewport: DEFAULT_VIEWPORT,
    }
  }

  // Buscar nodes em múltiplos caminhos possíveis
  let finalNodes: any[] = []
  let finalEdges: any[] = []
  let finalViewport = DEFAULT_VIEWPORT

  // 1. Tentar data.nodes (estrutura direta FlowchartContent)
  if (Array.isArray(data.nodes)) {
    console.log('✅ Encontrado nodes em data.nodes')
    finalNodes = data.nodes
    finalEdges = Array.isArray(data.edges) ? data.edges : []
    finalViewport = data.viewport || DEFAULT_VIEWPORT
  }
  // 2. Tentar data.content.nodes (quando está dentro de uma propriedade content)
  else if (data.content && Array.isArray(data.content.nodes)) {
    console.log('✅ Encontrado nodes em data.content.nodes')
    finalNodes = data.content.nodes
    finalEdges = Array.isArray(data.content.edges) ? data.content.edges : []
    finalViewport = data.content.viewport || DEFAULT_VIEWPORT
  }
  // 3. Tentar data.conteudo_json.nodes (formato antigo)
  else if (data.conteudo_json && Array.isArray(data.conteudo_json.nodes)) {
    console.log('✅ Encontrado nodes em data.conteudo_json.nodes')
    finalNodes = data.conteudo_json.nodes
    finalEdges = Array.isArray(data.conteudo_json.edges) ? data.conteudo_json.edges : []
    finalViewport = data.conteudo_json.viewport || DEFAULT_VIEWPORT
  }
  // 4. Tentar formato simplificado com steps
  else if (Array.isArray(data.steps)) {
    console.log('✅ Encontrado formato simplificado com steps')
    finalNodes = data.steps.map((step: any, index: number) => ({
      id: step.id || `step-${index}`,
      type: step.type ?? 'action-node',
      data: {
        label: step.title || `Passo ${index + 1}`,
        description: step.description,
        icon: step.icon,
      },
      position: step.position || { x: 250, y: index * 150 },
    }))

    finalEdges = finalNodes
      .slice(1)
      .map((node: any, index: number) => ({
        id: `edge-${index}`,
        source: finalNodes[index].id,
        target: node.id,
        animated: true,
      }))
  }

  // Log detalhado da estrutura encontrada
  if (finalNodes.length === 0) {
    console.error('❌ Nenhum node encontrado. Estrutura do objeto recebido:', {
      keys: Object.keys(data),
      hasNodes: 'nodes' in data,
      hasContent: 'content' in data,
      hasConteudoJson: 'conteudo_json' in data,
      hasSteps: 'steps' in data,
      dataPreview: JSON.stringify(data).substring(0, 200),
    })
  }

  return {
    nodes: finalNodes,
    edges: finalEdges,
    viewport: finalViewport,
  }
}

interface FlowchartProps {
  data: FlowchartRawData
}

export default function Flowchart({ data }: FlowchartProps) {
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  
  // Normalizar e processar os dados usando useMemo para evitar recálculos
  const payload = useMemo(() => {
    const safeData = normalizeFlowchartContent(data)
    
    // Melhorar os nodes com valores padrão se necessário
    // Garantir que todos os dados do Laboratório sejam preservados
    // Organizar nodes em grid (3 colunas como no Laboratório)
    const NODE_WIDTH = 280
    const NODE_HEIGHT = 280
    const GAP = 32 // gap-8 = 32px
    const COLS = 3 // grid-cols-3
    
    const enhancedNodes = safeData.nodes.map((node, index) => {
      // Garantir que o label seja sempre mapeado corretamente
      const nodeLabel = node.data?.label || 
                       node.data?.title || 
                       node.label || 
                       node.title || 
                       `Passo ${index + 1}`
      
      // Calcular posição em grid (3 colunas)
      const col = index % COLS
      const row = Math.floor(index / COLS)
      const gridX = col * (NODE_WIDTH + GAP)
      const gridY = row * (NODE_HEIGHT + GAP)
      
      return {
        ...node,
        id: node.id || `node-${index}`,
        type: node.type || 'action-node', // Garantir tipo padrão
        // Usar posição do node se existir, senão calcular em grid
        position: node.position || { x: gridX, y: gridY },
        data: {
          // Preservar todas as propriedades originais do node.data
          ...node.data,
          // Garantir que label e title estejam sempre presentes
          label: node.data?.label || node.label || nodeLabel,
          title: node.data?.title || node.title || nodeLabel,
          // Preservar cores do gradiente (importantes para o estilo do Laboratório)
          colorStart: node.data?.colorStart || node.colorStart || '#2563eb',
          colorEnd: node.data?.colorEnd || node.colorEnd || '#1e40af',
          // Preservar ícone
          icon: node.data?.icon || node.icon || 'Zap',
          // Preservar outras propriedades
          description: node.data?.description || node.description || '',
          gradient: node.data?.gradient || node.gradient,
          menu_content: node.data?.menu_content || node.menu_content,
        },
      }
    })
    
    return { ...safeData, nodes: enhancedNodes }
  }, [data])
  
  const safeData = useMemo(() => normalizeFlowchartContent(data), [data])

  useEffect(() => {
    console.log('🔍 Flowchart: Processando dados...', {
      nodesCount: payload.nodes.length,
      edgesCount: payload.edges.length,
      dataType: typeof data,
      hasData: !!data,
      dataKeys: typeof data === 'object' && data !== null ? Object.keys(data) : [],
      rawDataPreview: typeof data === 'object' && data !== null ? JSON.stringify(data).substring(0, 300) : String(data).substring(0, 100)
    })
    
    // Se encontrou nodes, renderizar imediatamente (sem timeout)
    if (payload.nodes.length > 0) {
      console.log('✅ Flowchart: Nodes encontrados, renderizando imediatamente...', {
        nodesCount: payload.nodes.length,
        firstNode: payload.nodes[0]
      })
      setLoading(false)
      setLoadError(null)
      return
    }
    
    // Se não encontrou nodes, aguardar um pouco para ver se os dados chegam
    console.warn('⚠️ Flowchart: Nenhum node encontrado ainda, aguardando...')
    const timer = setTimeout(() => {
      console.error('❌ Flowchart: Timeout - não foi possível carregar os dados após 5s')
      setLoading(false)
      setLoadError('Não foi possível carregar os dados do fluxograma. Verifique se o conteúdo está no formato correto.')
    }, 5000)
    
    return () => clearTimeout(timer)
  }, [payload.nodes.length, payload.edges.length, data])

  // Se ainda está carregando, mostrar loading
  if (loading && payload.nodes.length === 0) {
    return (
      <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-white/30 bg-slate-950">
        <p className="text-sm text-slate-400">Carregando fluxo...</p>
      </div>
    )
  }

  // Se há erro, mostrar mensagem
  if (loadError) {
    return (
      <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-rose-500/50 bg-slate-950">
        <p className="text-sm text-rose-400">{loadError}</p>
      </div>
    )
  }

  // Se não há nodes após processamento, mostrar mensagem
  if (!safeData.nodes || safeData.nodes.length === 0) {
    return (
      <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-white/30 bg-slate-950">
        <p className="text-sm text-slate-400">Nenhum conteúdo encontrado no fluxograma.</p>
      </div>
    )
  }

  // Renderizar o fluxograma
  return <FlowViewer data={payload} />
}

