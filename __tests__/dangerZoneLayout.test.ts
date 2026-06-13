import {
  resolveDangerZoneLayoutVariant,
  dangerZoneHasCompareItems,
} from '@/components/slides/core/dangerZoneLayout';
import { DANGER_ZONE_LAYOUT_POOL } from '@/components/slides/core/layoutRotation';

describe('dangerZoneLayout', () => {
  it('retorna list sem items.correct (legado)', () => {
    const slide = {
      items: [{ label: 'Erro', detail: 'Descrição' }],
    };
    expect(resolveDangerZoneLayoutVariant(slide, undefined)).toBe('list');
    expect(dangerZoneHasCompareItems(slide.items)).toBe(false);
  });

  it('retorna compare quando há correct não vazio', () => {
    const slide = {
      items: [
        { label: 'Trap', detail: 'X', correct: 'Conduta certa' },
      ],
    };
    expect(resolveDangerZoneLayoutVariant(slide, undefined)).toBe('compare');
    expect(dangerZoneHasCompareItems(slide.items)).toBe(true);
  });

  it('ignora correct só com espaços', () => {
    const slide = {
      items: [{ label: 'Trap', detail: 'X', correct: '   ' }],
    };
    expect(resolveDangerZoneLayoutVariant(slide, undefined)).toBe('list');
    expect(dangerZoneHasCompareItems(slide.items)).toBe(false);
  });

  it('força compare com layout_variant explícito', () => {
    expect(resolveDangerZoneLayoutVariant({ items: [] }, 'compare')).toBe('compare');
  });

  it('respeita override cards quando explícito no JSON', () => {
    const slide = {
      items: [{ label: 'T', detail: 'D', correct: 'C' }],
    };
    expect(resolveDangerZoneLayoutVariant(slide, 'cards')).toBe('cards');
  });

  it('molde trap-reveal vence auto-compare quando fallback é trap-reveal', () => {
    const slide = {
      items: [{ label: 'Trap', detail: 'X', correct: 'Conduta certa' }],
    };
    expect(resolveDangerZoneLayoutVariant(slide, undefined, 'trap-reveal')).toBe('trap-reveal');
  });

  it('molde calendar-mismatch vence auto-compare quando fallback é calendar-mismatch', () => {
    const slide = {
      items: [{ label: 'Trap', detail: 'X', correct: 'Conduta certa' }],
    };
    expect(resolveDangerZoneLayoutVariant(slide, undefined, 'calendar-mismatch')).toBe(
      'calendar-mismatch',
    );
  });

  it('correct vence mapa compact quando layout_variant não está no JSON', () => {
    const slide = {
      items: [{ label: 'Trap', detail: 'X', correct: 'Conduta certa' }],
    };
    expect(resolveDangerZoneLayoutVariant(slide, undefined, 'compact')).toBe('compare');
  });

  it('rotaciona list/compare/cards com slug sem items.correct', () => {
    const slide = {
      items: [{ label: 'Erro', detail: 'Descrição' }],
    };
    const result = resolveDangerZoneLayoutVariant(
      slide,
      undefined,
      'cards',
      { slug: 'text-fragment-sae-1', slideIndex: 3 },
      DANGER_ZONE_LAYOUT_POOL,
    );
    expect(DANGER_ZONE_LAYOUT_POOL).toContain(result);
  });
});
