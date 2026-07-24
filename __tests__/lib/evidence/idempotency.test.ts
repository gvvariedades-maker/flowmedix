import {
  classifyIdempotency,
  computeSemanticFingerprint,
  semanticFingerprintsEqual,
} from '@/lib/evidence/idempotency';
import type { EvidenceSemanticFingerprintFields } from '@/lib/evidence/types';
import { loadEvidenceFixture } from './fixtures/loadFixture';

type IdempotencyFixture = {
  semantic_base: EvidenceSemanticFingerprintFields;
  transport_retry: Record<string, unknown>;
  transport_retry_divergent: Record<string, unknown>;
  conflict_conviction: Partial<EvidenceSemanticFingerprintFields>;
  conflict_selected: Partial<EvidenceSemanticFingerprintFields>;
  distinct_attempt: Partial<EvidenceSemanticFingerprintFields>;
};

const FIX = loadEvidenceFixture<IdempotencyFixture>('idempotency-cases.json');
const BASE = FIX.semantic_base;

describe('computeSemanticFingerprint', () => {
  it('é estável para o mesmo payload (fixture)', () => {
    expect(computeSemanticFingerprint(BASE)).toBe(computeSemanticFingerprint({ ...BASE }));
  });

  it('ordem de keys no objeto de entrada é irrelevante', () => {
    const shuffled = {
      user_id: BASE.user_id,
      question_id: BASE.question_id,
      answer_change_count: BASE.answer_change_count,
      conviction: BASE.conviction,
      context: BASE.context,
      question_version: BASE.question_version,
      correct: BASE.correct,
      selected_alternative: BASE.selected_alternative,
    } satisfies EvidenceSemanticFingerprintFields;
    expect(computeSemanticFingerprint(shuffled)).toBe(computeSemanticFingerprint(BASE));
  });

  it('muda quando um campo semântico diverge', () => {
    const other = { ...BASE, ...FIX.conflict_selected };
    expect(computeSemanticFingerprint(other)).not.toBe(computeSemanticFingerprint(BASE));
  });

  it('ignora props extras fora do conjunto §1.3.1', () => {
    const withTransport = {
      ...BASE,
      ...FIX.transport_retry,
    } as EvidenceSemanticFingerprintFields & Record<string, unknown>;
    expect(computeSemanticFingerprint(withTransport)).toBe(computeSemanticFingerprint(BASE));
  });
});

describe('classifyIdempotency', () => {
  it('sem evento prévio → novo', () => {
    expect(classifyIdempotency({ existing: null, incoming: BASE })).toBe('novo');
  });

  it('mesmo attempt_id + fingerprint igual → duplicado_equivalente (retry)', () => {
    expect(
      classifyIdempotency({
        existing: { ...BASE },
        incoming: { ...BASE },
      }),
    ).toBe('duplicado_equivalente');
  });

  it('mesmo attempt_id + fingerprint ≠ → conflito (conviction)', () => {
    expect(
      classifyIdempotency({
        existing: BASE,
        incoming: { ...BASE, ...FIX.conflict_conviction },
      }),
    ).toBe('conflito');
  });

  it('divergência em correct / question_version / context gera conflito', () => {
    expect(
      classifyIdempotency({
        existing: BASE,
        incoming: { ...BASE, correct: false },
      }),
    ).toBe('conflito');
    expect(
      classifyIdempotency({
        existing: BASE,
        incoming: { ...BASE, question_version: 'b'.repeat(64) },
      }),
    ).toBe('conflito');
    expect(
      classifyIdempotency({
        existing: BASE,
        incoming: { ...BASE, context: 'simulation' },
      }),
    ).toBe('conflito');
  });

  it('attempts distintos: cada um classifica independentemente (não confunde)', () => {
    const attemptA = BASE;
    const attemptB = { ...BASE, ...FIX.distinct_attempt };
    expect(classifyIdempotency({ existing: null, incoming: attemptA })).toBe('novo');
    expect(classifyIdempotency({ existing: null, incoming: attemptB })).toBe('novo');
    expect(
      classifyIdempotency({ existing: attemptA, incoming: attemptB }),
    ).toBe('conflito');
  });

  it('timestamps / transporte fora do fingerprint não geram conflito (fixture)', () => {
    // Caller só passa o conjunto semântico §1.3.1; transporte diverge no envelope
    // mas o fingerprint permanece idêntico → duplicado_equivalente.
    const existingSemantic = BASE;
    const retrySemantic = { ...BASE };
    expect(FIX.transport_retry.started_at).not.toBe(
      FIX.transport_retry_divergent.started_at,
    );
    expect(FIX.transport_retry.session_id).not.toBe(
      FIX.transport_retry_divergent.session_id,
    );
    expect(
      classifyIdempotency({ existing: existingSemantic, incoming: retrySemantic }),
    ).toBe('duplicado_equivalente');
    expect(semanticFingerprintsEqual(existingSemantic, retrySemantic)).toBe(true);
  });

  it('não resolve nem sobrescreve conflito (só classifica)', () => {
    const result = classifyIdempotency({
      existing: BASE,
      incoming: { ...BASE, answer_change_count: 99 },
    });
    expect(result).toBe('conflito');
    expect(BASE.answer_change_count).toBe(1);
  });
});
