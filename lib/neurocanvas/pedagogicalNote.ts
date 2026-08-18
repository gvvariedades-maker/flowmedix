/**
 * Nota pedagógica — mede **ensino**, ao lado de `gradeSlideReadiness`, nunca dentro.
 *
 * `gradeSlideReadiness` ([readiness.ts](./readiness.ts)) é um grader **estrutural**: conta
 * campos (3 items = A, 4 passos + tap = A). `GenericReadinessRow`, o resolver audit e a
 * coorte de `phaseReadiness.ts` dependem dessa semântica — por isso ela fica intacta e a
 * nota pedagógica vive neste módulo separado, com vocabulário próprio
 * (`pass`/`warn`/`fail`, não `A`/`B`/`C`).
 *
 * Duas fontes de sinal:
 * - F2a — `detectUnifiedPedagogy` (assinaturas determinísticas por regex);
 * - F2b — portão do leitor cego (`blindReaderGate.ts`), que pega spoiler parafraseado.
 *
 * @see lib/catalogMigration/unifiedPedagogyDetector.ts
 * @see lib/neurocanvas/blindReaderGate.ts
 */

import {
  emptySignatureCounts,
  tallySignatures,
  type PedagogySignatureCode,
  type PedagogySignatureCounts,
  type UnifiedPedagogyFinding,
} from '@/lib/catalogMigration/unifiedPedagogyDetector';
import type { BlindReaderResult } from '@/lib/neurocanvas/blindReaderGate';

/** Escala própria — não reaproveita `ReadinessGrade` para não confundir os dois eixos. */
export type PedagogicalNoteGrade = 'pass' | 'warn' | 'fail';

/** Assinaturas que reprovam: entregam o gabarito antes do raciocínio ou ensinam errado. */
export const BLOCKING_PEDAGOGY_SIGNATURES: readonly PedagogySignatureCode[] = [
  'pedagogy_letter_spoiler',
  'pedagogy_vf_verdict_spoiler',
  'pedagogy_polarity_risk',
  'pedagogy_logic_missing_gabarito',
] as const;

/** Assinaturas que degradam sem reprovar: custam atenção do aluno, não corretude. */
export const WARNING_PEDAGOGY_SIGNATURES: readonly PedagogySignatureCode[] = [
  'pedagogy_question_bound_label',
  'pedagogy_logic_padding',
  'pedagogy_danger_orphan',
  'pedagogy_density',
] as const;

const BLOCKING_PENALTY = 25;
const WARNING_PENALTY = 6;
const BLIND_READER_LEAK_PENALTY = 40;
const BLIND_READER_WARN_PENALTY = 10;

export type PedagogicalNote = {
  slug: string;
  grade: PedagogicalNoteGrade;
  /** 0–100. Só orienta priorização de fila; o gate é o `grade`. */
  score: number;
  signature_counts: PedagogySignatureCounts;
  blocking_codes: PedagogySignatureCode[];
  blind_reader?: {
    verdict: BlindReaderResult['verdict'];
    gabarito: BlindReaderResult['gabarito'];
    evidence_literal: boolean;
  };
  /** Motivos legíveis, com caminho JSON quando existe — insumo do repair de F3. */
  reasons: string[];
};

export function gradePedagogicalNote(input: {
  slug: string;
  findings: UnifiedPedagogyFinding[];
  blindReader?: BlindReaderResult;
}): PedagogicalNote {
  const { slug, findings, blindReader } = input;

  const counts = tallySignatures(findings, emptySignatureCounts());
  const blockingCodes = BLOCKING_PEDAGOGY_SIGNATURES.filter((code) => counts[code] > 0);
  const warningCodes = WARNING_PEDAGOGY_SIGNATURES.filter((code) => counts[code] > 0);

  const reasons: string[] = [];
  let score = 100;

  for (const code of blockingCodes) {
    score -= BLOCKING_PENALTY * counts[code];
    const first = findings.find((f) => f.code === code);
    reasons.push(`[fail] ${code}${first?.path ? ` @ ${first.path}` : ''}: ${first?.message ?? ''}`.trim());
  }
  for (const code of warningCodes) {
    score -= WARNING_PENALTY * counts[code];
    const first = findings.find((f) => f.code === code);
    reasons.push(`[warn] ${code}${first?.path ? ` @ ${first.path}` : ''}: ${first?.message ?? ''}`.trim());
  }

  let blindReaderFails = false;
  if (blindReader?.verdict === 'fail_leak') {
    blindReaderFails = true;
    score -= BLIND_READER_LEAK_PENALTY;
    reasons.push(
      `[fail] blind_reader: leitor cego respondeu ${blindReader.gabarito} citando o próprio concept_map — ` +
        `"${blindReader.evidencia}"`,
    );
  } else if (blindReader?.verdict === 'warn_unsupported_hit') {
    score -= BLIND_READER_WARN_PENALTY;
    reasons.push(
      `[warn] blind_reader: leitor cego acertou ${blindReader.gabarito} sem citação literal — ` +
        'revisar à mão (pode ser conhecimento próprio, não vazamento).',
    );
  }

  const grade: PedagogicalNoteGrade =
    blindReaderFails || blockingCodes.length > 0
      ? 'fail'
      : warningCodes.length > 0 || blindReader?.verdict === 'warn_unsupported_hit'
        ? 'warn'
        : 'pass';

  return {
    slug,
    grade,
    score: Math.max(0, Math.min(100, score)),
    signature_counts: counts,
    blocking_codes: blockingCodes,
    blind_reader: blindReader
      ? {
          verdict: blindReader.verdict,
          gabarito: blindReader.gabarito,
          evidence_literal: blindReader.evidence_literal,
        }
      : undefined,
    reasons,
  };
}

export type PedagogicalNoteSummary = {
  total: number;
  fail: number;
  warn: number;
  pass: number;
  /** Média do score entre as questões avaliadas — 0 quando não há nenhuma. */
  avg_score: number;
};

export function summarizePedagogicalNotes(notes: PedagogicalNote[]): PedagogicalNoteSummary {
  const total = notes.length;
  const sum = notes.reduce((acc, n) => acc + n.score, 0);
  return {
    total,
    fail: notes.filter((n) => n.grade === 'fail').length,
    warn: notes.filter((n) => n.grade === 'warn').length,
    pass: notes.filter((n) => n.grade === 'pass').length,
    avg_score: total === 0 ? 0 : Math.round((sum / total) * 10) / 10,
  };
}
