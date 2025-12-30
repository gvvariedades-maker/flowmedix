'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Module } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Search, Sparkles } from 'lucide-react'

const MAX_TOPICS = 50

type Suggestion = {
  moduleId: string
  title: string
  score: number
}

type VerticalTopic = {
  id: string
  text: string
  moduleId: string | null
  suggestions: Suggestion[]
  score: number
}

const normalizeText = (value: string) => value.trim().toLowerCase()

const calculateFuzzyScore = (line: string, target: string) => {
  const normalizedLine = normalizeText(line)
  const normalizedTarget = normalizeText(target)

  if (!normalizedLine || !normalizedTarget) {
    return 0
  }

  if (normalizedTarget === normalizedLine) {
    return 1
  }

  if (
    normalizedTarget.includes(normalizedLine) ||
    normalizedLine.includes(normalizedTarget)
  ) {
    return 0.85
  }

  const lineWords = normalizedLine.split(/\s+/).filter(Boolean)
  const wordsMatched = lineWords.filter((word) =>
    normalizedTarget.includes(word)
  ).length
  const baseScore = lineWords.length
    ? (wordsMatched / lineWords.length) * 0.6
    : 0

  const lengthBonus = Math.max(
    0,
    0.1 - Math.abs(normalizedTarget.length - normalizedLine.length) / Math.max(normalizedTarget.length, 1) / 3
  )

  return Math.min(1, baseScore + lengthBonus)
}

