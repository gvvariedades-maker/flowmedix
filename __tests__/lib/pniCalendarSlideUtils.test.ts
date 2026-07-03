import {
  extractPniMonths,
  inferCalendarRowMonths,
  isPniCatchUpCorpus,
  parsePniCalendarStep,
} from '@/lib/slides/pniSlideUtils';

describe('pniSlideUtils — calendário', () => {
  it('detecta modo catch-up', () => {
    expect(isPniCatchUpCorpus('cartão perdido sem comprovação')).toBe(true);
    expect(isPniCatchUpCorpus('3º mês meningocócica')).toBe(false);
  });

  it('extrai meses de row do calendário lactente', () => {
    expect(inferCalendarRowMonths('3 meses — questão', 'Meningocócica C 1ª dose')).toEqual([3]);
    expect(inferCalendarRowMonths('Ao nascer', 'BCG + Hep B')).toEqual([0]);
  });

  it('parseia eliminação por letra', () => {
    const step = parsePniCalendarStep('Testar A (BCG): ao nascer → eliminar.', 0);
    expect(step.kind).toBe('eliminate');
    expect(step.letter).toBe('A');
    expect(extractPniMonths(step.text)).toContain(0);
  });

  it('parseia marco etário', () => {
    const step = parsePniCalendarStep('Fixar marco: 3º mês de vida.', 0);
    expect(step.kind).toBe('anchor_age');
    expect(step.months).toContain(3);
  });

  it('parseia catch-up eliminate', () => {
    const step = parsePniCalendarStep('A sorologia → não é conduta de rotina; eliminar.', 0);
    expect(step.kind).toBe('catchup_eliminate');
    expect(step.letter).toBe('A');
  });

  it('parseia gabarito', () => {
    const step = parsePniCalendarStep('Marcar B: única alternativa aos 3 meses.', 0);
    expect(step.kind).toBe('locate');
    expect(step.letter).toBe('B');
  });
});
