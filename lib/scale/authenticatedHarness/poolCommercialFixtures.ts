import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { evaluateHarnessSlugCommercialEligibility } from '@/lib/scale/authenticatedHarness/poolCommercialEligibility';
import { pickHarnessOpcaoIdFromConteudo } from '@/lib/scale/authenticatedHarness/poolQuestionFixture';

export type HarnessCommercialQuestionFixture = {
  modulo_slug: string;
  default_opcao_id: string;
};

export async function fetchHarnessCommercialQuestionFixtures(
  admin: SupabaseClient,
  limit: number,
  excludeSlugs: Set<string> = new Set(),
): Promise<HarnessCommercialQuestionFixture[]> {
  const { data, error } = await admin
    .from('modulos_estudo')
    .select('modulo_slug, titulo_aula, conteudo_json')
    .not('modulo_slug', 'is', null)
    .limit(Math.max(limit * 8, 80));
  if (error) throw error;

  const fixtures: HarnessCommercialQuestionFixture[] = [];
  for (const row of data ?? []) {
    const slug = (row as { modulo_slug?: string }).modulo_slug?.trim();
    if (!slug || excludeSlugs.has(slug)) continue;
    const conteudo = (row as { conteudo_json?: unknown }).conteudo_json;
    const opcaoId = pickHarnessOpcaoIdFromConteudo(conteudo);
    if (!opcaoId) continue;
    const commercial = evaluateHarnessSlugCommercialEligibility({
      modulo_slug: slug,
      titulo_aula: (row as { titulo_aula?: string | null }).titulo_aula ?? null,
      conteudo_json: conteudo,
    });
    if (!commercial.commercial_eligible) continue;
    fixtures.push({ modulo_slug: slug, default_opcao_id: opcaoId });
    if (fixtures.length >= limit) break;
  }
  if (fixtures.length === 0) {
    throw new Error('Nenhum slug comercialmente elegível disponível para fixture');
  }
  return fixtures;
}
