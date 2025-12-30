'use client'

import { FormEvent, useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { FlowViewer } from '@/components/flow/FlowViewer'
import { FlowchartContent } from '@/types/flow'
import { publishModuleAction } from './actions'

const DEFAULT_FLOW_CONTENT: FlowchartContent = {
  nodes: [
    {
      id: 'start-1',
      type: 'start-node',
      position: { x: 120, y: 40 },
      data: {
        label: 'Início da jornada',
        description: 'Paciente chega ao ponto de atendimento',
      },
    },
    {
      id: 'action-1',
      type: 'action-node',
      position: { x: 120, y: 170 },
      data: {
        label: 'Coleta de dados',
        description: 'Registrar sinais vitais e contexto clínico',
      },
    },
    {
      id: 'decision-1',
      type: 'decision-node',
      position: { x: 340, y: 170 },
      data: {
        label: 'Estado crítico?',
        description: 'Avaliar parâmetros de risco',
      },
    },
    {
      id: 'action-2',
      type: 'action-node',
      position: { x: 340, y: 320 },
      data: {
        label: 'Intervenção prioritária',
        description: 'Priorizar condutas de emergência',
      },
    },
    {
      id: 'risk-1',
      type: 'risk-node',
      position: { x: 120, y: 320 },
      data: {
        label: 'Monitoramento',
        description: 'Atualizar métricas e observações',
      },
    },
  ],
  edges: [
    { id: 'e1', source: 'start-1', target: 'action-1', type: 'smoothstep' },
    { id: 'e2', source: 'action-1', target: 'decision-1', type: 'smoothstep' },
    { id: 'e3', source: 'decision-1', target: 'action-2', type: 'smoothstep', label: 'Sim' },
    { id: 'e4', source: 'decision-1', target: 'risk-1', type: 'smoothstep', label: 'Não' },
  ],
  viewport: { x: 0, y: 0, zoom: 1 },
}

const DEFAULT_JSON = JSON.stringify(DEFAULT_FLOW_CONTENT, null, 2)

const SCHEMA_HINT = JSON.stringify(
  {
    nodes: [
      {
        id: 'node-id',
        type: 'action-node',
        position: { x: 0, y: 0 },
        data: { label: 'Título', description: 'Explica o passo' },
      },
    ],
    edges: [
      {
        id: 'edge-id',
        source: 'node-id',
        target: 'node-id',
        type: 'smoothstep',
      },
    ],
    viewport: { x: 0, y: 0, zoom: 1 },
  },
  null,
  2
)

export default function AdminEditorPage() {
  const [jsonInput, setJsonInput] = useState(DEFAULT_JSON)
  const [previewData, setPreviewData] = useState<FlowchartContent>(DEFAULT_FLOW_CONTENT)
  const [jsonError, setJsonError] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [isSaving, startTransition] = useTransition()

  const handleJsonChange = (value: string) => {
    setJsonInput(value)
    if (!value.trim()) {
      setJsonError('Cole o JSON do fluxograma para habilitar o preview.')
      return
    }

    try {
      const parsed = JSON.parse(value)
      if (!Array.isArray(parsed.nodes) || !Array.isArray(parsed.edges)) {
        throw new Error('O JSON precisa conter arrays "nodes" e "edges".')
      }
      setPreviewData(parsed as FlowchartContent)
      setJsonError(null)
    } catch (err: any) {
      setJsonError(err?.message ?? 'JSON inválido')
    }
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (jsonError) {
      setStatusMessage('Corrija o JSON antes de publicar.')
      return
    }

    const formData = new FormData(event.currentTarget)
    startTransition(async () => {
      setStatusMessage('Publicando módulo...')
      try {
        await publishModuleAction(formData)
        setStatusMessage('Módulo publicado com sucesso.')
      } catch (err: any) {
        setStatusMessage(err?.message ?? 'Falha ao publicar o módulo.')
      }
    })
  }

  return (
    <section className="min-h-screen p-8">
      <div className="flex flex-col gap-6">
        <header className="space-y-2">
          <p className="text-sm uppercase tracking-wide text-slate-500">Fábrica de Conteúdo</p>
          <h1 className="text-3xl font-semibold text-white">Editor de Fluxogramas</h1>
          <p className="max-w-3xl text-sm text-slate-400">
            Cole o JSON gerado pela IA à esquerda, visualize o fluxograma à direita e publique o módulo direto no banco de
            dados da plataforma.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-3xl border border-slate-800 bg-slate-950 p-6 shadow-lg">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-lg font-semibold text-white">Editor JSON</h2>
              <span className="text-xs uppercase tracking-widest text-slate-500">Modelo padrão</span>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200" htmlFor="moduleTitle">
                Título do módulo
              </label>
              <input
                id="moduleTitle"
                name="title"
                required
                className="w-full rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-white outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
                placeholder="Ex: Cuidados imediatos na emergência"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200" htmlFor="moduleDescription">
                Descrição
              </label>
              <textarea
                id="moduleDescription"
                name="description"
                rows={2}
                className="w-full rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-white outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
                placeholder="Descreva brevemente o contexto do fluxograma"
              />
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-200" htmlFor="flowJson">
                  JSON do fluxograma
                </label>
                {jsonError ? (
                  <span className="text-xs text-rose-400">{jsonError}</span>
                ) : (
                  <span className="text-xs text-emerald-400">JSON válido</span>
                )}
              </div>
              <textarea
                id="flowJson"
                name="content"
                value={jsonInput}
                onChange={(event) => handleJsonChange(event.target.value)}
                className="h-[420px] w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-xs font-mono text-slate-100 outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
                spellCheck="false"
              />
            </div>

            <div className="overflow-hidden rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 p-3 text-xs text-slate-400">
              <span className="block font-semibold text-slate-200">Estrutura mínima:</span>
              <pre className="max-h-32 overflow-auto whitespace-pre-wrap text-[11px]">{SCHEMA_HINT}</pre>
            </div>

            <div className="mt-auto flex flex-col gap-2">
              <Button type="submit" disabled={Boolean(jsonError) || isSaving}>
                {isSaving ? 'Publicando...' : 'Publicar Módulo'}
              </Button>
              {statusMessage && (
                <p className="text-sm text-slate-300">{statusMessage}</p>
              )}
            </div>
          </form>

          <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Pré-visualização</h2>
              <span className="text-xs uppercase tracking-[0.3em] text-slate-500">React Flow</span>
            </div>
            <div className="h-[520px]">
              <FlowViewer data={previewData} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}




