/**
 * Contrato de escrita unificado — normalize → Zod → premiumGate → lint golden-v1 (se declarado).
 * Usado pelo Laboratório, APIs admin e alinhado ao gate do catalog:apply-lote.
 *
 * meta.content_standard "golden-v1" nos examples/ permanece referência de conteúdo;
 * QUESTAO_WRITE_SPEC_VERSION governa o pipeline de escrita.
 *
 * @see docs/GOLDEN_CONTENT_STANDARD.md §11
 */
import {
  auditPremiumQuestao,
  type PremiumGateIssue,
} from '@/lib/catalogMigration/premiumGate';
import {
  lintGoldenContent,
  type GoldenContentLintIssue,
} from '@/lib/goldenContentStandard';
import { normalizeQuestaoSlideArrays } from '@/lib/reverseStudySlidesNormalize';
import {
  QuestaoCompletaSchema,
  payloadContainsTecconcursosReference,
  TECONCURSOS_PAYLOAD_BLOCKED_MESSAGE,
} from '@/lib/validations';
import type { z } from 'zod';

import { QUESTAO_WRITE_SPEC_VERSION } from './specVersion';

export type ValidatedQuestao = z.infer<typeof QuestaoCompletaSchema>;

export type QuestaoWriteIssueLayer =
  | 'tecconcursos'
  | 'zod'
  | 'premium_gate'
  | 'golden_v1';

export type QuestaoWriteIssue = {
  code: string;
  message: string;
  path?: string;
  severity: 'error' | 'warn';
  layer: QuestaoWriteIssueLayer;
};

export type ValidateQuestaoForWriteOptions = {
  moduloSlug?: string;
  /** Bloqueia stubs e contrato de molde bespoke (default: true). */
  premiumGate?: boolean;
  /** Lint golden-v1 quando meta.content_standard declarado (default: true). */
  goldenLint?: boolean;
};

export type ValidateQuestaoForWriteSuccess = {
  ok: true;
  data: ValidatedQuestao;
  warnings: QuestaoWriteIssue[];
  specVersion: typeof QUESTAO_WRITE_SPEC_VERSION;
};

export type ValidateQuestaoForWriteFailure = {
  ok: false;
  errors: QuestaoWriteIssue[];
  warnings: QuestaoWriteIssue[];
  specVersion: typeof QUESTAO_WRITE_SPEC_VERSION;
};

export type ValidateQuestaoForWriteResult =
  | ValidateQuestaoForWriteSuccess
  | ValidateQuestaoForWriteFailure;

function mapPremiumGateIssue(issue: PremiumGateIssue): QuestaoWriteIssue {
  return {
    code: issue.code,
    message: issue.message,
    path: issue.slideType ? `reverse_study_slides.${issue.slideType}` : undefined,
    severity: issue.severity,
    layer: 'premium_gate',
  };
}

function mapGoldenLintIssue(issue: GoldenContentLintIssue): QuestaoWriteIssue {
  return {
    code: issue.code,
    message: issue.message,
    path: issue.path,
    severity: 'warn',
    layer: 'golden_v1',
  };
}

/** Resumo curto para CLI / apply-lote load failures. */
export function formatQuestaoWriteErrors(errors: QuestaoWriteIssue[]): string {
  return errors
    .slice(0, 5)
    .map((e) => `[${e.layer}] ${e.code}: ${e.message}`)
    .join('; ');
}

export function validateQuestaoForWrite(
  raw: unknown,
  options: ValidateQuestaoForWriteOptions = {},
): ValidateQuestaoForWriteResult {
  const premiumGate = options.premiumGate !== false;
  const goldenLint = options.goldenLint !== false;
  const warnings: QuestaoWriteIssue[] = [];
  const errors: QuestaoWriteIssue[] = [];

  if (payloadContainsTecconcursosReference(raw)) {
    errors.push({
      code: 'tecconcursos',
      message: TECONCURSOS_PAYLOAD_BLOCKED_MESSAGE,
      severity: 'error',
      layer: 'tecconcursos',
    });
    return { ok: false, errors, warnings, specVersion: QUESTAO_WRITE_SPEC_VERSION };
  }

  const normalized = normalizeQuestaoSlideArrays(
    typeof raw === 'object' && raw !== null ? { ...(raw as object) } : raw,
  );
  const parsed = QuestaoCompletaSchema.safeParse(normalized);
  if (!parsed.success) {
    for (const issue of parsed.error.issues.slice(0, 10)) {
      errors.push({
        code: issue.code,
        message: `${issue.path.join('.')}: ${issue.message}`,
        path: issue.path.join('.'),
        severity: 'error',
        layer: 'zod',
      });
    }
    return { ok: false, errors, warnings, specVersion: QUESTAO_WRITE_SPEC_VERSION };
  }

  const data = { ...parsed.data };
  if (!data.meta.subtopico) data.meta.subtopico = data.meta.topico || 'Geral';

  if (premiumGate) {
    for (const issue of auditPremiumQuestao(data)) {
      const mapped = mapPremiumGateIssue(issue);
      if (mapped.severity === 'error') errors.push(mapped);
      else warnings.push(mapped);
    }
  }

  if (goldenLint) {
    for (const issue of lintGoldenContent(data)) {
      warnings.push(mapGoldenLintIssue(issue));
    }
  }

  if (errors.length > 0) {
    return { ok: false, errors, warnings, specVersion: QUESTAO_WRITE_SPEC_VERSION };
  }

  const payload = options.moduloSlug
    ? ({ ...data, modulo_slug: options.moduloSlug } as ValidatedQuestao & { modulo_slug: string })
    : data;

  return {
    ok: true,
    data: payload as ValidatedQuestao,
    warnings,
    specVersion: QUESTAO_WRITE_SPEC_VERSION,
  };
}
