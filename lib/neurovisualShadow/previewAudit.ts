import type { RuntimePlan, SlideType } from './model';

export type CapabilityGap = {
  code: 'CAPABILITY_GAP';
  gap_id: string;
  slide_type: SlideType;
  composition_id: string;
  reason: string;
  safe_preview_fallback: string;
};

export function detectPreviewCapabilityGaps(plan: RuntimePlan): CapabilityGap[] {
  const gaps: CapabilityGap[] = [];
  for (const slide of plan.slides) {
    const gesture = slide.composition_id.split('.').at(-1);
    if (gesture === 'compare' && slide.slide_type === 'concept_map') {
      gaps.push({
        code: 'CAPABILITY_GAP',
        gap_id: 'compare-item-polarity-bindings',
        slide_type: slide.slide_type,
        composition_id: slide.composition_id,
        reason: 'O plano liga a lista, mas não declara o polo semântico de cada item.',
        safe_preview_fallback: 'deck_neutro_sem_inferir_certo_errado',
      });
    }
    if (
      gesture === 'critical_number' &&
      (slide.slide_type === 'concept_map' || slide.slide_type === 'golden_rule') &&
      !slide.editorial_synthesis
    ) {
      gaps.push({
        code: 'CAPABILITY_GAP',
        gap_id: 'critical-number-atomic-bindings',
        slide_type: slide.slide_type,
        composition_id: slide.composition_id,
        reason: 'O plano não separa valor, unidade e regra; o preview preserva a frase inteira.',
        safe_preview_fallback: 'hero_textual_sem_parse_ou_truncamento',
      });
    }
    if (slide.slide_type === 'logic_flow' && gesture !== 'rail' && gesture !== 'funnel') {
      gaps.push({
        code: 'CAPABILITY_GAP',
        gap_id: 'logic-flow-gesture-specific-composition',
        slide_type: slide.slide_type,
        composition_id: slide.composition_id,
        reason: `O preview preserva a sequência, mas ainda não materializa o gesto ${gesture} no fluxo lógico.`,
        safe_preview_fallback: 'rail_progressivo_sem_reclassificar_etapas',
      });
    }
    if (
      slide.slide_type === 'golden_rule' &&
      gesture !== 'rail' &&
      gesture !== 'critical_number' &&
      gesture !== 'deck'
    ) {
      gaps.push({
        code: 'CAPABILITY_GAP',
        gap_id: 'golden-rule-gesture-specific-composition',
        slide_type: slide.slide_type,
        composition_id: slide.composition_id,
        reason: `O preview preserva as regras, mas ainda não materializa o gesto ${gesture} na regra de ouro.`,
        safe_preview_fallback: 'rail_semantico_sem_inferir_relacoes',
      });
    }
    if (slide.slide_type === 'danger_zone' && gesture !== 'compare') {
      gaps.push({
        code: 'CAPABILITY_GAP',
        gap_id: 'danger-zone-gesture-specific-composition',
        slide_type: slide.slide_type,
        composition_id: slide.composition_id,
        reason: `O preview protege o spoiler e compara erro/correção, mas ainda não materializa o gesto ${gesture} declarado pelo plano.`,
        safe_preview_fallback: 'comparacao_erro_correcao_com_reveal',
      });
    }
  }
  return gaps;
}
