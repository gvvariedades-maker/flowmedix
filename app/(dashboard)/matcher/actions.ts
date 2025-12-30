'use server'

import { redirect } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase/server'
import { extractTopicsFromText } from '@/lib/gemini'

export async function generatePlan(formData: FormData) {
  try {
    const rawText = (formData.get('edital') as string)?.trim()
    const planTitle =
      ((formData.get('planTitle') as string)?.trim() || 'Roteiro FlowMedix').slice(0, 100)

    if (!rawText) {
      throw new Error('Informe o edital ou texto normativo.')
    }

    let extractionResult: any
    try {
      extractionResult = await extractTopicsFromText(rawText)
    } catch (aiErr: any) {
      console.error('Gemini extraction error:', aiErr)
      try {
        console.error('Gemini error details:', {
          message: aiErr?.message,
          stack: aiErr?.stack,
          response: aiErr?.response ?? aiErr?.responseText ?? null,
          body: aiErr?.body ?? null,
        })
      } catch (logErr) {
        console.error('Failed to stringify aiErr details', logErr)
      }
      // Expor o erro bruto também em JSON quando possível
      try {
        console.log('aiErr (raw):', JSON.stringify(aiErr, Object.getOwnPropertyNames(aiErr), 2))
      } catch {
        console.log('aiErr non-serializable:', aiErr)
      }
      throw new Error('Falha na extração de tópicos pela IA.')
    }

    const content =
      (extractionResult && extractionResult.content) ||
      (extractionResult && extractionResult.raw) ||
      null
    if (!content) {
      throw new Error('O Gemini não retornou conteúdo bruto.')
    }

    const contentString = String(content).trim()
    let topicsResult: any
    try {
      topicsResult = JSON.parse(contentString)
      console.log('SUCESSO NA EXTRAÇÃO:', topicsResult)
    } catch (parseErr) {
      console.error('Falha no parse JSON do conteúdo bruto do Gemini:', parseErr)
      console.error('CONTEUDO_BRUTO:', content)
      throw new Error('Falha na interpretação da resposta da IA.')
    }

    const topics = Array.isArray(topicsResult?.topics) ? topicsResult.topics : []
    if (!topics.length) {
      throw new Error('O Gemini não retornou tópicos válidos.')
    }

    const supabase = await createServerSupabase()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user?.id) {
      return redirect('/login')
    }

    const {
      data: plan,
      error: planError,
    } = await supabase
      .from('study_plans')
      .insert({
        user_id: user!.id,
        title: planTitle,
        raw_text: rawText,
      })
      .select('id')
      .single()

    if (planError || !plan?.id) {
      console.error('Supabase insert study_plans error:', planError)
      throw new Error(planError?.message || 'Não foi possível criar o plano.')
    }

    // Ensure topics are saved into modules table and map titles -> module ids
    const titles = topics.map((t: any) => String(t.title).trim())
    // find existing modules
    const { data: existingModules } = await supabase
      .from('modules')
      .select('id,title')
      .in('title', titles)

    const existingByTitle = new Map<string, string>()
    (existingModules ?? []).forEach((m: any) => existingByTitle.set(m.title, m.id))

    const toInsertModules = topics
      .filter((t: any) => !existingByTitle.has(String(t.title).trim()))
      .map((t: any) => ({ title: String(t.title).trim(), tags: [], is_premium: false }))

    if (toInsertModules.length > 0) {
      const { error: insertModulesErr } = await supabase.from('modules').insert(toInsertModules)
      if (insertModulesErr) {
        console.error('Error inserting modules:', insertModulesErr)
      }
    }

    // refetch mapping
    const { data: allModules } = await supabase
      .from('modules')
      .select('id,title')
      .in('title', titles)

    const moduleIdByTitle = new Map<string, string>()
    (allModules ?? []).forEach((m: any) => moduleIdByTitle.set(m.title, m.id))

    const items = topics.map((topic: any) => {
      const title = String(topic.title ?? '').trim()
      const moduleId = moduleIdByTitle.get(title) ?? null
      return {
        study_plan_id: plan.id,
        module_id: moduleId,
        topic_name: title,
        status: 'todo',
      }
    })

    const { error: insertItemsErr } = await supabase.from('study_plan_items').insert(items)
    if (insertItemsErr) {
      console.error('Error inserting study_plan_items:', insertItemsErr)
      throw new Error('Falha ao inserir itens do plano de estudo.')
    }

    return redirect(`/dashboard/study-plans/${plan.id}`)
  } catch (err: any) {
    console.error('generatePlan failed:', err)
    throw err
  }
}


