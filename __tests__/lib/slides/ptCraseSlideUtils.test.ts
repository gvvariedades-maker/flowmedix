import {
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
