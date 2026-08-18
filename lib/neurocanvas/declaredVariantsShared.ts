/** Tipos e constantes compartilhados (sem fs). */
export type SlideTypeKey = 'concept_map' | 'golden_rule' | 'logic_flow' | 'danger_zone';

export const VARIANT_ROUTER_FILES: { rel: string; slideType: SlideTypeKey | 'hub' }[] = [
  { rel: 'components/slides/core/NeuroSlide.tsx', slideType: 'hub' },
  { rel: 'components/slides/variants/ConceptMap.tsx', slideType: 'concept_map' },
  { rel: 'components/slides/variants/GoldenRule.tsx', slideType: 'golden_rule' },
  { rel: 'components/slides/variants/LogicFlow.tsx', slideType: 'logic_flow' },
  { rel: 'components/slides/variants/DangerZone.tsx', slideType: 'danger_zone' },
];

export const VARIANT_REGISTRY_FILES: { rel: string; slideType: SlideTypeKey }[] = [
  { rel: 'components/slides/registry/conceptMap.ts', slideType: 'concept_map' },
  { rel: 'components/slides/registry/goldenRule.ts', slideType: 'golden_rule' },
  { rel: 'components/slides/registry/logicFlow.ts', slideType: 'logic_flow' },
  { rel: 'components/slides/registry/dangerZone.ts', slideType: 'danger_zone' },
];

export const GENERIC_BY_SLIDE_TYPE: Record<SlideTypeKey, readonly string[]> = {
  concept_map: ['grid', 'molecular', 'bridge', 'stack', 'morphological'],
  golden_rule: ['center', 'compact', 'minimal', 'banner', 'reference_table'],
  logic_flow: ['vertical', 'horizontal', 'cards'],
  danger_zone: ['list', 'compare', 'cards', 'compact'],
};

export type DeclaredVariantEntry = {
  id: string;
  slideType: SlideTypeKey;
  generic: boolean;
  routers: string[];
  /** Chave estável para galeria / e2e: `${slideType}__${id}` */
  key: string;
};
