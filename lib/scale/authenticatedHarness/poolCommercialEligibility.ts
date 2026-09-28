import { canServeCommercialContent } from '@/lib/catalogMigration/commercialAuthority';

export type HarnessSlugCommercialCheck = {
  modulo_slug: string;
  commercial_eligible: boolean;
  commercial_reason: string | null;
};

export function evaluateHarnessSlugCommercialEligibility(input: {
  modulo_slug: string;
  titulo_aula?: string | null;
  conteudo_json: unknown;
}): HarnessSlugCommercialCheck {
  const result = canServeCommercialContent({
    isAdmin: false,
    slug: input.modulo_slug,
    tituloAula: input.titulo_aula ?? null,
    conteudoJson: input.conteudo_json,
  });
  return {
    modulo_slug: input.modulo_slug,
    commercial_eligible: result.eligible,
    commercial_reason: result.eligible ? null : (result.reason ?? 'UNKNOWN'),
  };
}
