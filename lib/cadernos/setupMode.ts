/** Modo de onboarding do detalhe do caderno (query `?setup=`). */
export type CadernoSetupMode = 'none' | 'setup' | 'done';

/**
 * Mapeia `searchParams.setup` para o modo interno.
 * - `done` → celebração pós-criação com questões
 * - `1` → painel de inserção aberto (caderno vazio ou completar)
 * - qualquer outro valor → detalhe normal
 */
export function resolveCadernoSetupMode(setupParam?: string): CadernoSetupMode {
  if (setupParam === 'done') return 'done';
  if (setupParam === '1') return 'setup';
  return 'none';
}
