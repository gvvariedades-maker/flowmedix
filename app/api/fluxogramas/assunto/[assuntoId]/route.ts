import { NextResponse } from 'next/server'
import { getFluxogramaByAssuntoCached } from '@/lib/cache'
import { logger } from '@/lib/logger'
import { z } from 'zod'

const UUIDSchema = z.string().uuid('ID deve ser um UUID válido');

export async function GET(_: Request, { params }: { params: { assuntoId: string } }) {
  const assuntoIdRaw = params?.assuntoId
  const assuntoId = typeof assuntoIdRaw === 'string' ? assuntoIdRaw : Array.isArray(assuntoIdRaw) ? assuntoIdRaw[0] : null

  logger.info('Fetching flowchart for subject', { assuntoId });

  // Validação rigorosa
  if (!assuntoId || assuntoId === '0' || assuntoId === 'undefined' || assuntoId === 'null') {
    logger.warn('Invalid subject ID received', { assuntoIdRaw });
    return NextResponse.json({ error: 'Identificador de assunto inválido.' }, { status: 400 })
  }

  // Validar formato UUID com Zod
  const uuidValidation = UUIDSchema.safeParse(assuntoId);
  if (!uuidValidation.success) {
    logger.warn('Invalid UUID format', { assuntoId, errors: uuidValidation.error.issues });
    return NextResponse.json({ error: 'Formato de identificador inválido. Esperado UUID.' }, { status: 400 })
  }

  // Usa cache estratégico - revalida a cada 15 minutos (dados estáticos)
  const contentData = await getFluxogramaByAssuntoCached(assuntoId);

  if (!contentData || !contentData.flowcharts) {
    logger.warn('Flowchart not found for subject', { assuntoId });
    return NextResponse.json({ error: 'Fluxograma não encontrado para este assunto.' }, { status: 404 })
  }

  const flowchart = contentData.flowcharts as any
  const result = {
    ...flowchart,
    subtopic_id: contentData.subtopic_id,
  }

  logger.info('Flowchart found successfully', { flowchartId: result.id, subtopicId: result.subtopic_id });

  return NextResponse.json({ flowchart: result })
}

