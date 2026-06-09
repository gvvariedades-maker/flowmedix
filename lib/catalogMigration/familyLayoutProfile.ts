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

/** Perfil visual com âncora + pool de rotação (7 goldens visuais). */
export type FamilyVisualSlideProfile = {
  anchor: string;
  pool: readonly string[];
};

export type FamilyVisualProfile = {
  conceptMap: FamilyVisualSlideProfile;
  goldenRule: FamilyVisualSlideProfile;
  logicFlow: FamilyVisualSlideProfile;
  dangerZone: FamilyVisualSlideProfile;
};

const CONCEPT_MAP_POOL = ['bridge', 'grid', 'molecular'] as const;
const LOGIC_FLOW_POOL = ['horizontal', 'vertical', 'cards'] as const;
const GOLDEN_RULE_POOL = ['center', 'minimal', 'banner', 'compact'] as const;
const DANGER_ZONE_POOL = ['compare', 'list', 'cards'] as const;

/** Âncora tipográfica quando golden_rule sem `rows` (reference_table é só semântico). */
function goldenRuleRotationAnchor(layout: string): string {
  return layout === 'reference_table' ? 'center' : layout;
}

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

function buildVisualProfile(layout: FamilyLayoutProfile): FamilyVisualProfile {
  return {
    conceptMap: { anchor: layout.conceptMap, pool: CONCEPT_MAP_POOL },
    goldenRule: {
      anchor: goldenRuleRotationAnchor(layout.goldenRule),
      pool: GOLDEN_RULE_POOL,
    },
    logicFlow: { anchor: layout.logicFlow, pool: LOGIC_FLOW_POOL },
    dangerZone: { anchor: layout.dangerZone, pool: DANGER_ZONE_POOL },
  };
}

/** 7 goldens visuais — âncora + pool por slide (player usa com rotação por slug). */
export const FAMILY_VISUAL_PROFILE: Record<FamilyId, FamilyVisualProfile> = {
  legis: buildVisualProfile(FAMILY_LAYOUT_PROFILE.legis),
  protocolo: buildVisualProfile(FAMILY_LAYOUT_PROFILE.protocolo),
  calc: buildVisualProfile(FAMILY_LAYOUT_PROFILE.calc),
  vf: buildVisualProfile(FAMILY_LAYOUT_PROFILE.vf),
  certo_errado: buildVisualProfile(FAMILY_LAYOUT_PROFILE.certo_errado),
  conceito: buildVisualProfile(FAMILY_LAYOUT_PROFILE.conceito),
  text_fragment: buildVisualProfile(FAMILY_LAYOUT_PROFILE.text_fragment),
};

export type FamilySlideType = keyof FamilyVisualProfile;

export function getFamilyVisualProfile(family: FamilyId): FamilyVisualProfile {
  return FAMILY_VISUAL_PROFILE[family];
}

export function getFamilyVisualSlideProfile(
  family: FamilyId,
  slideType: FamilySlideType,
): FamilyVisualSlideProfile {
  return FAMILY_VISUAL_PROFILE[family][slideType];
}
