import type { FamilyId } from '@/lib/catalogMigration/classifyFamily';

/**
 * Golden visual por família pedagógica — referência para player/docs (não gravar no JSON).
 * O player resolve layout via subtópico + FAMILY_LAYOUT_PROFILE + rotação por slug.
 */
export type FamilyLayoutProfile = {
  conceptMap: string;
  goldenRule: string;
  logicFlow: string;
  dangerZone: string;
};

export const FAMILY_LAYOUT_PROFILE: Record<FamilyId, FamilyLayoutProfile> = {
  legis: {
    conceptMap: 'bridge',
    goldenRule: 'reference_table',
    logicFlow: 'vertical',
    dangerZone: 'compare',
  },
  protocolo: {
    conceptMap: 'molecular',
    goldenRule: 'banner',
    logicFlow: 'cards',
    dangerZone: 'compare',
  },
  calc: {
    conceptMap: 'stack',
    goldenRule: 'reference_table',
    logicFlow: 'horizontal',
    dangerZone: 'compare',
  },
  vf: {
    conceptMap: 'morphological',
    goldenRule: 'center',
    logicFlow: 'vertical',
    dangerZone: 'compare',
  },
  certo_errado: {
    conceptMap: 'grid',
    goldenRule: 'minimal',
    logicFlow: 'cards',
    dangerZone: 'compare',
  },
  conceito: {
    conceptMap: 'bridge',
    goldenRule: 'center',
    logicFlow: 'cards',
    dangerZone: 'compare',
  },
  text_fragment: {
    conceptMap: 'grid',
    goldenRule: 'compact',
    logicFlow: 'vertical',
    dangerZone: 'cards',
  },
};

export function getFamilyLayoutProfile(family: FamilyId): FamilyLayoutProfile {
  return FAMILY_LAYOUT_PROFILE[family];
}
