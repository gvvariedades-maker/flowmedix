export const revalidate = 0

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { DecisionFlowData } from '@/types/simulator'
import { notFound } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { ExamModule, Exam } from '@/types/database'
import { ExamProgress } from '@/components/ExamProgress'

const DecisionSimulator = dynamic(
  () => import('@/components/DecisionSimulator'),
  { 
    ssr: false,
    loading: () => <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 text-sm text-slate-400">Carregando simulador...</div>
  }
)

export default async function StudyPage({
  params,
}: {
  params: {
    flowchartId: string
  }
}) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { data: module, error } = await supabase
    .from('modules')
    .select('id, title, description, interactive_data')
    .eq('id', params.flowchartId)
    .single()

  if (error || !module) {
    notFound()
  }

  const flowData = module.interactive_data as DecisionFlowData | null

  const { data: examLink } = await supabase
    .from('exam_modules')
    .select('exam_id')
    .eq('module_id', module.id)
    .limit(1)

  const examId = examLink?.[0]?.exam_id ?? null
  let examRecord: Exam | null = null
  let examTopics: Array<ExamModule & { module_title: string | null }> = []

  if (examId) {
    const [examResponse, examModulesResponse] = await Promise.all([
      supabase
        .from('exams')
        .select('id, name, organ, board, raw_content')
        .eq('id', examId)
        .single(),
      supabase
        .from('exam_modules')
        .select('id, module_id, topic_order, topic_name')
        .eq('exam_id', examId)
        .order('topic_order', { ascending: true }),
    ])

    if (!examResponse.error && examResponse.data) {
      examRecord = examResponse.data
    }

    const topics = examModulesResponse.data ?? []
    if (topics.length > 0) {
      const moduleIds = Array.from(
        new Set(topics.map((topic) => topic.module_id).filter(Boolean))
      ) as string[]

      let moduleMap = new Map<string, string>()
      if (moduleIds.length > 0) {
        const moduleTitlesResponse = await supabase
          .from('modules')
          .select('id, title')
          .in('id', moduleIds)

        if (!moduleTitlesResponse.error && moduleTitlesResponse.data) {
          moduleMap = new Map(moduleTitlesResponse.data.map((item) => [item.id, item.title]))
        }
      }

      examTopics = topics.map((topic) => ({
        ...topic,
        module_title: topic.module_id ? moduleMap.get(topic.module_id) ?? null : null,
      }))
    }
  }

  return (
    <div className="min-h-screen bg-[#010409] text-white overflow-hidden">
      <div className="bg-glow-main w-[600px] h-[600px] absolute -top-[200px] -left-[200px] opacity-50 blur-3xl" />
      <div className="relative z-10">
        <div className="bg-slate-900/70 border-b border-slate-800 px-4 py-3 backdrop-blur-md">
          <Link
            href="/modulos"
            className="group flex items-center gap-2 text-sm font-medium text-clinical-muted transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 text-slate-400 transition-colors group-hover:text-white" />
            Voltar para Módulos
          </Link>
          <div className="mt-3 space-y-1">
            <h1 className="text-4xl font-black text-neon-gradient">
              {module.title}
            </h1>
            {module.description && (
              <p className="text-sm text-clinical-muted">{module.description}</p>
            )}
          </div>
        </div>
        <div className="p-6 space-y-6">
          {examRecord && examTopics.length > 0 && (
            <ExamProgress examId={examRecord.id} examName={examRecord.name} topics={examTopics} />
          )}
          {flowData ? (
            <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
              <h2 className="text-lg font-semibold mb-4">
                <span className="bg-gradient-to-br from-white to-slate-500 bg-clip-text text-transparent">
                  Simulador interativo
                </span>
              </h2>
              <DecisionSimulator flowData={flowData} />
            </section>
          ) : (
            <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
              <p className="text-sm text-slate-400">
                Nenhum simulador interativo foi configurado para este módulo.
              </p>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}

