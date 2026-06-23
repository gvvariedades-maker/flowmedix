import {
  detectDangerGabaritoMismatch,
  detectDuplicateDangerJustifications,
  detectSlideTopicDrift,
  formatGabaritoCorrect,
  hasInstructionArtifacts,
  parseGabaritoLetter,
  stripGabaritoPrefix,
} from '@/lib/catalogMigration/slideContract';

describe('slideContract', () => {
  it('formatGabaritoCorrect usa formato canônico com letra', () => {
    expect(formatGabaritoCorrect('d', 'explicação')).toBe('Gabarito letra D — explicação');
  });

  it('parseGabaritoLetter aceita legado e canônico', () => {
    expect(parseGabaritoLetter('Gabarito B — bundle')).toBe('B');
    expect(parseGabaritoLetter('Gabarito letra C — texto')).toBe('C');
    expect(parseGabaritoLetter('sem gabarito')).toBeNull();
  });

  it('stripGabaritoPrefix remove prefixo', () => {
    expect(stripGabaritoPrefix('Gabarito letra A — motivo')).toBe('motivo');
  });

  it('detectSlideTopicDrift quando slides IPCS sem âncora no enunciado', () => {
    const drift = detectSlideTopicDrift('punção venosa periférica', {
      type: 'golden_rule',
      content: 'BUNDLE DO CVC',
    });
    expect(drift).toBe(true);
  });

  it('hasInstructionArtifacts detecta numeração de importação', () => {
    expect(hasInstructionArtifacts('EXCETO:\n2543)\n2544)')).toBe(true);
    expect(hasInstructionArtifacts('EXCETO: técnica correta')).toBe(false);
  });

  it('detectDangerGabaritoMismatch compara letra da questão', () => {
    const result = detectDangerGabaritoMismatch(
      [{ id: 'D', is_correct: true }],
      [
        {
          type: 'danger_zone',
          items: [{ correct: 'Gabarito letra B — errado' }],
        },
      ],
    );
    expect(result.mismatch).toBe(true);
    expect(result.expected).toBe('D');
    expect(result.parsed).toBe('B');
  });

  it('detectDuplicateDangerJustifications flagra explicação reciclada entre letras', () => {
    const reciclado = detectDuplicateDangerJustifications([
      {
        type: 'danger_zone',
        items: [
          { correct: 'Gabarito letra D — conduta correta no enunciado.' },
          { correct: 'Gabarito letra D — conduta correta no enunciado.' },
          { correct: 'Gabarito letra D — identificar o acesso é correto.' },
        ],
      },
    ]);
    expect(reciclado.duplicate).toBe(true);
    expect(reciclado.total).toBe(3);
    expect(reciclado.unique).toBe(2);
  });

  it('detectDuplicateDangerJustifications aceita explicações específicas por alternativa', () => {
    const especifico = detectDuplicateDangerJustifications([
      {
        type: 'danger_zone',
        items: [
          { correct: 'Gabarito letra D — antissepsia com álcool 70% está correta.' },
          { correct: 'Gabarito letra D — identificar o acesso com data e profissional está correto.' },
          { correct: 'Gabarito letra D — novo cateter a cada tentativa é correto.' },
        ],
      },
    ]);
    expect(especifico.duplicate).toBe(false);
    expect(especifico.unique).toBe(3);
  });
});
