/**
 * GET /api/admin/review-queue/[slug]
 * Carrega JSON da questão para o Laboratório (Supabase ou payload do relatório IA).
 *
 * Query: source=supabase|ai-report, lote= (obrigatório para ai-report)
 */
import { NextRequest, NextResponse } from 'next/server';

import {
  fetchQuestaoBySlug,
  loadQuestaoFromAiReport,
} from '@/lib/admin/reviewQueue';
import { requireAdminApi } from '@/lib/admin/requireAdmin';
import { logger } from '@/lib/logger';

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  const auth = await requireAdminApi();
  if ('error' in auth) return auth.error;

  const { slug } = await context.params;
  const { searchParams } = request.nextUrl;
  const source = searchParams.get('source') === 'ai-report' ? 'ai-report' : 'supabase';
  const lote = searchParams.get('lote') ?? undefined;

  try {
    if (source === 'ai-report') {
      if (!lote) {
        return NextResponse.json({ error: 'Informe ?lote= para source=ai-report' }, { status: 400 });
      }
      const hit = loadQuestaoFromAiReport(lote, slug);
      if (!hit) {
        return NextResponse.json({ error: 'Questão não encontrada no relatório' }, { status: 404 });
      }
      return NextResponse.json({
        slug,
        source: 'ai-report',
        lote,
        issues: hit.issues,
        ai_score: hit.ai_score,
        questao: hit.payload,
      });
    }

    const hit = await fetchQuestaoBySlug(auth.admin, slug);
    if (!hit) {
      return NextResponse.json({ error: 'Questão não encontrada' }, { status: 404 });
    }

    const specIssues = hit.payload;
    return NextResponse.json({
      slug,
      source: 'supabase',
      titulo_aula: hit.titulo_aula,
      banca: hit.banca,
      questao: specIssues,
    });
  } catch (err) {
    logger.error('review-queue slug failed', err, { slug });
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Falha ao carregar questão' },
      { status: 500 },
    );
  }
}
