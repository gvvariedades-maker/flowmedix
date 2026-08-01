import fs from 'node:fs';
import path from 'node:path';

import {
  detectUnifiedPedagogy,
  slideTextSurfaces,
  tallySignatures,
} from '@/lib/catalogMigration/unifiedPedagogyDetector';

function payloadWith(slides: Record<string, unknown>[], extra: Record<string, unknown> = {}) {
  return {
    meta: { content_standard: 'golden-v1' },
    question_data: {
      instruction: 'Assinale a alternativa correta.',
      options: [
        { id: 'A', text: 'a', is_correct: false },
        { id: 'B', text: 'b', is_correct: true },
      ],
    },
    reverse_study_slides: slides,
    ...extra,
  };
}

const codesOf = (payload: unknown) =>
  detectUnifiedPedagogy(payload as never).map((f) => f.code);

describe('slideTextSurfaces', () => {
  it('cobre label, detail, correct, footer_rule, exam_hint e steps', () => {
    const surfaces = slideTextSurfaces({
      type: 'golden_rule',
      content: 'Regra',
      footer_rule: 'Rodapé',
      rows: [{ label: 'PA', value: '120x80', exam_hint: 'dica', fixation: 'fixa' }],
    });
    const keys = surfaces.map((s) => s.key);
    expect(keys).toEqual(
      expect.arrayContaining(['content', 'footer_rule', 'label', 'value', 'exam_hint', 'fixation']),
    );
  });

  it('ignora superfícies vazias', () => {
    expect(slideTextSurfaces({ type: 'concept_map', items: [{ label: '  ' }] })).toEqual([]);
  });
});

describe('detectUnifiedPedagogy — spoiler fora do label', () => {
  it('#1 pega letra citada no detail (ponto cego do detector antigo)', () => {
    const codes = codesOf(
      payloadWith([
        {
          type: 'concept_map',
          items: [
            {
              label: 'Pressão divergente',
              detail: 'Afastamento entre sistólica e diastólica — C erra ao dizer que se aproximam.',
            },
          ],
        },
      ]),
    );
    expect(codes).toContain('pedagogy_letter_spoiler');
  });

  it('#1 pega "letra B" no footer_rule', () => {
    const codes = codesOf(
      payloadWith([
        {
          type: 'concept_map',
          items: [{ label: 'Núcleo', detail: 'Conceito neutro.' }],
          footer_rule: 'Gabarito: letra B.',
        },
      ]),
    );
    expect(codes).toContain('pedagogy_letter_spoiler');
  });

  it('#2 pega veredito V/F com ponto final (GOLDEN_VF_VERDICT_RE exigia dois-pontos)', () => {
    const codes = codesOf(
      payloadWith([
        {
          type: 'concept_map',
          items: [{ label: 'Afirmativa II', detail: 'FALSA. O manguito deve cobrir 80% do braço.' }],
        },
      ]),
    );
    expect(codes).toContain('pedagogy_vf_verdict_spoiler');
  });

  it('#3 pega rótulo amarrado à questão', () => {
    const codes = codesOf(
      payloadWith([
        { type: 'concept_map', items: [{ label: 'Afirmativa III — técnica de aferição' }] },
      ]),
    );
    expect(codes).toContain('pedagogy_question_bound_label');
  });

  it('não acusa concept_map limpo', () => {
    const codes = codesOf(
      payloadWith([
        {
          type: 'concept_map',
          items: [{ label: 'Pressão divergente', detail: 'Sistólica e diastólica se afastam.' }],
        },
      ]),
    );
    expect(codes).not.toContain('pedagogy_letter_spoiler');
    expect(codes).not.toContain('pedagogy_vf_verdict_spoiler');
    expect(codes).not.toContain('pedagogy_question_bound_label');
  });
});

describe('detectUnifiedPedagogy — logic_flow', () => {
  it('#4 pega padding "Confirmar:" + "Marcar"', () => {
    const codes = codesOf(
      payloadWith([
        {
          type: 'logic_flow',
          steps: ['Eliminar A: sítio errado', 'Confirmar: só C', 'Marcar letra C'],
        },
      ]),
    );
    expect(codes).toContain('pedagogy_logic_padding');
  });

  it('#7 pega logic_flow que nunca chega ao gabarito', () => {
    const codes = codesOf(
      payloadWith([
        { type: 'logic_flow', steps: ['Avaliar responsividade', 'Chamar ajuda', 'Iniciar compressões'] },
      ]),
    );
    expect(codes).toContain('pedagogy_logic_missing_gabarito');
  });

  it('#7 não dispara quando o passo aponta a letra', () => {
    const codes = codesOf(
      payloadWith([{ type: 'logic_flow', steps: ['Eliminar A', 'Marcar letra C'] }]),
    );
    expect(codes).not.toContain('pedagogy_logic_missing_gabarito');
  });
});

describe('detectUnifiedPedagogy — danger_zone e densidade', () => {
  it('#5 pega polaridade em risco em comando negativo', () => {
    const payload = payloadWith(
      [
        {
          type: 'danger_zone',
          content: 'Pegadinhas',
          items: [
            {
              label: 'B',
              detail: 'Punção em artéria braquial',
              correct: 'Afirmativa correta: artéria braquial é o sítio clássico no membro superior.',
            },
          ],
        },
      ],
      {
        question_data: {
          instruction: 'São condutas corretas, EXCETO:',
          options: [
            { id: 'A', text: 'a', is_correct: true },
            { id: 'B', text: 'b', is_correct: false },
          ],
        },
      },
    );
    expect(codesOf(payload)).toContain('pedagogy_polarity_risk');
  });

  it('#6 pega danger_zone órfão em questão V/F', () => {
    const payload = payloadWith(
      [
        {
          type: 'danger_zone',
          content: 'Pegadinhas',
          items: [{ label: 'Erro comum', detail: 'Confundir faixas', correct: 'Faixa correta' }],
        },
      ],
      { meta: { content_standard: 'golden-v1', family: 'vf' } },
    );
    expect(codesOf(payload)).toContain('pedagogy_danger_orphan');
  });

  it('#8 pega densidade acima de 6', () => {
    const rows = Array.from({ length: 7 }, (_, i) => ({ label: `L${i}`, value: `V${i}` }));
    expect(codesOf(payloadWith([{ type: 'golden_rule', rows }]))).toContain('pedagogy_density');
  });
});

describe('tallySignatures', () => {
  it('agrega contagem por código', () => {
    const counts = tallySignatures(
      detectUnifiedPedagogy(
        payloadWith([
          {
            type: 'concept_map',
            items: [
              { label: 'Item 1', detail: 'FALSA. algo aqui' },
              { label: 'Item 2', detail: 'VERDADEIRA. outra coisa' },
            ],
          },
        ]) as never,
      ),
    );
    expect(counts.pedagogy_vf_verdict_spoiler).toBe(2);
    expect(counts.pedagogy_density).toBe(0);
  });
});

describe('goldens de referência (piso de defeito medido na F2a)', () => {
  const goldenPath = path.join(
    process.cwd(),
    'examples',
    'questao-premium-avancasp-sv-pa-incorreta-divergente.json',
  );

  it('detecta o spoiler que o gate antigo deixou passar', () => {
    const payload = JSON.parse(fs.readFileSync(goldenPath, 'utf8'));
    const findings = detectUnifiedPedagogy(payload);
    expect(findings.length).toBeGreaterThan(0);
    expect(findings.every((f) => typeof f.path === 'string' && f.path.length > 0)).toBe(true);
  });
});
