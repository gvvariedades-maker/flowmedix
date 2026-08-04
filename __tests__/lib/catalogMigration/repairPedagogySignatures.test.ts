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

  it('corta frase final “A erra…” sem travessão e limpa exam_hint só-julgamento', () => {
    const payload = payloadWith([
      {
        type: 'concept_map',
        items: [
          {
            label: 'Trilho',
            detail:
              'IV = imediata | IM = rápida | SC = lenta/contínua | VO = variável. A erra ao pedir absorção rápida (perfil de IV/IM).',
          },
        ],
      },
      {
        type: 'golden_rule',
        rows: [
          {
            label: 'Pegadinha',
            value: 'Irritantes não vão por VO.',
            exam_hint: 'B erra ao indicar irritantes e troca metabolismo gástrico por hepático.',
          },
        ],
      },
    ]);

    expect(repairLetterTruncationInPayload(payload).changed).toBe(true);
    const items = payload.reverse_study_slides[0].items as { detail: string }[];
    const rows = payload.reverse_study_slides[1].rows as { exam_hint?: string }[];
    expect(items[0].detail).toBe('IV = imediata | IM = rápida | SC = lenta/contínua | VO = variável.');
    expect(rows[0].exam_hint).toBe('');
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

  it('aceita chip curto de board VF (piso de strip, não truncagem longa)', () => {
    const payload = payloadWith([
      {
        type: 'golden_rule',
        rows: [
          { label: 'A', value: 'Falsa: Artéria radial.' },
          { label: 'B', value: 'Verdadeira: Artéria femoral.' },
          { label: 'C', value: 'Falsa: I e II, apenas.' },
          { label: 'D', value: 'Verdadeira: F, V, V, V.' },
          { label: 'E', value: 'Falsa: I.' },
          { label: 'F', value: 'Verdadeira: 15°' },
          { label: 'G', value: 'Falsa: VO.' },
        ],
      },
    ]);

    const result = repairVfLabelsInPayload(payload);
    expect(result.changed).toBe(true);
    expect(result.edits).toHaveLength(7);
    expect(result.skipped).toHaveLength(0);

    const rows = payload.reverse_study_slides[0].rows as { value: string }[];
    expect(rows.map((r) => r.value)).toEqual([
      'Artéria radial.',
      'Artéria femoral.',
      'I e II, apenas.',
      'F, V, V, V.',
      'I.',
      '15°',
      'VO.',
    ]);
    expect(detectUnifiedPedagogy(payload).map((f) => f.code)).not.toContain(
      'pedagogy_vf_verdict_spoiler',
    );
  });

  it('relabela chip cujo texto é só Falsa/Verdadeira', () => {
    const payload = payloadWith([
      {
        type: 'concept_map',
        items: [
          { label: 'Tema', detail: 'Contexto clínico.' },
          { label: 'Falsa', detail: 'A proposição nega o conceito.' },
        ],
      },
    ]);

    const result = repairVfLabelsInPayload(payload);
    expect(result.changed).toBe(true);
    const items = payload.reverse_study_slides[0].items as { label: string }[];
    expect(items[1].label).toBe('Proposição');
    expect(detectUnifiedPedagogy(payload).map((f) => f.code)).not.toContain(
      'pedagogy_vf_verdict_spoiler',
    );
  });

  it('não trata °C está como spoiler de letra ao strippar veredito', () => {
    const payload = payloadWith([
      {
        type: 'golden_rule',
        rows: [
          {
            label: 'Temp',
            value: 'Falsa: Um paciente com temperatura axilar de 36,6°C está febril.',
          },
        ],
      },
    ]);

    const result = repairVfLabelsInPayload(payload);
    expect(result.changed).toBe(true);
    const rows = payload.reverse_study_slides[0].rows as { value: string }[];
    expect(rows[0].value).toBe('Um paciente com temperatura axilar de 36,6°C está febril.');
  });

  it('pula veredito sem conceito (resto vazio ou só pontuação)', () => {
    const payload = payloadWith([
      { type: 'golden_rule', rows: [{ label: 'Chip', value: 'FALSA.' }] },
    ]);

    const result = repairVfLabelsInPayload(payload);
    expect(result.changed).toBe(false);
    expect(result.skipped[0].reason).toBe('remainder_too_short');
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

  it('aceita resto numérico curto de Cálculo (Letra C — 80.)', () => {
    const payload = payloadWith([
      {
        type: 'concept_map',
        items: [
          { label: 'Fórmula', detail: 'gtt/min = volume × fator / tempo.' },
          { label: 'Resultado', detail: 'Letra C — 80.' },
          { label: 'Pegadinha', detail: 'Trocar fator 20 por 60.' },
        ],
      },
    ]);

    const result = repairGabaritoItemInPayload(payload);
    expect(result.changed).toBe(true);
    const items = payload.reverse_study_slides[0].items as { detail: string }[];
    expect(items[1].detail).toBe('80.');
    expect(detectUnifiedPedagogy(payload).map((f) => f.code)).not.toContain(
      'pedagogy_letter_spoiler',
    );
  });

  it('remove frase que só aponta a letra (“A letra A troca…”)', () => {
    const payload = payloadWith([
      {
        type: 'concept_map',
        items: [
          {
            label: 'Concentração',
            detail:
              '100 UI em 1 mL — não 10 UI. A letra A troca o dígito da concentração padrão.',
          },
          { label: 'Via', detail: 'Seguir a via prescrita.' },
          { label: 'Checagem', detail: 'Conferir rótulo antes de aspirar.' },
        ],
      },
    ]);

    expect(repairGabaritoItemInPayload(payload).changed).toBe(true);
    const items = payload.reverse_study_slides[0].items as { detail: string }[];
    expect(items[0].detail).toBe('100 UI em 1 mL — não 10 UI.');
    expect(detectUnifiedPedagogy(payload).map((f) => f.code)).not.toContain(
      'pedagogy_letter_spoiler',
    );
  });

  it('pula remoção que deixaria o concept_map com menos de 2 itens (ainda pode strip do detail)', () => {
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
    expect(result.skipped.some((s) => s.reason === 'would_empty_pre_answer')).toBe(true);
    const items = payload.reverse_study_slides[0].items as { label: string; detail: string }[];
    expect(items).toHaveLength(2);
    expect(items[1].label).toBe('Gabarito');
    // Prefixo Letra D — sai; o card permanece porque remover esvaziaria o mapa.
    expect(items[1].detail.toLowerCase()).toContain('autoclave');
    expect(items[1].detail).not.toMatch(/letra\s+d/i);
  });

  it('relabela Letra A/B no golden_rule a partir do value (P0 Vias)', () => {
    const payload = payloadWith([
      {
        type: 'golden_rule',
        content: 'VIAS',
        rows: [
          {
            label: 'Letra A',
            value: 'A insulina e a enoxaparina sódica.',
            badge: 'ok',
            emphasis: 'highlight',
          },
          {
            label: 'Letra B',
            value: 'O cetoprofeno e a penicilina benzatina.',
            badge: 'warn',
          },
        ],
      },
    ]);

    expect(detectUnifiedPedagogy(payload).map((f) => f.code)).toContain('pedagogy_letter_spoiler');
    const result = repairGabaritoItemInPayload(payload);
    expect(result.changed).toBe(true);
    const rows = payload.reverse_study_slides[0].rows as { label: string }[];
    expect(rows[0].label).toBe('Insulina e a enoxaparina sódica');
    expect(rows[1].label).toBe('Cetoprofeno e a penicilina benzatina');
    expect(detectUnifiedPedagogy(payload).map((f) => f.code)).not.toContain(
      'pedagogy_letter_spoiler',
    );
  });

  it('remove Gabarito da Questão e chip a partir de Alternativa B (P0 Imunização)', () => {
    const payload = payloadWith([
      {
        type: 'golden_rule',
        rows: [
          {
            label: 'Alternativa B (Correta)',
            value: '9 meses — Idade recomendada para a 1ª dose da FA.',
            badge: 'hot',
            emphasis: 'highlight',
          },
          {
            label: 'Gabarito da Questão',
            value: "Letra B — '9 meses.'",
            badge: 'ok',
          },
        ],
      },
    ]);

    const result = repairGabaritoItemInPayload(payload);
    expect(result.changed).toBe(true);
    const rows = payload.reverse_study_slides[0].rows as { label: string; value: string }[];
    expect(rows.some((r) => /^gabarito/i.test(r.label))).toBe(false);
    expect(rows[0].label).toBe('9 meses');
    expect(detectUnifiedPedagogy(payload).some((f) => f.code === 'pedagogy_letter_spoiler')).toBe(
      false,
    );
  });

  it('relabela “Letra B — gabarito” a partir do value e é idempotente (P0 Vias)', () => {
    const payload = payloadWith([
      {
        type: 'golden_rule',
        rows: [
          { label: 'Intravenosa (IV)', value: 'Imediata — efeito rápido', badge: 'info' },
          { label: 'Subcutânea (SC)', value: 'Lenta e contínua', badge: 'hot', emphasis: 'highlight' },
          {
            label: 'Letra B — gabarito',
            value: 'Única que descreve o perfil farmacocinético da SC',
          },
          { label: 'Volume típico SC', value: 'Pequeno (até ~1–1,5 mL por sítio)' },
        ],
      },
    ]);

    const first = repairGabaritoItemInPayload(payload);
    expect(first.changed).toBe(true);
    const rows = payload.reverse_study_slides[0].rows as { label: string }[];
    expect(rows.some((r) => /letra\s+[a-e]|gabarito/i.test(r.label))).toBe(false);
    expect(rows).toHaveLength(4);
    expect(rows[2].label.toLowerCase()).toContain('única');

    const second = repairGabaritoItemInPayload(payload);
    expect(second.changed).toBe(false);
    expect(second.edits).toHaveLength(0);
  });

  it('corta → letra E, GABARITO: Letra e value puro Letra A (resíduo P0)', () => {
    const payload = payloadWith([
      {
        type: 'concept_map',
        items: [
          { label: 'Tema', detail: 'Enquadramento do sítio de aplicação.' },
          { label: 'Resposta certa', detail: 'Letra D — Ventro glúteo.' },
          { label: 'Distratores', detail: 'Elimine por termo-chave anatômico.' },
        ],
        footer_rule: 'Exclua por termo-chave antes de confirmar letra D.',
      },
      {
        type: 'golden_rule',
        content: 'GABARITO: Letra B — Errado',
        rows: [
          { label: 'Combinação', value: 'II e III apenas → letra E', badge: 'hot' },
          { label: 'Resposta final', value: 'Letra A', badge: 'hot', emphasis: 'highlight' },
          { label: 'Regra', value: 'SC = absorção lenta e contínua.' },
        ],
      },
    ]);

    expect(repairGabaritoItemInPayload(payload).changed).toBe(true);
    const cm = payload.reverse_study_slides[0] as {
      items: { detail: string }[];
      footer_rule: string;
    };
    const gr = payload.reverse_study_slides[1] as {
      content?: string;
      rows: { label: string; value: string }[];
    };
    expect(cm.items[1].detail).toBe('Ventro glúteo.');
    expect(cm.footer_rule.toLowerCase()).not.toMatch(/letra\s+[a-e]/);
    expect(gr.content).toBe('Errado');
    expect(gr.rows.some((r) => /letra\s+[a-e]/i.test(r.value))).toBe(false);
    expect(gr.rows.some((r) => /^resposta final$/i.test(r.label))).toBe(false);
    expect(detectUnifiedPedagogy(payload).map((f) => f.code)).not.toContain(
      'pedagogy_letter_spoiler',
    );
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

describe('P0 Sinais residue', () => {
  it('relabela Letra A mesmo com value iniciando em Deficit', () => {
    const payload = payloadWith([
      {
        type: 'golden_rule',
        rows: [
          {
            label: 'Letra A',
            value: 'O déficit de pulso ocorre quando a PA sistólica é menor que 90 mmHg.',
            badge: 'warn',
            emphasis: 'alert',
          },
          {
            label: 'Letra D',
            value: 'O déficit de pulso é a diferença entre FC apical e pulso radial.',
            badge: 'ok',
            emphasis: 'highlight',
          },
        ],
      },
    ]);

    const result = repairGabaritoItemInPayload(payload);
    expect(result.changed).toBe(true);
    expect(result.skipped).toHaveLength(0);
    const rows = payload.reverse_study_slides[0].rows as { label: string }[];
    expect(rows[0].label.toLowerCase()).toContain('déficit');
    expect(rows[0].label).not.toMatch(/letra\s+[a-e]/i);
    expect(rows[1].label).not.toMatch(/letra\s+[a-e]/i);
    expect(detectUnifiedPedagogy(payload).some((f) => f.code === 'pedagogy_letter_spoiler')).toBe(
      false,
    );
  });

  it('limpa exam_hint Letra/Gabarito', () => {
    const payload = payloadWith([
      {
        type: 'golden_rule',
        rows: [
          {
            label: 'Faixa etária',
            value: 'Lactente: 100–160 bpm',
            exam_hint: 'Letra B — idade errada.',
          },
          {
            label: 'Fonte',
            value: 'Enunciado cita Potter',
            exam_hint: 'Gabarito A — fonte citada no enunciado.',
          },
        ],
      },
    ]);

    expect(repairLetterTruncationInPayload(payload).changed).toBe(true);
    const rows = payload.reverse_study_slides[0].rows as { exam_hint?: string }[];
    expect(rows[0].exam_hint).toBe('');
    expect(rows[1].exam_hint).toBe('');
  });
});

