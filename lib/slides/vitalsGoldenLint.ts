/**
 * Lint de conteúdo golden-v1 para Verificação de Sinais Vitais.
 * Garante compatibilidade entre rows do golden_rule e o molde vitals-reference-board.
 */

import type { GoldenContentLintIssue } from '@/lib/goldenContentStandard';
import { isSinaisSubtopico } from '@/lib/catalogMigration/upgradePremiumSinais';
import {
  isConclusionRow,
  isSvRowMoldCompatible,
  rowHasMeasuredVital,
  resolveSvKindForRow,
  type SvKind,
} from '@/lib/slides/vitalsSlideUtils';

type GoldenRow = {
  label?: string;
  value?: string;
  sv_kind?: SvKind;
};

type QuestaoLike = {
  meta?: {
    content_standard?: string;
    family?: string;
    subtopico?: string;
  };
  question_data?: {
    instruction?: string;
    options?: { id: string; text: string; is_correct: boolean }[];
  };
  reverse_study_slides?: Array<Record<string, unknown>>;
  study_slides?: Array<Record<string, unknown>>;
};

function slidesOf(q: QuestaoLike): Array<Record<string, unknown>> {
  const s = q.reverse_study_slides ?? q.study_slides;
  return Array.isArray(s) ? s : [];
}

function findSlide(slides: Array<Record<string, unknown>>, type: string) {
  return slides.find((s) => s.type === type);
}

function isCertoErradoQuestion(q: QuestaoLike): boolean {
  if (q.meta?.family === 'certo_errado') return true;
  const opts = q.question_data?.options ?? [];
  return (
    opts.length === 2 &&
    opts.every((o) => /certo|errado/i.test(o.text ?? ''))
  );
}

function isGabaritoRow(row: GoldenRow): boolean {
  const label = row.label ?? '';
  const value = row.value ?? '';
  return isConclusionRow(label, value) || /gabarito/i.test(label);
}

const CE_FORBIDDEN_ROW_PATTERN =
  /taquicardia|bradicardia|acima de \d+|abaixo de \d+/i;

/**
 * Lint SV para questões golden-v1 do subtópico Verificação de Sinais Vitais.
 */
export function lintVitalsGoldenContent(payload: unknown): GoldenContentLintIssue[] {
  const q = payload as QuestaoLike;
  const subtopico = q.meta?.subtopico ?? '';
  if (!isSinaisSubtopico(subtopico)) return [];
  if (q.meta?.content_standard !== 'golden-v1') return [];

  const issues: GoldenContentLintIssue[] = [];
  const golden = findSlide(slidesOf(q), 'golden_rule');
  const rows = golden?.rows;
  if (!Array.isArray(rows) || rows.length === 0) {
    issues.push({
      code: 'sv_golden_rows',
      message: 'Sinais Vitais golden-v1: golden_rule deve ter rows para o molde vitals-reference-board',
      path: 'reverse_study_slides.golden_rule.rows',
    });
    return issues;
  }

  const typedRows = rows as GoldenRow[];
  const hasGabarito = typedRows.some(isGabaritoRow);
  if (!hasGabarito) {
    issues.push({
      code: 'sv_golden_gabarito',
      message:
        'Sinais Vitais golden-v1: golden_rule.rows deve incluir linha de gabarito (label Gabarito/Conclusão ou value com letra/certificado)',
      path: 'reverse_study_slides.golden_rule.rows',
    });
  }

  const isCe = isCertoErradoQuestion(q);
  if (isCe && typedRows.length > 4) {
    issues.push({
      code: 'sv_ce_row_count',
      message: 'Sinais Vitais certo/errado: golden_rule deve ter no máximo 4 rows (técnica + referência + gabarito)',
      path: 'reverse_study_slides.golden_rule.rows',
    });
  }

  const instruction = q.question_data?.instruction ?? '';
  for (let i = 0; i < typedRows.length; i++) {
    const row = typedRows[i];
    const label = String(row.label ?? '');
    const value = String(row.value ?? '');

    if (!isSvRowMoldCompatible(row)) {
      issues.push({
        code: 'sv_row_mold_compat',
        message: `rows[${i}] incompatível com vitals-reference-board (ex.: "Tempo"→temperatura ou "palpação"→PA). Use sv_kind: "meta" ou labels com FC/PA/FR explícitos`,
        path: `reverse_study_slides.golden_rule.rows[${i}]`,
      });
    }

    if (isCe && !isGabaritoRow(row) && row.sv_kind !== 'meta') {
      if (CE_FORBIDDEN_ROW_PATTERN.test(`${label} ${value}`) && !/taquicard|bradicard/i.test(instruction)) {
        issues.push({
          code: 'sv_ce_no_extrema_rows',
          message: `rows[${i}]: certo/errado não deve ter taquicardia/bradicardia na golden_rule — use danger_zone`,
          path: `reverse_study_slides.golden_rule.rows[${i}]`,
        });
      }
    }

    if (!isGabaritoRow(row) && row.sv_kind !== 'meta') {
      const kind = resolveSvKindForRow(row);
      const hasMeasure = rowHasMeasuredVital(label, value);
      const hasFcRange = /60\s*(?:a|–|-)\s*100|batimentos?\s+por\s+min/i.test(`${label} ${value}`);
      if (!hasMeasure && kind === 'other' && !hasFcRange) {
        issues.push({
          code: 'sv_reference_row_shape',
          message: `rows[${i}]: row de referência deve ter valor medido (bpm, mmHg, °C…) ou sv_kind "meta" ou faixa FC explícita`,
          path: `reverse_study_slides.golden_rule.rows[${i}]`,
        });
      }
    }
  }

  return issues;
}
