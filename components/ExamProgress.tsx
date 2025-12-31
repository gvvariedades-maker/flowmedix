'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { CheckCircle2 } from 'lucide-react'

type Topic = {
  id: string
  topic_order: number
  topic_name: string | null
  module_id: string | null
  module_title: string | null
}

type Props = {
  examId: string
  examName: string
  topics: Topic[]
}

export function ExamProgress({ examId, examName, topics }: Props) {
  const moduleIds = useMemo(
    () =>
      Array.from(
        new Set(
          topics
            .map((topic) => topic.module_id)
            .filter((value): value is string => Boolean(value))
        )
      ),
    [topics]
  )

  const [completedModules, setCompletedModules] = useState<Set<string>>(new Set())
  const [progress, setProgress] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    async function fetchProgress() {
      if (!examId || moduleIds.length === 0) {
        setCompletedModules(new Set())
        setProgress(0)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        const userId = session?.user?.id
        if (!userId) {
          if (mounted) {
            setProgress(0)
            setCompletedModules(new Set())
            setIsLoading(false)
          }
          return
        }

        const { data: progressData, error: progressError } = await supabase
          .from('user_progress')
          .select('flowchart_id, status')
          .in('flowchart_id', moduleIds)
          .eq('user_id', userId)
          .eq('status', 'completed')

        if (progressError) {
          throw progressError
        }

        if (!mounted) {
          return
        }

        const completedSet = new Set(progressData?.map((item) => item.flowchart_id))
        setCompletedModules(completedSet)
        setProgress(
          moduleIds.length
            ? Math.min(100, Math.round((completedSet.size / moduleIds.length) * 100))
            : 0
        )
      } catch (err: any) {
        if (mounted) {
          setError(err?.message ?? 'Não foi possível carregar o progresso.')
        }
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    fetchProgress()
    return () => {
      mounted = false
    }
  }, [examId, moduleIds])

  if (topics.length === 0) {
    return null
  }

  return (
    <div className="glass-panel rounded-3xl border border-slate-800 bg-slate-950/70 p-6 shadow-neon-cyan/10">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-clinical-muted">Progresso do edital</p>
          <h3 className="text-2xl font-semibold text-white">{examName}</h3>
        </div>
        <span className="text-sm font-semibold text-clinical-accent">
          {isLoading ? 'Carregando...' : `${progress}% concluído`}
        </span>
      </div>

      <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-900">
        <div
          className="h-full rounded-full bg-gradient-to-r from-clinical-accent to-blue-500 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {error && (
        <p className="mt-3 text-xs text-rose-300">
          {error}
        </p>
      )}

      <div className="mt-5 max-h-[280px] space-y-3 overflow-y-auto pr-1">
        {topics.map((topic) => {
          const completed = topic.module_id ? completedModules.has(topic.module_id) : false
          return (
            <div
              key={topic.id}
              className={`flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 ${
                completed ? 'border-clinical-success bg-slate-900/60 shadow-neon-green/20' : 'border-white/10 bg-[#05070b]'
              }`}
            >
              <div className="flex flex-col">
                <p className="text-sm font-semibold text-white">
                  {topic.topic_name ?? topic.module_title ?? 'Tópico sem módulo'}
                </p>
                <p className="text-[11px] uppercase tracking-[0.4em] text-clinical-muted">
                  {`Etapa ${topic.topic_order}`}
                </p>
              </div>
              {completed && <CheckCircle2 className="h-5 w-5 text-clinical-success" />}
            </div>
          )
        })}
      </div>
    </div>
  )
}


