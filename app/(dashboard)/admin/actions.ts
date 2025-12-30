'use server'

import { createServerSupabase } from '@/lib/supabase/server'
import { DecisionFlowData } from '@/types/simulator'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL?.toLowerCase()

export async function saveSimulatorFlow(formData: FormData) {
  const title = (formData.get('title') as string | null)?.trim()
  const description = (formData.get('description') as string | null)?.trim() || null
  const contentValue = (formData.get('content') as string | null)?.trim()

  if (!title) {
    throw new Error('Título é obrigatório para publicar o simulador.')
  }
  if (!contentValue) {
    throw new Error('Cole o JSON do simulador.')
  }
  let content: DecisionFlowData
  try {
    const parsed = JSON.parse(contentValue)
    if (!parsed?.title || !Array.isArray(parsed.steps)) {
      throw new Error('O JSON precisa conter "title" e um array "steps".')
    }
    content = parsed as DecisionFlowData
  } catch (err: any) {
    throw new Error(`JSON inválido: ${err?.message ?? 'erro desconhecido'}`)
  }

  const supabase = await createServerSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (ADMIN_EMAIL) {
    if (!user?.email || user.email.toLowerCase() !== ADMIN_EMAIL) {
      throw new Error('Acesso negado: apenas o administrador pode salvar simuladores.')
    }
  }

  const { error } = await supabase.from('modules').insert({
    title,
    description,
    content,
  })

  if (error) {
    throw error
  }
}

