import Link from 'next/link'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createServerSupabase } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Lock, BookOpen, ArrowRight } from 'lucide-react'
import { Exam, ExamModule, Module } from '@/types/database'

type ExamWithTopics = {
  exam: Exam
  topics: (ExamModule & { module: Module | null })[]
}

export default async function DashboardPage() {
  const supabase = await createServerSupabase()
  const [
    modulesResponse,
    examsResponse,
    examModulesResponse,
  ] = await Promise.all([
    supabase
      .from('modules')
      .select('id, title, description, is_premium, icon_slug')
      .order('title', { ascending: true }),
    supabase
      .from('exams')
      .select('id, name, organ, board, raw_content, created_at')
      .order('created_at', { ascending: false }),
    supabase
      .from('exam_modules')
      .select('id, exam_id, module_id, topic_order, topic_name')
      .order('topic_order', { ascending: true }),
  ])

  if (modulesResponse.error || examsResponse.error || examModulesResponse.error) {
    throw new Error(
      modulesResponse.error?.message ||
        examsResponse.error?.message ||
        examModulesResponse.error?.message ||
        'Erro ao carregar dados do dashboard'
    )
  }

  const modules = modulesResponse.data ?? []
  const moduleMap = new Map(modules.map((item) => [item.id, item]))
  const examModules = examModulesResponse.data ?? []

  const groupedExamModules = examModules.reduce((acc, topic) => {
    const current = acc.get(topic.exam_id) ?? []
    current.push({
      ...topic,
      module: topic.module_id ? moduleMap.get(topic.module_id) ?? null : null,
    })
    acc.set(topic.exam_id, current)
    return acc
  }, new Map<string, (ExamModule & { module: Module | null })[]>())

  const exams = examsResponse.data ?? []
  const examsWithTopics: ExamWithTopics[] = exams.map((exam) => ({
    exam,
    topics: groupedExamModules.get(exam.id) ?? [],
  }))

  const singleExam = examsWithTopics.length === 1 ? examsWithTopics[0] : null

  return (
    <div className="relative min-h-screen bg-[#010409] px-4 py-10">
      <div className="bg-glow-main w-[580px] h-[580px] absolute top-[-220px] left-[-120px] opacity-30" />
      <div className="relative z-10 mx-auto max-w-6xl space-y-10">
        <header className="space-y-3 text-white">
          <p className="text-xs uppercase tracking-[0.6em] text-clinical-muted">Área do Aprendiz</p>
          <h1 className="text-4xl font-black text-neon-gradient">
            Escolha seu fluxo (ou siga um concurso verticalizado)
          </h1>
          <p className="text-sm text-slate-400">
            Os módulos destacados abaixo foram construídos para a rotina clínica com estética Cyber Clinical.
            Se você estiver seguindo um concurso, os temas aparecem na ordem do edital.
          </p>
        </header>

        <section className="space-y-6">
          <div className="flex items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-semibold text-white">Módulos em alta</h2>
              <p className="text-sm text-clinical-muted">Selecione um módulo para destravar simulações e tarefas rápidas</p>
            </div>
            <span className="text-xs uppercase tracking-[0.5em] text-clinical-muted">
              {modules.length} módulos
            </span>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {modules.map((module) => (
              <Card key={module.id} className="border-slate-800 bg-slate-900/70 glass-panel">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-6 w-6 text-clinical-accent" />
                      {module.is_premium && (
                        <span className="rounded-full border border-amber-400/40 px-2 py-0.5 text-[10px] uppercase tracking-[0.3em] text-amber-300">
                          Premium
                        </span>
                      )}
                    </div>
                    <div className="h-2 w-2 rounded-full bg-clinical-accent" />
                  </div>
                  <CardTitle className="text-white text-lg mt-4">{module.title}</CardTitle>
                  <CardDescription className="text-sm text-clinical-muted">
                    {module.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href={`/study/${module.id}`}>
                    <Button
                      variant="ghost"
                      className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-transparent text-white shadow-neon-cyan transition hover:border-clinical-accent"
                    >
                      {module.is_premium ? 'Ver detalhes' : 'Iniciar estudo'}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-clinical-muted">Concursos Disponíveis</p>
              <h2 className="text-3xl font-black text-white">Cronogramas alinhados ao edital</h2>
            </div>
            <span className="text-sm text-clinical-muted">{examsWithTopics.length} concurso(s)</span>
          </div>

          {examsWithTopics.length === 0 ? (
            <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-6 text-sm text-slate-400">
              Nenhum concurso registrado ainda. Aguarde o administrador montar o cronograma verticalizado.
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {examsWithTopics.map(({ exam, topics }) => (
                <div key={exam.id} className="glass-panel rounded-3xl border border-slate-800 bg-[#05070b]/80 p-6 shadow-neon-cyan/10">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.4em] text-clinical-muted">Orgão · {exam.organ ?? '—'}</p>
                      <h3 className="text-xl font-semibold text-white">{exam.name}</h3>
                      <p className="text-xs text-clinical-muted">Banca {exam.board ?? 'indefinida'}</p>
                    </div>
                    <span className="rounded-full bg-clinical-accent/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-clinical-accent">
                      {topics.length} tópicos
                    </span>
                  </div>
                  <div className="mt-5 space-y-3">
                    {topics.length === 0 && (
                      <p className="text-sm text-clinical-muted">Ainda não há módulos vinculados a este concurso.</p>
                    )}
                    {topics.map((topic) => (
                      <div
                        key={topic.id}
                        className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3"
                      >
                        <div>
                          <p className="text-sm font-semibold text-white">
                            {topic.topic_name ?? topic.module?.title ?? 'Tópico sem vínculo'}
                          </p>
                          <p className="text-[11px] uppercase tracking-[0.4em] text-clinical-muted">
                            Etapa {topic.topic_order} · {topic.module?.title ?? 'sem módulo'}
                          </p>
                        </div>
                        {topic.module ? (
                          <CheckCircle2 className="h-5 w-5 text-clinical-success" />
                        ) : (
                          <Lock className="h-5 w-5 text-slate-500" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {singleExam && (
          <section className="glass-panel rounded-3xl border border-clinical-accent/40 bg-slate-950/60 p-6 shadow-neon-green/30">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-clinical-muted">Cronograma personalizado</p>
                <h2 className="text-3xl font-black text-white">{singleExam.exam.name}</h2>
                <p className="text-sm text-clinical-muted">
                  Você está estudando o concurso selecionado. Siga a ordem vertical e vá desbloqueando módulos.
                </p>
              </div>
              <CheckCircle2 className="h-12 w-12 text-clinical-success" />
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {singleExam.topics.map((topic) => (
                <div
                  key={topic.id}
                  className="rounded-2xl border border-white/10 bg-[#05070b]/60 p-4 text-sm text-clinical-muted"
                >
                  <p className="text-[11px] uppercase tracking-[0.4em] text-clinical-accent">TOPICO {topic.topic_order}</p>
                  <p className="mt-1 text-lg font-semibold text-white">{topic.topic_name ?? topic.module?.title ?? 'Tópico'}</p>
                  <p className="text-xs uppercase tracking-[0.4em] text-clinical-muted">
                    {topic.module?.title ?? 'Nenhum módulo associado'}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

