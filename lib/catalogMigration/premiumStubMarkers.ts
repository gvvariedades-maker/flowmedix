/**
 * Detecção de conteúdo stub/hybrid do pipeline legado `upgradePremium*`.
 * Mantido no trilho ativo para `premiumGate` e auditorias L1–L2.
 *
 * @see docs/DECISAO_TRILHO_A_UNICO.md
 * @see legacy/catalog-migration/ — builders arquivados
 */

/** Marcadores de conteúdo stub/hybrid — gate anti-stub em `__tests__/premium-no-stub.test.ts`. */
export const PREMIUM_STUB_MARKERS = [
  'relacione o tema',
  'ponto 1',
  'ponto 2',
  'conceito central',
  'regra essencial',
  'seleção do antígeno',
  'processamento e purificação',
  'tema da questão',
  'gabarito desta prova',
  'critério de prova',
  '[ia] enriquecer concept_map',
  '[ia] completar',
  '[ia] dispositivo',
  '[ia] fórmula',
  'preencher artigo/lei',
  'preencher fórmula',
] as const;

export function isGenericSlideText(text: string): boolean {
  const lower = text.toLowerCase();
  return PREMIUM_STUB_MARKERS.some((m) => lower.includes(m));
}

export function hasGenericSlides(slides: unknown): boolean {
  if (!Array.isArray(slides) || slides.length === 0) return true;
  const txt = JSON.stringify(slides).toLowerCase();
  return PREMIUM_STUB_MARKERS.some((m) => txt.includes(m));
}

/** Alias semântico para gate premium (stubs hybrid / placeholders IA). */
export function hasPremiumStubMarkers(slides: unknown): boolean {
  return hasGenericSlides(slides);
}
