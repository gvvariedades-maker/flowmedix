'use server'

import { notFound, redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createServerSupabase } from '@/lib/supabase/server'
import { Module } from '@/types/database'

interface StudyPlanPageProps {
  params: {
    planId: string
  }
}

export default async function StudyPlanPage({ params }: StudyPlanPageProps) {
  const supabase = createServerSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user?.id) {
    redirect('/login')
  }

  const { data: plan, error } = await supabase
    .from('study_plans')
    .select('*')
    .eq('id', params.planId)
    .single()

  if (error || !plan || plan.user_id !== user?.id) {
    notFound()
  }

  const { data: items } = await supabase
    .from('study_plan_items')
    .select('id, module_id, topic_name, is_completed')
    .eq('study_plan_id', plan.id)

  const moduleIds =
    items
      ?.map((item) => item.module_id)
      .filter((id): id is string => Boolean(id)) ?? []

  const modulesMap = new Map<string, Module>()
  if (moduleIds.length) {
    const { data: modules } = await supabase
      .from('modules')
      .select('id, title, description')
      .in('id', moduleIds)

    modules?.forEach((module) => {
      modulesMap.set(module.id, module)
    })
  }

  return (
    <div className="min-h-screen bg-slate-950 p-8">
      <Card className="border border-slate-800 bg-slate-900">
        <CardHeader>
          <CardTitle>Plano gerado: {plan.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {plan.raw_content && (
            <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Texto original
              </p>
              <p className="mt-2 whitespace-pre-line text-sm text-slate-200">
                {plan.raw_content}
              </p>
            </div>
          )}

          <div className="space-y-4">
            {(items ?? []).map((item) => {
              const module = item.module_id
                ? modulesMap.get(item.module_id)
                : undefined

              return (
                <div
                  key={item.id}
                  className="rounded-lg border border-slate-800 bg-slate-950 p-4"
                >
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="text-lg font-semibold text-white">
                      {module ? module.title : item.topic_name}
                    </h3>
                    <span
                      className={`text-xs font-semibold tracking-wide ${
                        item.is_completed
                          ? 'text-emerald-400'
                          : 'text-amber-400'
                      }`}
                    >
                      {item.is_completed ? 'Concluído' : 'Pendente'}
                    </span>
                  </div>
                  {module?.description && (
                    <p className="mt-2 text-sm text-slate-400">
                      {module.description}
                    </p>
                  )}
                  {!module && (
                    <p className="mt-2 text-sm text-slate-500">
                      Criado a partir dos tópicos extraídos do edital.
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

