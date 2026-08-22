import { CANONICAL_SLIDE_TYPES, CATALOG_VERSION, GESTURES, type Gesture, type SlideType } from './model';

const PRIMITIVES: Record<SlideType, readonly string[]> = {
  concept_map: ['BoardChrome', 'CategoryStrip', 'ProtocolRailRow', 'CriticalNumber'],
  logic_flow: ['LogicFocusShell', 'LogicRailShell', 'PolarityPanel', 'PillarDeck'],
  golden_rule: ['BoardChrome', 'LabelBodyRow', 'CriticalNumber', 'AlertCallout'],
  danger_zone: ['BoardChrome', 'PolarityPanel', 'AlertCallout', 'CategoryStrip'],
};

export function compositionId(slideType: SlideType, gesture: Gesture): string {
  return `nv1.${slideType}.${gesture}`;
}

export const SHADOW_CATALOG = {
  catalog_version: CATALOG_VERSION,
  gestures: GESTURES,
  compositions: Object.fromEntries(
    CANONICAL_SLIDE_TYPES.flatMap((slideType) =>
      GESTURES.map((gesture) => [
        compositionId(slideType, gesture),
        { slide_type: slideType, gesture, primitives: PRIMITIVES[slideType] },
      ]),
    ),
  ),
} as const;

export function hasComposition(id: string, slideType: SlideType): boolean {
  const entry = SHADOW_CATALOG.compositions[id as keyof typeof SHADOW_CATALOG.compositions];
  return entry?.slide_type === slideType;
}
