import type { SlideType } from '@/types/lesson';

/** Rótulos padrão do chip por tipo (PT-BR, uppercase — alinhado ao material de marketing). */
export const SLIDE_TYPE_CHIP_LABELS: Record<SlideType, string> = {
  concept_map: 'MAPA DE CONCEITOS',
  golden_rule: 'REGRA DE OURO',
  logic_flow: 'FLUXO LÓGICO',
  danger_zone: 'ZONA DE PERIGO',
  syllable_scanner: 'SCANNER SILÁBICO',
  versus_arena: 'ARENA VERSUS',
};

/** Fio condutor narrativo por tipo de slide (estudo reverso). */
export const SLIDE_ARC_BY_TYPE: Record<SlideType, string> = {
  concept_map: 'Panorama do tema',
  golden_rule: 'Regra que a banca cobra',
  logic_flow: 'Raciocínio passo a passo',
  danger_zone: 'Evite as pegadinhas',
  syllable_scanner: 'Acentuação e sílabas',
  versus_arena: 'Compare os conceitos',
};

const POSITION_ARC_FALLBACK = [
  'Panorama do tema',
  'Regra essencial',
  'Fluxo lógico',
  'Pegadinhas',
] as const;

function isSlideType(value: string): value is SlideType {
  return value in SLIDE_TYPE_CHIP_LABELS;
}

/** Chip do tipo: override JSON (`chip_label`) ou padrão por `type`. */
export function getSlideChipLabel(type: string | undefined, chipLabelOverride?: string): string {
  const trimmed = chipLabelOverride?.trim();
  if (trimmed) return trimmed.toUpperCase();
  if (type && isSlideType(type)) return SLIDE_TYPE_CHIP_LABELS[type];
  return 'NEUROSLIDE';
}

/** Texto do fio condutor: prioriza arco por tipo; fallback por posição na sequência. */
export function getSlideArcLabel(
  type: string | undefined,
  slideIndex: number,
  _totalSlides: number,
): string {
  if (type && isSlideType(type)) return SLIDE_ARC_BY_TYPE[type];
  return POSITION_ARC_FALLBACK[slideIndex] ?? `Etapa ${slideIndex + 1}`;
}
