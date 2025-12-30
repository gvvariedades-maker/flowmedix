'use client'

import { useEffect, useMemo, useState } from 'react'
import { DecisionSimulator } from '@/components/DecisionSimulator'
import { DecisionFlowData } from '@/types/simulator'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'

const DEFAULT_FLOW: DecisionFlowData = {
  title: 'Novo Simulador',
  steps: [
    {
      id: 'step-0',
      title: 'Passo Inicial',
      question: 'Deseja iniciar o protocolo?',
      options: [
        { id: 'opt-yes', label: 'Sim', outcome: 'Ótimo! Avançaremos para o próximo passo.', next: 1, status: 'success' },
        { id: 'opt-no', label: 'Não', outcome: 'Você precisa iniciar o protocolo para continuar.', next: 99, status: 'error', feedback: 'Você precisa iniciar o protocolo para continuar.' }
      ],
    }
  ]
}

export function SimulatorAdminPanel() {
  const [moduleId, setModuleId] = useState('')
  const [modules, setModules] = useState<{ id: string; title: string }[]>([])
  const [jsonInput, setJsonInput] = useState(JSON.stringify(DEFAULT_FLOW, null, 2))
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [isPublishing, setIsPublishing] = useState(false)
  const [jsonError, setJsonError] = useState<string | null>(null)

  // Busca os módulos para o Dropdown
  useEffect(() => {
    async function fetchModules() {
      const { data, error } = await supabase
        .from('modules')
        .select('id, title')
        .order('title', { ascending: true })
      
      if (error) {
        setStatusMessage('Erro ao carregar módulos.')
      } else {
        setModules(data || [])
      }
    }
    fetchModules()
  }, [])

  // Processa o JSON para a Pré-visualização
  const parsedFlow = useMemo(() => {
    try {
      const parsed = JSON.parse(jsonInput)
      setJsonError(null)
      return parsed as DecisionFlowData
    } catch (err: any) {
      setJsonError('JSON inválido')
      return null
    }
  }, [jsonInput])

  // Função para Colar do Clipboard
  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText()
      setJsonInput(text)
      setStatusMessage('JSON colado com sucesso!')
      setTimeout(() => setStatusMessage(null), 3000)
    } catch (err) {
      setStatusMessage('Erro ao ler área de transferência.')
    }
  }

  // Função para Salvar no Supabase
  const handleSave = async () => {
    if (!moduleId) {
      setStatusMessage('Selecione um módulo primeiro!')
      return
    }
    if (jsonError) {
      setStatusMessage('Corrija o JSON antes de salvar.')
      return
    }

    if (!parsedFlow) {
      setStatusMessage('JSON inválido. Não há dados para salvar.')
      return
    }

    setIsPublishing(true)
    try {
      console.log('ID do Módulo:', moduleId)
      console.log('Dados do JSON:', parsedFlow)
      alert('Tentando atualizar módulo: ' + moduleId)
      console.log('Payload sendo enviado:', { interactive_data: parsedFlow })

      const response = await supabase
        .from('modules')
        .update({ interactive_data: parsedFlow })
        .eq('id', moduleId)
        .select()

      console.log('Resultado Supabase:', response)

      if (response.error) {
        alert('ERRO SUPABASE: ' + response.error.message)
        throw response.error
      }

      if (Array.isArray(response.data) && response.data.length === 0) {
        alert('ERRO: Nenhuma linha encontrada para o ID ' + moduleId)
        setStatusMessage('❌ Nenhum registro encontrado para esse módulo.')
        return
      }

      alert('✅ SALVO COM SUCESSO NO BANCO!')
      setStatusMessage('✅ Publicado com sucesso na área do aluno!')
    } catch (err: any) {
      setStatusMessage('❌ Erro ao salvar: ' + err.message)
      alert('Erro Supabase: ' + (err?.message ?? 'Desconhecido'))
    } finally {
      setIsPublishing(false)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr,1fr]">
      {/* Coluna da Esquerda: Editor */}
      <div className="flex flex-col gap-4 rounded-3xl border border-slate-800 bg-slate-950 p-6">
        <header>
          <h1 className="text-2xl font-bold text-white">Editor FlowMedix</h1>
          <p className="text-sm text-slate-400">Selecione o módulo e cole o JSON do simulador.</p>
        </header>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Módulo Alvo</label>
            <select
              value={moduleId}
              onChange={(e) => setModuleId(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2 text-white outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecione um módulo...</option>
              {modules.map((m) => (
                <option key={m.id} value={m.id}>{m.title}</option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm font-medium text-slate-300">Estrutura JSON</label>
              <Button variant="outline" size="sm" onClick={pasteFromClipboard}>
                📋 Colar JSON
              </Button>
            </div>
            <textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              className="h-[450px] w-full rounded-lg border border-slate-700 bg-slate-950 p-4 font-mono text-xs text-blue-300 outline-none focus:ring-2 focus:ring-blue-500"
              spellCheck="false"
            />
          </div>

          <Button 
            className="w-full py-6 text-lg font-bold bg-blue-600 hover:bg-blue-700"
            onClick={handleSave}
            disabled={isPublishing || !moduleId}
          >
            {isPublishing ? 'Publicando...' : '🚀 SALVAR E PUBLICAR'}
          </Button>

          {statusMessage && (
            <div className={`p-3 rounded-lg text-center text-sm font-medium ${statusMessage.includes('✅') ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
              {statusMessage}
            </div>
          )}
        </div>
      </div>

      {/* Coluna da Direita: Preview */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6 overflow-y-auto h-[750px]">
        <h2 className="text-xl font-bold text-white mb-4">👀 Pré-visualização Realtime</h2>
        {jsonError ? (
          <div className="bg-rose-500/20 text-rose-300 p-4 rounded-xl border border-rose-500/50">
            {jsonError} - Verifique a sintaxe do seu código.
          </div>
        ) : (
          parsedFlow && <DecisionSimulator flowData={parsedFlow} />
        )}
      </div>
    </div>
  )
}