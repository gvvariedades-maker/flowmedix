/**
 * Aprovações de produção G0.4 por slug — gate efetivo (não só meta/exam_vs_current).
 *
 * Fonte de verdade para `production_approvals` da baseline G0.4.
 * Contagens unresolved (339) e Fase 0B NÃO são afetadas por este módulo.
 */
export const G04_AMEOSC_SLUG =
  'ameosc-enfermagem-nocoes-de-fisiologia-1775448586547-7' as const;

export const G04_EDUCA_SLUG =
  'educa-pb-enfermagem-nocoes-de-fisiologia-1775448599930-0' as const;

export type G04ProductionSlugDecision = {
  slug: string;
  case_id: string;
  production_approved: boolean;
  /** Bloqueio operacional: impede promote/piloto/scoring até desbloqueio explícito. */
  production_blocked: boolean;
  block_code: string | null;
  block_reason: string | null;
  decision_artifact: string;
};

export const G04_PRODUCTION_SLUG_DECISIONS: readonly G04ProductionSlugDecision[] = [
  {
    slug: G04_AMEOSC_SLUG,
    case_id: 'nc-g03-5a0a557ebdec0f89',
    production_approved: true,
    production_blocked: false,
    block_code: null,
    block_reason: null,
    decision_artifact: 'artifacts/a4-production-ameosc-educa/decision-2026-07-27.json',
  },
  {
    slug: G04_EDUCA_SLUG,
    case_id: 'nc-g03-9c3c0a3a66aabf52',
    production_approved: false,
    production_blocked: true,
    block_code: 'defective_item_no_metrics_isolation',
    block_reason:
      'Item defeituoso: gabarito oficial D vs resposta técnica B; sem contrato que isole mastery/FSRS/métricas do aluno.',
    decision_artifact: 'artifacts/a4-production-ameosc-educa/decision-2026-07-27.json',
  },
] as const;

const bySlug = new Map(G04_PRODUCTION_SLUG_DECISIONS.map((d) => [d.slug, d]));

export function getG04ProductionSlugDecision(
  slug: string,
): G04ProductionSlugDecision | undefined {
  return bySlug.get(slug);
}

export function isG04SlugProductionApproved(slug: string): boolean {
  return getG04ProductionSlugDecision(slug)?.production_approved === true;
}

export function isG04SlugProductionBlocked(slug: string): boolean {
  return getG04ProductionSlugDecision(slug)?.production_blocked === true;
}

export function listG04ProductionBlockedSlugs(): string[] {
  return G04_PRODUCTION_SLUG_DECISIONS.filter((d) => d.production_blocked).map((d) => d.slug);
}

/**
 * Gate efetivo: lança se o slug estiver bloqueado para produção.
 * Usar antes de promote, piloto, apply Supabase ou inclusão em pool scored.
 */
export function assertG04SlugMayEnterProduction(slug: string): void {
  const d = getG04ProductionSlugDecision(slug);
  if (!d) return;
  if (d.production_blocked || !d.production_approved) {
    throw new Error(
      `[g04-production] slug bloqueado para produção: ${slug}` +
        (d.block_code ? ` (${d.block_code})` : '') +
        (d.block_reason ? ` — ${d.block_reason}` : ''),
    );
  }
}

export const G04_PRODUCTION_APPROVAL_FLAGS = {
  ameosc: isG04SlugProductionApproved(G04_AMEOSC_SLUG),
  educa: isG04SlugProductionApproved(G04_EDUCA_SLUG),
  fenix_package_production_status: 'none' as const,
} as const;
