/**
 * Extrai IDs de layoutVariant — runtime do app lê snapshot estático
 * (sem fs scan → evita NFT do projeto inteiro no `next build`).
 *
 * Regenerar: `npx tsx scripts/generate-declared-variants-snapshot.ts`
 */
import snapshot from './declaredVariants.snapshot.json';

import type { DeclaredVariantEntry, SlideTypeKey } from './declaredVariantsShared';

export type { DeclaredVariantEntry, SlideTypeKey };
export {
  GENERIC_BY_SLIDE_TYPE,
  VARIANT_REGISTRY_FILES,
  VARIANT_ROUTER_FILES,
} from './declaredVariantsShared';

const SNAPSHOT = snapshot as DeclaredVariantEntry[];

/** Lista variantes declaradas (id × slideType). */
export function listDeclaredVariants(_cwd?: string): DeclaredVariantEntry[] {
  return SNAPSHOT;
}

/** IDs únicos (sem slideType) — útil para cruzar com contagem de uso. */
export function declaredVariantIds(_cwd?: string): string[] {
  return [...new Set(SNAPSHOT.map((v) => v.id))].sort();
}
