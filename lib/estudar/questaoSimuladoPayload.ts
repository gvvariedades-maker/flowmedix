import type { SupabaseClient } from '@supabase/supabase-js';
import type { LessonData } from '@/types/lesson';
import { userHasModuloAccess } from '@/lib/concursos/entitlements';
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
};

/**
 * Monta payload enxuto para o runner de simulado (sem nav, histórico nem slides).
 * Busca apenas `conteudo_json` do módulo.
 */
export async function buildSimuladoQuestaoPayload(
  input: BuildSimuladoQuestaoPayloadInput,
): Promise<BuildSimuladoQuestaoPayloadResult> {
  const { slug, userId, supabase } = input;

  const hasAccess = await userHasModuloAccess(userId, slug);
  if (!hasAccess) return { status: 'forbidden' };

  const { data, error } = await supabase
    .from('modulos_estudo')
    .select('conteudo_json')
    .eq('modulo_slug', slug)
    .maybeSingle();

  if (error) throw error;
  if (!data?.conteudo_json) return { status: 'not_found' };

  const dados = stripQuestionForSimulado(data.conteudo_json as LessonData);

  return {
    status: 'ok',
    payload: { dados },
  };
}
