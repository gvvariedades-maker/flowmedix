import {
  PEDAGOGY_REPAIR_KINDS,
  repairGabaritoItemInPayload,
  repairLetterTruncationInPayload,
  repairLogicPaddingInPayload,
  repairPedagogySignature,
  repairVfLabelsInPayload,
} from '@/lib/catalogMigration/repairPedagogySignatures';
import { detectUnifiedPedagogy } from '@/lib/catalogMigration/unifiedPedagogyDetector';

type Slide = Record<string, unknown>;

function payloadWith(slides: Slide[], instruction = 'Assinale a alternativa correta.') {
  return {
    meta: { family: 'certo_errado' },
    question_data: { instruction, options: [{ id: 'C', text: 'x', is_correct: true }] },
    reverse_study_slides: slides,
  };
}

describe('repairLetterTruncationInPayload', () => {
  it('corta a cláusula final que julga a alternativa, preservando o ensino', () => {
    const payload = payloadWith([
      {
        type: 'concept_map',
        items: [
          {
            label: 'Pegadinha divergente',
            detail:
              'Pressão divergente = afastamento entre sistólica e diastólica — C erra ao dizer que máxima e mínima se aproximam.',
          },
          {
            label: 'Sítio de aferição',
            detail: 'Braço: artéria braquial · perna: artéria pediosa — B e D são locais clássicos de prova.',
          },
        ],
      },
    ]);

    const result = repairLetterTruncationInPayload(payload);
    expect(result.changed).toBe(true);
    expect(result.edits).toHaveLength(2);

    const items = payload.reverse_study_slides[0].items as { detail: string }[];
    expect(items[0].detail).toBe(
      'Pressão divergente = afastamento entre sistólica e diastólica.',
    );
    expect(items[1].detail).toBe('Braço: artéria braquial · perna: artéria pediosa.');
  });

  it('limpa a assinatura pedagogy_letter_spoiler do concept_map', () => {
    const payload = payloadWith([
      {
        type: 'concept_map',
        items: [
          {
            label: 'Material',
            detail:
              'Esfigmomanômetro calibrado + estetoscópio para auscultar Korotkoff — E é conduta correta.',
          },
        ],
      },
    ]);

    expect(detectUnifiedPedagogy(payload).map((f) => f.code)).toContain('pedagogy_letter_spoiler');
    repairLetterTruncationInPayload(payload);
    expect(detectUnifiedPedagogy(payload).map((f) => f.code)).not.toContain(
      'pedagogy_letter_spoiler',
    );
  });

  it('não toca logic_flow nem danger_zone — gabarito e cards de distrator vivem lá', () => {
    const payload = payloadWith([
      { type: 'logic_flow', steps: ['Testar A: definição correta — A é verdadeira.', 'Marcar letra C.'] },
      {
        type: 'danger_zone',
        content: 'PEGADINHAS',
        items: [{ label: 'Letra B — braquial', detail: 'Local óbvio — B é conduta correta.' }],
      },
    ]);

    expect(repairLetterTruncationInPayload(payload).changed).toBe(false);
  });

  it('pula quando o texto restante ficaria curto ou continuaria entregando a letra', () => {
    const payload = payloadWith([
      {
        type: 'golden_rule',
        rows: [
          { label: 'Plano C leve', value: 'Falso — C é grave' },
          { label: 'Sítios', value: 'C erra ao citar a radial — B e D são sítios corretos.' },
        ],
      },
    ]);

    const result = repairLetterTruncationInPayload(payload);
    expect(result.changed).toBe(false);
    expect(result.skipped.map((s) => s.reason).sort()).toEqual([
      'kept_still_spoils',
      'kept_too_short',
    ]);
  });

  it('corta só a partir da frase que julga, preservando o contraste anterior', () => {
    const payload = payloadWith([
      {
        type: 'concept_map',
        items: [
          {
            label: 'Volume SC',
            detail:
              'SC admite volumes pequenos e limitados por sítio — não doses grandes. D erra ao falar em doses grandes + efeito rápido.',
          },
        ],
      },
    ]);

    expect(repairLetterTruncationInPayload(payload).changed).toBe(true);
    const items = payload.reverse_study_slides[0].items as { detail: string }[];
    expect(items[0].detail).toBe(
      'SC admite volumes pequenos e limitados por sítio — não doses grandes.',
    );
  });
});

