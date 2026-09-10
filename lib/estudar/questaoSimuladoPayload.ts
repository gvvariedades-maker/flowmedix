import type { SupabaseClient } from '@supabase/supabase-js';
import type { LessonData } from '@/types/lesson';
import { getQuestaoBySlugCached } from '@/lib/cache';
import { userHasModuloAccess } from '@/lib/concursos/entitlements';
import { canServeCommercialContent } from '@/lib/catalogMigration/commercialAuthority';
import { stripQuestionForSimulado } from '@/lib/estudar/questionPayload';
import type { SimuladoQuestaoPayloadResponse } from '@/lib/simulado/types';

export type BuildSimuladoQuestaoPayloadResult =
  | { status: 'ok'; payload: SimuladoQuestaoPayloadResponse }
  | { status: 'forbidden' }
  | { status: 'not_found' };

export type BuildSimuladoQuestaoPayloadInput = {
  slug: string;
  userId: string;
  supabase: SupabaseClient;
  isAdmin?: boolean;
};

/**
 * Monta payload enxuto para o runner de simulado (sem nav, histórico nem slides).
 */
export async function buildSimuladoQuestaoPayload(
  input: BuildSimuladoQuestaoPayloadInput,
): Promise<BuildSimuladoQuestaoPayloadResult> {
  const { slug, userId, supabase, isAdmin = false } = input;

  if (!isAdmin) {
    const hasAccess = await userHasModuloAccess(userId, slug);
    if (!hasAccess) return { status: 'forbidden' };
  }

  let conteudoJson: LessonData | null = null;
  let tituloAula: string | null = null;

  if (isAdmin) {
    const cached = await getQuestaoBySlugCached(slug);
    conteudoJson = (cached?.conteudo_json as LessonData | undefined) ?? null;
    tituloAula = cached?.titulo_aula ?? null;
  } else {
    const { data, error } = await supabase
      .from('modulos_estudo')
      .select('conteudo_json, titulo_aula')
      .eq('modulo_slug', slug)
      .maybeSingle();

    if (error) throw error;
    tituloAula = data?.titulo_aula ?? null;
    conteudoJson = (data?.conteudo_json as LessonData | undefined) ?? null;
  }

  if (!conteudoJson) return { status: 'not_found' };

  if (!isAdmin && !canServeCommercialContent({
    isAdmin,
    slug,
    tituloAula,
    conteudoJson,
  }).eligible) {
    return { status: 'forbidden' };
  }

  const dados = stripQuestionForSimulado(conteudoJson);

  return {
    status: 'ok',
    payload: { dados },
  };
}
