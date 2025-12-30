import { DecisionSimulator } from '@/components/DecisionSimulator'
import { DecisionFlowData } from '@/types/simulator'
import { createServerSupabase } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

interface SimulatorPageProps {
  params: {
    id: string
  }
}

export default async function SimulatorPage({ params }: SimulatorPageProps) {
  const supabase = await createServerSupabase()
  const { data: module, error } = await supabase
    .from('modules')
    .select('id, title, description, content')
    .eq('id', params.id)
    .single()

  if (error || !module) {
    notFound()
  }

  const flowData = module.content as DecisionFlowData | null
  if (!flowData || !Array.isArray(flowData.steps) || !flowData.steps.length) {
    notFound()
  }

  return (
    <section className="min-h-screen bg-slate-950 p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Simulador Interativo</p>
          <h1 className="text-4xl font-semibold text-white">{flowData.title ?? module.title}</h1>
          {module.description && (
            <p className="text-sm text-slate-400">{module.description}</p>
          )}
        </header>
        <DecisionSimulator flowData={flowData} />
      </div>
    </section>
  )
}