describe('repairLogicPaddingInPayload', () => {
  it('remove o passo Confirmar adjacente a Marcar e preserva Fixação', () => {
    const payload = payloadWith([
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        steps: [
          'Comando: destaque o aspecto incorreto.',
          'Testar A: definição de PA → eliminar.',
          'Testar C: divergente aproxima → FALSO.',
          'Confirmar: só C traz aspecto incorreto.',
          'Marcar letra C.',
          'Fixação: divergente = distância grande entre sistólica e diastólica.',
        ],
      },
    ]);

    const result = repairLogicPaddingInPayload(payload);
    expect(result.changed).toBe(true);
    expect(result.edits[0].action).toBe('remove');

    const steps = payload.reverse_study_slides[0].steps as string[];
    expect(steps).toHaveLength(5);
    expect(steps.some((s) => s.startsWith('Confirmar:'))).toBe(false);
    expect(steps).toContain('Marcar letra C.');
    expect(steps.some((s) => s.startsWith('Fixação:'))).toBe(true);

    const codes = detectUnifiedPedagogy(payload).map((f) => f.code);
    expect(codes).not.toContain('pedagogy_logic_padding');
    expect(codes).not.toContain('pedagogy_logic_missing_gabarito');
  });

  it('pula quando a remoção deixaria o logic_flow sem gabarito', () => {
    const payload = payloadWith([
      {
        type: 'logic_flow',
        steps: ['Testar A → eliminar.', 'Confirmar: só C sobra.', 'Marcar a que sobrou.'],
      },
    ]);

    const result = repairLogicPaddingInPayload(payload);
    expect(result.changed).toBe(false);
    expect(result.skipped[0].reason).toBe('steps_too_short');
  });

  it('não mexe em Confirmar isolado, sem Marcar adjacente', () => {
    const payload = payloadWith([
      {
        type: 'logic_flow',
        steps: [
          'Comando: assinale a correta.',
          'Confirmar: a técnica exige artéria braquial.',
          'Testar C → FALSO.',
          'Marcar letra C.',
        ],
      },
    ]);

    expect(repairLogicPaddingInPayload(payload).changed).toBe(false);
  });
});

describe('repairVfLabelsInPayload', () => {
  it('remove o veredito V/F inicial do detail', () => {
    const payload = payloadWith([
      {
        type: 'concept_map',
        items: [
          {
            label: 'Grace period',
            detail:
              'FALSA. Dose aplicada até 4 dias ANTES da idade mínima é considerada VÁLIDA no PNI.',
          },
        ],
      },
    ]);

    const result = repairVfLabelsInPayload(payload);
    expect(result.changed).toBe(true);

    const items = payload.reverse_study_slides[0].items as { detail: string }[];
    expect(items[0].detail).toBe(
      'Dose aplicada até 4 dias ANTES da idade mínima é considerada VÁLIDA no PNI.',
    );
    expect(detectUnifiedPedagogy(payload).map((f) => f.code)).not.toContain(
      'pedagogy_vf_verdict_spoiler',
    );
  });

  it('remove o prefixo "Afirmativa N — " do label e mantém o conceito', () => {
    const payload = payloadWith([
      {
        type: 'concept_map',
        items: [{ label: 'Afirmativa I — grace period (4 dias)', detail: 'Regra do manual do PNI.' }],
      },
    ]);

    const result = repairVfLabelsInPayload(payload);
    expect(result.changed).toBe(true);

    const items = payload.reverse_study_slides[0].items as { label: string }[];
    expect(items[0].label).toBe('Grace period (4 dias)');
    expect(detectUnifiedPedagogy(payload).map((f) => f.code)).not.toContain(
      'pedagogy_question_bound_label',
    );
  });

  it('pula label sem conceito depois do prefixo — nada a preservar', () => {
    const payload = payloadWith([
      { type: 'concept_map', items: [{ label: 'Afirmativa I —', detail: 'Texto.' }] },
    ]);

    const result = repairVfLabelsInPayload(payload);
    expect(result.changed).toBe(false);
    expect(result.skipped[0].reason).toBe('label_has_no_concept');
  });

  it('pula quando remover o veredito deixaria a letra exposta', () => {
    const payload = payloadWith([
      { type: 'golden_rule', rows: [{ label: 'Plano C', value: 'Falso — C é grave, não leve.' }] },
    ]);

    const result = repairVfLabelsInPayload(payload);
    expect(result.changed).toBe(false);
    expect(result.skipped[0].reason).toBe('remainder_still_spoils');
  });
});

