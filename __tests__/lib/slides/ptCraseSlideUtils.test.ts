import {
  buildPtCraseFunnelBoard,
  inferRowBoardBadge,
  inferFunnelStage,
  inferStepRole,
} from '@/lib/slides/ptCraseSlideUtils';

describe('ptCraseSlideUtils — inferStepRole (passa/barrada)', () => {
  it('não classifica «não a+a / sem crase» como passa (bug letra B)', () => {
    expect(
      inferStepRole(
        'B: «abordam à versatilidade» — o verbo pede o quê? (versatilidade). Não é a+a → sem crase.',
      ),
    ).toBe('eliminar_letra');
  });

  it('classifica letra correta com “Passa” / a+a afirmativo', () => {
    expect(
      inferStepRole(
        'C: dirigir-se pede a + a Serra → a+a. Teste: ao Monte → à Serra. Passa.',
      ),
    ).toBe('validar_letra');
  });

  it('corta A (verbo) e D (pronome)', () => {
    expect(inferStepRole('A: «à estudar» — estudar é verbo → use só a → sem crase.')).toBe(
      'eliminar_letra',
    );
    expect(inferStepRole('D: «comum à todos» — todos não aceita artigo a → sem crase.')).toBe(
      'eliminar_letra',
    );
  });
});

describe('ptCraseSlideUtils — buildPtCraseFunnelBoard (TE-simples)', () => {
  const steps = [
    'Comando: só uma frase usa à do jeito certo. As outras caem no funil.',
    'A: «à estudar» — estudar é verbo → use só a → sem crase.',
    'B: «abordam à versatilidade» — o verbo pede o quê? (versatilidade). Não é a+a → sem crase.',
    'D: «comum à todos» — todos não aceita artigo a → sem crase.',
    'E: «à ferramentas» — à é singular; ferramentas é plural → errou o número.',
    'C: dirigir-se pede a + a Serra → a+a. Teste: ao Monte → à Serra. Passa.',
    'Gabarito C — única com a + artigo da Serra da Capivara.',
    'Em similares: verbo pede a? masculino/verbo/pronome? a+a? Só então use à.',
  ];

  it('monta board Sem à / Com à a partir dos steps da âncora', () => {
    const model = buildPtCraseFunnelBoard(steps);
    expect(model).not.toBeNull();
    expect(model!.answerLetter).toBe('C');
    expect(model!.keyHasFusion).toBe(true);
    expect(model!.options.some((o) => o.letter === 'A' && o.bucket === 'sem_crase')).toBe(true);
    expect(model!.options.some((o) => o.letter === 'C' && o.bucket === 'com_crase')).toBe(true);
    expect(model!.keyExample.toLowerCase()).toMatch(/serra|à/);
  });
});

describe('ptCraseSlideUtils — badge do funnel board (P0)', () => {
  it('success → valida à', () => {
    expect(
      inferRowBoardBadge({
        label: 'Teste 3',
        value: 'a + a feminino → à / às',
        emphasis: 'success',
      }),
    ).toBe('valida à');
  });

  it('highlight / teste ao → portátil', () => {
    expect(
      inferRowBoardBadge({
        label: 'Teste ao',
        value: 'ao no masc. → à no feminino',
        emphasis: 'highlight',
      }),
    ).toBe('portátil');
  });

  it('teste 1 / sem crase → barra (nunca valida à)', () => {
    expect(
      inferRowBoardBadge({
        label: 'Teste 1',
        value: 'masculino → sem crase',
      }),
    ).toBe('barra');
  });

  it('teste 2 verbo → barra', () => {
    expect(
      inferRowBoardBadge({
        label: 'Teste 2',
        value: 'verbo/infinitivo → sem crase',
      }),
    ).toBe('barra');
  });

  it('não marca barra no exemplo de crase correta sem emphasis', () => {
    expect(
      inferRowBoardBadge({
        label: 'Teste 3',
        value: 'obedecer a + a ordem → à ordem',
      }),
    ).toBe('valida à');
  });

  it('inferFunnelStage reconhece Teste 1–3 e ao', () => {
    expect(inferFunnelStage('Teste 1 masculino')).toBe('teste_masculino');
    expect(inferFunnelStage('Teste 2 verbo')).toBe('teste_verbo');
    expect(inferFunnelStage('Teste 3 a + a')).toBe('teste_a_a');
    expect(inferFunnelStage('Teste ao portátil')).toBe('teste_ao');
  });
});
