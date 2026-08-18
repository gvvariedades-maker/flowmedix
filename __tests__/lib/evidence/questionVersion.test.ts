import {
  canonicalJson,
  canonicalQuestionVersionJson,
  computeQuestionVersion,
  type EvidenceQuestionVersionInput,
} from '@/lib/evidence/questionVersion';
import { loadEvidenceFixture } from './fixtures/loadFixture';

type RichCatalog = {
  modulo_slug: string;
  meta: {
    header_line?: string;
    content_standard?: string | null;
    family?: string | null;
    pedagogical_branch?: string | null;
  };
  question_data: {
    instruction: string;
    options: Array<{ id: string; text: string; is_correct: boolean }>;
    figures?: unknown[];
  };
  reverse_study_slides?: unknown[];
  variant_with_extra_slides: {
    reverse_study_slides: unknown[];
    meta: { header_line?: string };
    question_data: { figures?: unknown[] };
  };
};

type NfcFixture = {
  nfd_instruction: string;
  nfc_instruction: string;
};

/** Projeção §1.8 — exclui slides, figuras, header_line e UI meta. */
function projectEvidenceVersionInput(
  catalog: Pick<RichCatalog, 'modulo_slug' | 'meta' | 'question_data'>,
): EvidenceQuestionVersionInput {
  return {
    modulo_slug: catalog.modulo_slug,
    instruction: catalog.question_data.instruction,
    options: catalog.question_data.options.map((o) => ({
      id: o.id,
      text: o.text,
      is_correct: o.is_correct,
    })),
    meta_evidence_relevant: {
      content_standard: catalog.meta.content_standard ?? null,
      family: catalog.meta.family ?? null,
      pedagogical_branch: catalog.meta.pedagogical_branch ?? null,
    },
  };
}

const BASE = loadEvidenceFixture<EvidenceQuestionVersionInput>(
  'question-version-base.json',
);
const RICH = loadEvidenceFixture<RichCatalog>('question-version-catalog-rich.json');
const NFC = loadEvidenceFixture<NfcFixture>('question-version-nfc.json');

describe('canonicalJson', () => {
  it('ordena chaves lexicograficamente e aplica NFC', () => {
    const composed = 'cafe\u0301'; // e + combining acute
    const precomposed = 'café'; // U+00E9
    expect(composed.normalize('NFC')).toBe(precomposed);
    const a = canonicalJson({ z: 1, a: composed });
    const b = canonicalJson({ a: precomposed, z: 1 });
    expect(a).toBe(b);
    expect(a).toBe('{"a":"café","z":1}');
  });
});

describe('computeQuestionVersion', () => {
  it('retorna hex minúsculo de 64 caracteres (fixture base)', () => {
    const hash = computeQuestionVersion(BASE);
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it('é estável para o mesmo conteúdo', () => {
    expect(computeQuestionVersion(BASE)).toBe(computeQuestionVersion({ ...BASE }));
  });

  it('ordem das options no input é irrelevante (sort by id)', () => {
    const reordered: EvidenceQuestionVersionInput = {
      ...BASE,
      options: [
        { id: 'A', text: 'Opção A', is_correct: true },
        { id: 'B', text: 'Opção B', is_correct: false },
        { id: 'C', text: 'Opção C', is_correct: false },
      ],
    };
    expect(computeQuestionVersion(reordered)).toBe(computeQuestionVersion(BASE));
  });

  it('muda com instruction', () => {
    const edited = { ...BASE, instruction: 'Outro enunciado.' };
    expect(computeQuestionVersion(edited)).not.toBe(computeQuestionVersion(BASE));
  });

  it('muda com texto de option', () => {
    const edited = {
      ...BASE,
      options: BASE.options.map((o) =>
        o.id === 'A' ? { ...o, text: 'Texto alterado' } : o,
      ),
    };
    expect(computeQuestionVersion(edited)).not.toBe(computeQuestionVersion(BASE));
  });

  it('muda com gabarito (is_correct)', () => {
    const edited = {
      ...BASE,
      options: BASE.options.map((o) => ({
        ...o,
        is_correct: o.id === 'B',
      })),
    };
    expect(computeQuestionVersion(edited)).not.toBe(computeQuestionVersion(BASE));
  });

  it('meta ausente → null estável (igual a meta explícita com nulls)', () => {
    const withoutMeta: EvidenceQuestionVersionInput = {
      modulo_slug: BASE.modulo_slug,
      instruction: BASE.instruction,
      options: BASE.options,
    };
    const withNullMeta: EvidenceQuestionVersionInput = {
      ...BASE,
      meta_evidence_relevant: {
        content_standard: null,
        family: null,
        pedagogical_branch: null,
      },
    };
    expect(computeQuestionVersion(withoutMeta)).toBe(computeQuestionVersion(withNullMeta));
    expect(computeQuestionVersion(withoutMeta)).not.toBe(computeQuestionVersion(BASE));
  });

  it('NFC: formas Unicode equivalentes produzem o mesmo hash (fixture)', () => {
    expect(NFC.nfd_instruction.normalize('NFC')).toBe(NFC.nfc_instruction);
    const a = computeQuestionVersion({ ...BASE, instruction: NFC.nfd_instruction });
    const b = computeQuestionVersion({ ...BASE, instruction: NFC.nfc_instruction });
    expect(a).toBe(b);
  });

  it('slides / figuras / header_line não alteram o hash (projeção do catálogo rico)', () => {
    const projectedA = projectEvidenceVersionInput(RICH);
    const projectedB = projectEvidenceVersionInput({
      modulo_slug: RICH.modulo_slug,
      meta: {
        ...RICH.meta,
        ...RICH.variant_with_extra_slides.meta,
      },
      question_data: {
        instruction: RICH.question_data.instruction,
        options: RICH.question_data.options,
        figures: RICH.variant_with_extra_slides.question_data.figures,
      },
    });

    // Variante muda slides/figuras/header_line — projeção avaliativa idêntica
    expect(RICH.meta.header_line).not.toBe(
      RICH.variant_with_extra_slides.meta.header_line,
    );
    expect(RICH.reverse_study_slides).not.toEqual(
      RICH.variant_with_extra_slides.reverse_study_slides,
    );
    expect(computeQuestionVersion(projectedA)).toBe(computeQuestionVersion(projectedB));
    // Igual à fixture canônica base (mesmo conteúdo avaliativo)
    expect(computeQuestionVersion(projectedA)).toBe(computeQuestionVersion(BASE));
  });

  it('serialização determinística (canonical JSON estável)', () => {
    const json = canonicalQuestionVersionJson(BASE);
    expect(json).toContain('"instruction"');
    expect(json).toContain('"meta_evidence_relevant"');
    expect(json).toContain('"modulo_slug"');
    expect(json).toContain('"options"');
    const parsed = JSON.parse(json) as {
      options: Array<{ id: string; is_correct: boolean; text: string }>;
    };
    expect(parsed.options.map((o) => o.id)).toEqual(['A', 'B', 'C']);
    expect(Object.keys(parsed.options[0]!)).toEqual(['id', 'is_correct', 'text']);
    expect(Object.keys(JSON.parse(json))).toEqual([
      'instruction',
      'meta_evidence_relevant',
      'modulo_slug',
      'options',
    ]);
  });
});