describe('repairGabaritoItemInPayload', () => {
  it('remove o card Gabarito do concept_map e corta Núcleo da letra', () => {
    const payload = payloadWith([
      {
        type: 'concept_map',
        items: [
          {
            label: 'Cateter nasal (CNA)',
            detail:
              'Dispositivo de baixo fluxo (≈1–6 L/min). Inserido na narina. Núcleo da letra A.',
          },
          {
            label: 'Venturi',
            detail: 'Alto fluxo com FiO₂ controlada por diluidores.',
          },
          {
            label: 'Gabarito',
            detail: 'Letra A — Cateter Nasal: inserido na narina; mensurar corretamente.',
          },
        ],
      },
    ]);

    const result = repairGabaritoItemInPayload(payload);
    expect(result.changed).toBe(true);
    expect(result.edits.some((e) => e.action === 'remove')).toBe(true);

    const items = payload.reverse_study_slides[0].items as { label: string; detail: string }[];
    expect(items).toHaveLength(2);
    expect(items.some((i) => /^gabarito$/i.test(i.label))).toBe(false);
    expect(items[0].detail).toBe(
      'Dispositivo de baixo fluxo (≈1–6 L/min). Inserido na narina.',
    );
    expect(detectUnifiedPedagogy(payload).map((f) => f.code)).not.toContain(
      'pedagogy_letter_spoiler',
    );
  });

  it('remove parentético (gabarito E) sem deixar "(" pendente', () => {
    const payload = payloadWith([
      {
        type: 'concept_map',
        items: [
          {
            label: 'Infiltração',
            detail:
              'Solução medicamentosa fora do vaso, no subcutâneo — mecanismo descrito no enunciado (gabarito E).',
          },
          {
            label: 'Equipos',
            detail:
              'Não trocar equipos em intervalo inferior a 96 horas (gabarito E) — salvo contaminação ou comprometimento.',
          },
        ],
      },
    ]);

    expect(repairGabaritoItemInPayload(payload).changed).toBe(true);
    const items = payload.reverse_study_slides[0].items as { detail: string }[];
    expect(items[0].detail).toBe(
      'Solução medicamentosa fora do vaso, no subcutâneo — mecanismo descrito no enunciado.',
    );
    expect(items[1].detail).toBe(
      'Não trocar equipos em intervalo inferior a 96 horas — salvo contaminação ou comprometimento.',
    );
  });

  it('corta cauda com → letra e — … letra X no footer/detail', () => {
    const payload = payloadWith([
      {
        type: 'concept_map',
        items: [
          {
            label: 'Trilho de absorção',
            detail:
              'IV imediata → IM rápida → SC lenta. Suprimento sanguíneo maior acelera a absorção — a banca inverte essa relação na letra A.',
          },
          {
            label: 'Técnica IM',
            detail: 'Ângulo 90° em músculo adequado — volume e sítio conforme protocolo.',
          },
        ],
        footer_rule: 'I=V, II=V, III=F → I e II, apenas → letra B.',
      },
    ]);

    const result = repairGabaritoItemInPayload(payload);
    expect(result.changed).toBe(true);

    const slide = payload.reverse_study_slides[0] as {
      items: { detail: string }[];
      footer_rule: string;
    };
    expect(slide.items[0].detail).toBe(
      'IV imediata → IM rápida → SC lenta. Suprimento sanguíneo maior acelera a absorção.',
    );
    expect(slide.footer_rule).toBe('I=V, II=V, III=F → I e II, apenas.');
  });

  it('pula remoção que deixaria o concept_map com menos de 2 itens', () => {
    const payload = payloadWith([
      {
        type: 'concept_map',
        items: [
          { label: 'Tema', detail: 'Enquadramento curto do assunto.' },
          { label: 'Gabarito', detail: 'Letra D — autoclave é método central.' },
        ],
      },
    ]);

    const result = repairGabaritoItemInPayload(payload);
    expect(result.changed).toBe(false);
    expect(result.skipped[0].reason).toBe('would_empty_pre_answer');
  });
});

describe('idempotência', () => {
  function brokenPayload() {
    return payloadWith([
      {
        type: 'concept_map',
        items: [
          {
            label: 'Afirmativa I — grace period (4 dias)',
            detail:
              'FALSA. Dose aplicada até 4 dias antes da idade mínima é válida no PNI — A erra ao exigir repetição. Núcleo da letra C.',
          },
          {
            label: 'Intervalo FA',
            detail: 'Menor de 2 anos: SCR e FA com intervalo mínimo de 30 dias.',
          },
          {
            label: 'Gabarito',
            detail: 'Letra C — II, III e IV apenas.',
          },
        ],
      },
      {
        type: 'logic_flow',
        steps: [
          'Comando: julgue as afirmativas.',
          'Testar I → FALSO.',
          'Confirmar: só II e III sobram.',
          'Marcar letra C.',
          'Fixação: grace period de 4 dias valida a dose.',
        ],
      },
    ]);
  }

  for (const kind of PEDAGOGY_REPAIR_KINDS) {
    it(`${kind}: a segunda passada não reescreve nada`, () => {
      const payload = brokenPayload();
      const first = repairPedagogySignature(kind, payload);
      expect(first.changed).toBe(true);

      const snapshot = JSON.stringify(payload);
      const second = repairPedagogySignature(kind, payload);
      expect(second.changed).toBe(false);
      expect(second.edits).toHaveLength(0);
      expect(JSON.stringify(payload)).toBe(snapshot);
    });
  }

  it('os quatro repairs juntos convergem e limpam as assinaturas alvo', () => {
    const payload = brokenPayload();
    for (const kind of PEDAGOGY_REPAIR_KINDS) repairPedagogySignature(kind, payload);

    const codes = detectUnifiedPedagogy(payload).map((f) => f.code);
    expect(codes).not.toContain('pedagogy_letter_spoiler');
    expect(codes).not.toContain('pedagogy_vf_verdict_spoiler');
    expect(codes).not.toContain('pedagogy_question_bound_label');
    expect(codes).not.toContain('pedagogy_logic_padding');

    const snapshot = JSON.stringify(payload);
    for (const kind of PEDAGOGY_REPAIR_KINDS) {
      expect(repairPedagogySignature(kind, payload).changed).toBe(false);
    }
    expect(JSON.stringify(payload)).toBe(snapshot);
  });
});
