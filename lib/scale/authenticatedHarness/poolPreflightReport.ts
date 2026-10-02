import type { SyntheticUserPoolFile } from '@/lib/scale/authenticatedHarness/types';
import { evaluateHarnessSlugCommercialEligibility } from '@/lib/scale/authenticatedHarness/poolCommercialEligibility';
import { isHarnessOpcaoIdValid } from '@/lib/scale/authenticatedHarness/poolQuestionFixture';

export const HARNESS_GERAL_CONCURSO_SLUG = 'geral';

export type PoolPreflightConcurso = {
  slug: string;
  id: string;
  status: string;
};

export type PoolPreflightSlugCheck = {
  modulo_slug: string;
  linked_to_geral: boolean;
  opcao_id: string;
  opcao_valid: boolean;
  commercial_eligible: boolean;
  commercial_reason: string | null;
};

export type PoolPreflightReport = {
  mode: 'scale-harness-pool-preflight';
  supabase_project_ref: string;
  supabase_host: string;
  concurso: PoolPreflightConcurso | null;
  concurso_modulos_count: number;
  harness_users: {
    batch: string;
    email_domain: string;
    expected: number;
    found_in_auth: number;
    pool_file_users: number;
  };
  matriculas_geral: {
    active_total_for_harness_users: number;
    active_invite: number;
    active_cadastro: number;
    active_stripe_pro: number;
    other_origem: number;
  };
  pool_slugs: {
    unique_slugs: number;
    linked_to_geral: number;
    opcao_valid: number;
    commercial_eligible: number;
    all_linked_opcao_and_commercial_valid: boolean;
    /** @deprecated use all_linked_opcao_and_commercial_valid */
    all_linked_and_opcao_valid: boolean;
    sample_checks: PoolPreflightSlugCheck[];
    commercial_blockers_sample: Array<{ modulo_slug: string; reason: string }>;
  };
  ready_for_invite_matricula_fixture: boolean;
  blockers: string[];
};

export function buildSlugPreflightChecks(
  pool: SyntheticUserPoolFile,
  slugLinked: Set<string>,
  conteudoBySlug: Map<string, unknown>,
  tituloBySlug: Map<string, string | null>,
  sampleLimit = 5,
): {
  checks: PoolPreflightSlugCheck[];
  linked: number;
  opcaoValid: number;
  commercialEligible: number;
  commercialBlockersSample: Array<{ modulo_slug: string; reason: string }>;
} {
  const seen = new Set<string>();
  const checks: PoolPreflightSlugCheck[] = [];
  const commercialBlockersSample: Array<{ modulo_slug: string; reason: string }> = [];
  let linked = 0;
  let opcaoValid = 0;
  let commercialEligible = 0;

  for (const user of pool.users) {
    const slug = user.default_questao_slug?.trim();
    if (!slug || seen.has(slug)) continue;
    seen.add(slug);

    const isLinked = slugLinked.has(slug);
    const opcaoId = user.default_opcao_id?.trim() ?? '';
    const conteudo = conteudoBySlug.get(slug);
    const opcaoOk = Boolean(conteudo && opcaoId && isHarnessOpcaoIdValid(conteudo, opcaoId));
    const commercial = evaluateHarnessSlugCommercialEligibility({
      modulo_slug: slug,
      titulo_aula: tituloBySlug.get(slug) ?? null,
      conteudo_json: conteudo,
    });

    if (isLinked) linked += 1;
    if (opcaoOk) opcaoValid += 1;
    if (commercial.commercial_eligible) commercialEligible += 1;
    if (!commercial.commercial_eligible && commercial.commercial_reason) {
      if (commercialBlockersSample.length < 12) {
        commercialBlockersSample.push({
          modulo_slug: slug,
          reason: commercial.commercial_reason,
        });
      }
    }

    if (checks.length < sampleLimit) {
      checks.push({
        modulo_slug: slug,
        linked_to_geral: isLinked,
        opcao_id: opcaoId,
        opcao_valid: opcaoOk,
        commercial_eligible: commercial.commercial_eligible,
        commercial_reason: commercial.commercial_reason,
      });
    }
  }

  return { checks, linked, opcaoValid, commercialEligible, commercialBlockersSample };
}
