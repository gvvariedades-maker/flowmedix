import {
  extractPniMonths,
  inferIntervalChips,
  inferPniCategory,
  inferPniIconName,
  inferPniMatrixRowBadge,
  inferPniRowChip,
  inferPniTrapSlots,
  inferVfJudgement,
  isPniConclusionRow,
  parsePniVfStep,
  pniMonthLabel,
} from '@/lib/slides/pniSlideUtils';

describe('pniSlideUtils', () => {
  it('infere categoria PNI por texto', () => {
    expect(inferPniCategory('Grace period 4 dias antes da idade mínima')).toBe('intervalo');
    expect(inferPniCategory('Men C ao 3º mês no calendário')).toBe('calendario');
    expect(inferPniCategory('Cadeia de frio 2–8°C termolábil')).toBe('rede_frio');
    expect(inferPniCategory('Combinação correta — letra C')).toBe('gabarito');
  });

  it('infere ícone por categoria', () => {
    expect(inferPniIconName('3º mês BCG')).toBe('Calendar');
    expect(inferPniIconName('Intervalo 30 dias SCR × FA')).toBe('Clock');
    expect(inferPniIconName('Termômetro 2–8°C')).toBe('Thermometer');
    expect(inferPniIconName('Marcar letra C')).toBe('CheckCircle');
  });

  it('extrai chips de intervalo', () => {
    const chips = inferIntervalChips('Grace 4 dias; intervalo 30 dias; VPC13 8 sem');
    expect(chips.map((c) => c.label)).toEqual(expect.arrayContaining(['4D', '30D', '8SEM']));
  });

  it('infere chip de linha da golden_rule', () => {
    expect(inferPniRowChip('I — grace 4d → FALSA')).toBe('4D');
    expect(inferPniRowChip('Afirmativa verdadeira')).toBe('V');
    expect(inferPniRowChip('Combinação letra C')).toBe('✓');
  });

  it('detecta linha de conclusão', () => {
    expect(isPniConclusionRow('Combinação', 'II, III e IV → letra C')).toBe(true);
    expect(isPniConclusionRow('I — grace', 'FALSA')).toBe(false);
  });

  it('infere julgamento V/F', () => {
    expect(inferVfJudgement('Julgar I → FALSO')).toBe('false');
    expect(inferVfJudgement('Afirmativa II → VERDADEIRO')).toBe('true');
    expect(inferVfJudgement('Montar conjunto verdadeiro')).toBe('true');
    expect(inferVfJudgement('Identificar formato da questão')).toBe(null);
  });

  it('parseia step de julgamento V/F', () => {
    const parsed = parsePniVfStep('Julgar afirmativa III: VPC13 antes de VPP23 → VERDADEIRO', 2);
    expect(parsed.kind).toBe('judgement');
    expect(parsed.roman).toBe('III');
    expect(parsed.judgement).toBe('true');
    expect(parsed.question).toContain('VPC13');
  });

  it('extrai citação entre aspas sem truncar no julgamento V/F', () => {
    const longQuote =
      'A vacinação é o único modo de prevenir a Poliomielite, assim todas as crianças menores de cinco anos de idade devem ser vacinadas, conforme esquema de rotina e campanha nacional anual.';
    const parsed = parsePniVfStep(
      `Avaliar Afirmativa III: '${longQuote}' Esta afirmação é verdadeira.`,
      2,
    );
    expect(parsed.kind).toBe('judgement');
    expect(parsed.question).toBe(longQuote);
    expect(parsed.question).not.toContain('…');
  });

  it('infere badge FALSA para alternativa incorreta no golden_rule MCQ', () => {
    expect(
      inferPniMatrixRowBadge(
        'Alternativa B (Incorreta)',
        'Controle rigoroso do acesso dos pacientes aos serviços de saúde.',
      ),
    ).toBe('FALSA');
    expect(
      inferPniMatrixRowBadge(
        'Alternativa C (Correta)',
        'Identificação rápida de crianças em atraso vacinal.',
      ),
    ).toBe('VERDADEIRA');
    expect(inferPniMatrixRowBadge('I — grace 4d', '→ FALSA')).toBe('FALSA');
    expect(inferPniMatrixRowBadge('II — SCR', 'VERDADEIRA: intervalo 30 dias')).toBe('VERDADEIRA');
  });

  it('parseia step de combinação e localização', () => {
    expect(parsePniVfStep('Montar conjunto verdadeiro: II, III, IV', 3).kind).toBe('combine');
    expect(parsePniVfStep('Localizar alternativa letra C e marcar', 4).kind).toBe('locate');
  });

  it('extrai meses do calendário', () => {
    expect(extractPniMonths('Men C ao 3º mês; reforço 12 meses')).toEqual(expect.arrayContaining([3, 12]));
    expect(extractPniMonths('BCG ao nascer')).toEqual([0]);
    expect(extractPniMonths('Rotavírus 2, 4 e 6 meses')).toEqual(expect.arrayContaining([2, 4, 6]));
  });

  it('infere slots de pegadinha com rail e chips', () => {
    const slots = inferPniTrapSlots(
      'Letra A',
      'Men C na 3ª dose ao 3 meses',
      'Calendário: 3, 5 e 12 meses — grace 4 dias',
    );
    expect(slots.hasRail).toBe(true);
    expect(slots.trapMonths).toContain(3);
    expect(slots.correctMonths).toEqual(expect.arrayContaining([3, 5, 12]));
    expect(slots.chips.map((c) => c.label)).toEqual(expect.arrayContaining(['3M', '5M', '12M', '4D']));
  });

  it('formata label de mês', () => {
    expect(pniMonthLabel(0)).toBe('0');
    expect(pniMonthLabel(3)).toBe('3M');
  });
});
