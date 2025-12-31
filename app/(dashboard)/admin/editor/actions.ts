'use server'

import { createServerSupabase } from '@/lib/supabase/server'
import { FlowchartContent } from '@/types/flow'

interface PublishModulePayload {
  title: string
  description?: string | null
  content: FlowchartContent
}

export async function publishModuleAction(formData: FormData) {
  const title = (formData.get('title') as string | null)?.trim()
  const description = (formData.get('description') as string | null)?.trim() || null
  const contentValue = (formData.get('content') as string | null)?.trim()

  if (!title) {
    throw new Error('O título do módulo é obrigatório.')
  }
  if (!contentValue) {
    throw new Error('O conteúdo JSON do fluxograma é obrigatório.')
  }

  let content: FlowchartContent
  try {
    const parsed = JSON.parse(contentValue)
    if (!Array.isArray(parsed.nodes) || !Array.isArray(parsed.edges)) {
      throw new Error('O JSON deve conter arrays "nodes" e "edges".')
    }
    content = parsed as FlowchartContent
  } catch (err: any) {
    throw new Error(`JSON inválido: ${err?.message ?? 'erro desconhecido'}`)
  }

  const supabase = await createServerSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user?.id) {
    throw new Error('Você precisa estar autenticado para publicar módulos.')
  }

  const payload: PublishModulePayload = {
    title,
    description,
    content,
  }

  const { error } = await supabase.from('modules').insert(payload)

  if (error) {
    throw new Error(error.message)
  }
}