const buildSuggestions = (line: string, modules: Module[]): Suggestion[] => {
  if (!line || modules.length === 0) {
    return []
  }

  return modules
    .map((module) => ({
      moduleId: module.id,
      title: module.title,
      score: calculateFuzzyScore(line, module.title),
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
}

export function VerticalExamBuilder() {
  const [modules, setModules] = useState<Module[]>([])
  const [examName, setExamName] = useState('')
  const [organ, setOrgan] = useState('')
  const [board, setBoard] = useState('')
  const [rawContent, setRawContent] = useState('')
  const [verticalTopics, setVerticalTopics] = useState<VerticalTopic[]>([])
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    async function loadModules() {
      const { data, error } = await supabase
        .from('modules')
        .select('id, title, description, is_premium')
        .order('title', { ascending: true })

      if (!error && data) {
        setModules(data)
      } else {
        setStatusMessage('Erro ao buscar módulos para sugerir vínculos.')
      }
    }
    loadModules()
  }, [])

  const selectedTopics = useMemo(
    () => verticalTopics.filter((topic) => topic.moduleId),
    [verticalTopics]
  )

  const handleProcessVerticalization = useCallback(() => {
    setIsProcessing(true)
    setStatusMessage(null)

    const lines = rawContent
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .slice(0, MAX_TOPICS)

    if (lines.length === 0) {
      setVerticalTopics([])
      setStatusMessage('Cole o conteúdo do edital para gerar os tópicos.')
      setIsProcessing(false)
      return
    }

    const topics = lines.map((line, index) => {
      const suggestions = buildSuggestions(line, modules)
      const bestMatch = suggestions[0]
      return {
        id: `topic-${index}`,
        text: line,
        moduleId: bestMatch ? bestMatch.moduleId : null,
        suggestions,
        score: bestMatch ? bestMatch.score : 0,
      }
    })

    setVerticalTopics(topics)
    setIsProcessing(false)
    const linked = topics.filter((topic) => topic.moduleId).length
    setStatusMessage(
      `Encontrados ${topics.length} tópicos. ${linked} tópicos com sugestão aplicada.`
    )
  }, [modules, rawContent])

  const handleTopicModuleChange = (topicId: string, moduleId: string) => {
    setVerticalTopics((prev) =>
      prev.map((topic) =>
        topic.id === topicId
          ? { ...topic, moduleId: moduleId || null }
          : topic
      )
    )
  }

  const applySuggestion = (topicId: string) => {
    setVerticalTopics((prev) =>
      prev.map((topic) => {
        if (topic.id !== topicId) {
          return topic
        }
        const suggested = topic.suggestions[0]
        return {
          ...topic,
          moduleId: suggested ? suggested.moduleId : null,
        }
      })
    )
  }

  const handleSaveExam = async () => {
    if (!examName.trim()) {
      setStatusMessage('Informe o nome do concurso antes de salvar.')
      return
    }

    if (verticalTopics.length === 0) {
      setStatusMessage('Processe o edital para gerar os tópicos.')
      return
    }

    if (selectedTopics.length === 0) {
      setStatusMessage('Associe ao menos um módulo aos tópicos.')
      return
    }

    setIsSaving(true)
    try {
      const trimmedName = examName.trim()
      const trimmedOrgan = organ.trim() || null
      const trimmedBoard = board.trim() || null

      const { data: insertedExam, error: examError } = await supabase
        .from('exams')
        .insert({
          name: trimmedName,
          organ: trimmedOrgan,
          board: trimmedBoard,
          raw_content: rawContent,
        })
        .select('id')
        .single()

      if (examError || !insertedExam) {
        throw examError ?? new Error('Falha ao criar o concurso.')
      }

      const payload = selectedTopics.map((topic, index) => ({
        exam_id: insertedExam.id,
        module_id: topic.moduleId!,
        topic_order: index + 1,
        topic_name: topic.text,
      }))

      const { error: moduleError } = await supabase
        .from('exam_modules')
        .insert(payload)

      if (moduleError) {
        throw moduleError
      }

      setStatusMessage('✅ Edital salvo com sucesso! Os módulos foram vinculados.')
      setVerticalTopics([])
      setRawContent('')
      setExamName('')
      setOrgan('')
      setBoard('')
    } catch (err: any) {
      setStatusMessage('❌ ' + (err?.message ?? 'Erro ao salvar o concurso.'))
    } finally {
      setIsSaving(false)
    }
  }

  const canProcess =
    modules.length > 0 && rawContent.trim().length > 0 && !isProcessing

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-8 shadow-[0_20px_60px_rgba(0,0,0,0.45)] glass-panel">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-clinical-muted">
              Gerador de Editais Verticalizados
            </p>
            <h2 className="text-2xl font-black text-white mt-2">
              Construa cronogramas prontos para seus alunos
            </h2>
            <p className="text-sm text-clinical-muted mt-1">
              Cole o conteúdo programático, valide sugestões e salve o concurso com os módulos alinhados ao fluxo FlowMedix.
            </p>
          </div>
          <Sparkles className="h-10 w-10 text-clinical-accent" />
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <label className="flex flex-col gap-2 text-sm text-clinical-muted">
            <span>Nome do Concurso</span>
            <input
              value={examName}
              onChange={(e) => setExamName(e.target.value)}
              className="rounded-2xl border border-slate-800 bg-[#070b11] px-4 py-3 text-white outline-none focus:border-clinical-accent focus:ring-4 focus:ring-clinical-accent/20"
              placeholder="Concurso Tático Corpo Clínico"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm text-clinical-muted">
            <span>Órgão</span>
            <input
              value={organ}
              onChange={(e) => setOrgan(e.target.value)}
              className="rounded-2xl border border-slate-800 bg-[#070b11] px-4 py-3 text-white outline-none focus:border-clinical-accent focus:ring-4 focus:ring-clinical-accent/20"
              placeholder="Ministério da Saúde"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm text-clinical-muted">
            <span>Banca</span>
            <input
              value={board}
              onChange={(e) => setBoard(e.target.value)}
              className="rounded-2xl border border-slate-800 bg-[#070b11] px-4 py-3 text-white outline-none focus:border-clinical-accent focus:ring-4 focus:ring-clinical-accent/20"
              placeholder="Banca Visionária"
            />
          </label>
        </div>

        <div className="mt-6">
          <p className="text-sm text-clinical-muted mb-2">
            Conteúdo programático bruto (máx. 50 linhas). Cada linha vira um tópico verticalizado.
          </p>
          <textarea
            value={rawContent}
            onChange={(e) => setRawContent(e.target.value)}
            className="min-h-[220px] w-full rounded-3xl border border-slate-800 bg-[#05070b] p-4 text-sm text-slate-100 outline-none focus:border-clinical-accent focus:ring-4 focus:ring-clinical-accent/20"
            placeholder="1. Anatomia do coração...\n2. Farmacologia aplicada..."
          />
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <Button
            variant="ghost"
            onClick={handleProcessVerticalization}
            disabled={!canProcess}
            className="rounded-2xl border border-slate-700 bg-transparent text-white shadow-neon-cyan"
          >
            {isProcessing ? 'Processando...' : 'Analisar verticalização'}
          </Button>
          <Button
            variant="default"
            onClick={handleSaveExam}
            disabled={isSaving || selectedTopics.length === 0}
            className="rounded-2xl border border-clinical-accent bg-clinical-accent text-clinical-dark shadow-neon-green"
          >
            {isSaving ? 'Salvando...' : 'Salvar concurso com módulos'}
          </Button>
          <div className="ml-auto text-sm text-clinical-muted flex flex-col">
            <span>{selectedTopics.length} tópicos vinculados</span>
            <span>{verticalTopics.length || 0} tópicos processados</span>
          </div>
        </div>

        {statusMessage && (
          <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white">
            {statusMessage}
          </div>
        )}
      </div>

      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl glass-panel">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Tópicos processados</h3>
          <span className="text-xs uppercase tracking-[0.4em] text-clinical-muted">
            {verticalTopics.length}/{MAX_TOPICS}
          </span>
        </div>
        <div className="mt-4 grid gap-4 max-h-[520px] overflow-y-auto pr-2">
          {verticalTopics.length === 0 && (
            <p className="text-sm text-clinical-muted">
              A lista aparecerá aqui assim que o edital for processado. Use as sugestões ou selecione manualmente o módulo para cada tópico.
            </p>
          )}

          {verticalTopics.map((topic, index) => (
            <div
              key={topic.id}
              className="glass-panel flex flex-col gap-3 rounded-2xl border border-slate-800 bg-[#05070b] p-5 shadow-neon-cyan/20"
            >
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-clinical-muted">
                <span>#{String(index + 1).padStart(2, '0')}</span>
                <span>
                  {topic.score > 0
                    ? `Match ${Math.round(topic.score * 100)}%`
                    : 'Sem sugestão'}
                </span>
              </div>
              <p className="text-sm leading-relaxed text-white">{topic.text}</p>
              <div className="flex flex-col gap-2">
                <select
                  value={topic.moduleId || ''}
                  onChange={(e) =>
                    handleTopicModuleChange(topic.id, e.target.value)
                  }
                  className="w-full rounded-2xl border border-slate-800 bg-[#070b11] px-3 py-2 text-sm text-white outline-none focus:border-clinical-accent"
                >
                  <option value="">Sem módulo vinculado</option>
                  {modules.map((module) => (
                    <option key={module.id} value={module.id}>
                      {module.title}
                    </option>
                  ))}
                </select>
                {topic.suggestions.length > 0 && (
                  <div className="flex items-center justify-between gap-3 text-xs text-clinical-muted">
                    <span className="flex items-center gap-1">
                      <Search className="h-4 w-4 text-blue-300" />
                      {topic.suggestions[0].title}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => applySuggestion(topic.id)}
                      className="rounded-full border border-clinical-accent px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em]"
                    >
                      Confirmar
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

