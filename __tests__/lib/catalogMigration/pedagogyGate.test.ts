import { evaluatePedagogyLayer } from '@/lib/catalogMigration/pedagogyGate';
import { detectUnifiedPedagogy } from '@/lib/catalogMigration/unifiedPedagogyDetector';
import type { BlindReaderVerdict } from '@/lib/neurocanvas/blindReaderGate';
import { gradePedagogicalNote, type PedagogicalNote } from '@/lib/neurocanvas/pedagogicalNote';

function note(
  slug: string,
  grade: PedagogicalNote['grade'],
  blindReaderVerdict?: BlindReaderVerdict,
): PedagogicalNote {
  return {
    slug,
    grade,
    score: grade === 'fail' ? 40 : 100,
    signature_counts: {
      pedagogy_letter_spoiler: 0,
      pedagogy_vf_verdict_spoiler: 0,
      pedagogy_question_bound_label: 0,
      pedagogy_logic_padding: 0,
      pedagogy_polarity_risk: 0,
      pedagogy_danger_orphan: 0,
      pedagogy_logic_missing_gabarito: 0,
      pedagogy_density: 0,
    },
    blocking_codes: [],
    blind_reader: blindReaderVerdict
      ? { verdict: blindReaderVerdict, gabarito: 'C', evidence_literal: true }
      : undefined,
    reasons: [],
  };
}

describe('evaluatePedagogyLayer', () => {
  it('passa sem slugs locais (pacote sem questions/ no disco)', () => {
    expect(evaluatePedagogyLayer([]).pass).toBe(true);
  });

  it('reprova quando qualquer slug tem nota fail', () => {
    const result = evaluatePedagogyLayer([note('a', 'pass'), note('b', 'fail')]);
    expect(result.pass).toBe(false);
    expect(result.detail).toContain('b');
  });

  it('warn não barra promote', () => {
    const result = evaluatePedagogyLayer([note('a', 'warn')]);
    expect(result.pass).toBe(true);
    expect(result.detail).toContain('1 warn');
  });

  it('sem artefato do leitor cego segue pelo detector', () => {
    const result = evaluatePedagogyLayer([note('a', 'pass')]);
    expect(result.pass).toBe(true);
    expect(result.detail).toContain('leitor cego 0/1');
  });

  it('--require-blind-reader exige cobertura de todos os slugs', () => {
    const notes = [note('a', 'pass', 'pass_indeterminate'), note('b', 'pass')];
    expect(evaluatePedagogyLayer(notes, { requireBlindReader: true }).pass).toBe(false);
    expect(evaluatePedagogyLayer(notes).pass).toBe(true);
  });

  it('skip vazio de propósito não conta como cobertura do leitor cego', () => {
    const notes = [note('a', 'pass', 'skip_no_concept_map')];
    expect(evaluatePedagogyLayer(notes, { requireBlindReader: true }).pass).toBe(false);
  });

  it('--skip-pedagogy libera a camada', () => {
    const result = evaluatePedagogyLayer([note('a', 'fail')], { skip: true });
    expect(result.pass).toBe(true);
  });
});

describe('gate F4 ponta a ponta', () => {
  const spoilerPayload = {
    question_data: { instruction: 'Assinale a alternativa correta.' },
    reverse_study_slides: [
      {
        type: 'concept_map',
        items: [
          {
            label: 'Pressão divergente',
            detail: 'Afastamento entre sistólica e diastólica — C erra ao dizer que se aproximam.',
          },
        ],
      },
      { type: 'logic_flow', steps: ['Definir pressão divergente', 'Marcar letra C'] },
    ],
  };

  const cleanPayload = {
    question_data: { instruction: 'Assinale a alternativa correta.' },
    reverse_study_slides: [
      {
        type: 'concept_map',
        items: [
          { label: 'Pressão divergente', detail: 'Afastamento entre sistólica e diastólica.' },
        ],
      },
      { type: 'logic_flow', steps: ['Definir pressão divergente', 'Marcar letra C'] },
    ],
  };

  const layerFor = (payload: Parameters<typeof detectUnifiedPedagogy>[0], slug: string) =>
    evaluatePedagogyLayer([
      gradePedagogicalNote({ slug, findings: detectUnifiedPedagogy(payload) }),
    ]);

  it('lote sintético com spoiler no detail é barrado', () => {
    const result = layerFor(spoilerPayload, 'lote-sintetico-01');
    expect(result.pass).toBe(false);
    expect(result.detail).toContain('lote-sintetico-01');
  });

  it('mesmo slug sem a cláusula da letra passa', () => {
    expect(layerFor(cleanPayload, 'lote-sintetico-01').pass).toBe(true);
  });
});
