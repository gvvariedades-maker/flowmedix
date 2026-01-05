import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'

export async function GET(_: Request, { params }: { params: { assuntoId: string } }) {
  const assuntoIdRaw = params?.assuntoId
  const assuntoId = typeof assuntoIdRaw === 'string' ? assuntoIdRaw : Array.isArray(assuntoIdRaw) ? assuntoIdRaw[0] : null

  console.log('🔍 API: Buscando fluxograma para assunto:', assuntoId)

  // Validação rigorosa
  if (!assuntoId || assuntoId === '0' || assuntoId === 'undefined' || assuntoId === 'null') {
    console.error('❌ API: ID inválido recebido:', assuntoIdRaw)
    return NextResponse.json({ error: 'Identificador de assunto inválido.' }, { status: 400 })
  }

  // Validar formato UUID
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidPattern.test(assuntoId)) {
    console.error('❌ API: ID não é UUID válido:', assuntoId)
    return NextResponse.json({ error: 'Formato de identificador inválido. Esperado UUID.' }, { status: 400 })
  }

  const supabase = await createServerSupabase()
  
  // Buscar através de exam_contents usando subtopic_id
  const { data: contentData, error: contentError } = await supabase
    .from('exam_contents')
    .select(`
      id,
      subtopic_id,
      flowchart_id,
      flowcharts (
        id,
        title,
        content,
        modulo_id,
        slug
      )
    `)
    .eq('subtopic_id', assuntoId)
    .maybeSingle()

  if (contentError) {
    console.error('❌ API: Erro ao buscar exam_contents:', { assuntoId, error: contentError })
    return NextResponse.json({ error: 'Falha ao carregar o fluxograma.' }, { status: 500 })
  }

  if (!contentData || !contentData.flowcharts) {
    console.warn('⚠️ API: Nenhum fluxograma encontrado para assunto:', assuntoId)
    return NextResponse.json({ error: 'Fluxograma não encontrado para este assunto.' }, { status: 404 })
  }

  const flowchart = contentData.flowcharts as any
  const result = {
    ...flowchart,
    subtopic_id: contentData.subtopic_id,
  }

  console.log('✅ API: Fluxograma encontrado:', { id: result.id, title: result.title, subtopic_id: result.subtopic_id })

  return NextResponse.json({ flowchart: result })
}

