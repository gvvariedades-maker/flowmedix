/**
 * Prova de equivalência bruto → normalizado para freeze EVIDENCE_GOVERNED_APPROVAL_V2.
 * @see docs/P0_PEDAGOGICAL_REVIEW_CONVERSA.md § Candidate freeze
 */
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

import { stripCommercialApprovalBinding } from '@/lib/catalogMigration/commercialApprovalWriteBoundary';
import { computeCandidateSha256 } from '@/lib/catalogMigration/evidenceGovernedApproval';
import { validateAndNormalizeQuestao } from '@/lib/catalogMigration/validatePayload';
import { normalizeQuestaoSlideArrays } from '@/lib/reverseStudySlidesNormalize';

export type NormalizationDiffCategory =
  | 'NON_SEMANTIC_OR_PIPELINE_NORMALIZATION'
  | 'SEMANTIC_CHANGE';

export type NormalizationDiffEntry = {
  path: string;
  category: NormalizationDiffCategory;
  reason: string;
  raw_preview?: string;
  normalized_preview?: string;
};

export type NormalizationProofResult = {
  slug: string;
  candidate_file_sha256: string;
  candidate_sha256: string;
  candidate_sha256_matches_apply_gate: boolean;
  semantic_change_count: number;
  non_semantic_change_count: number;
  equivalent_for_evidence_rebind: boolean;
  differences: NormalizationDiffEntry[];
};

function sha256Bytes(buffer: Buffer): string {
  return createHash('sha256').update(buffer).digest('hex');
}

function preview(value: unknown): string {
  const text = typeof value === 'string' ? value : JSON.stringify(value);
  if (text.length <= 160) return text;
  return `${text.slice(0, 157)}...`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function slideType(slide: Record<string, unknown>): string {
  return typeof slide.type === 'string' ? slide.type : 'unknown';
}

function semanticSlideFingerprint(slide: Record<string, unknown>): string {
  const type = slideType(slide);
  const payload: Record<string, unknown> = { type };
  if (type === 'concept_map' && Array.isArray(slide.items)) {
    payload.items = slide.items;
  } else if (type === 'logic_flow' && Array.isArray(slide.steps)) {
    payload.steps = slide.steps;
    if (slide.reveal_mode) payload.reveal_mode = slide.reveal_mode;
  } else if (type === 'golden_rule') {
    if (slide.content) payload.content = slide.content;
    if (slide.rows) payload.rows = slide.rows;
    if (slide.footer_rule) payload.footer_rule = slide.footer_rule;
  } else if (type === 'danger_zone') {
    payload.content = slide.content;
    if (slide.items) payload.items = slide.items;
    if (slide.bullet_style) payload.bullet_style = slide.bullet_style;
    if (slide.footer_rule) payload.footer_rule = slide.footer_rule;
  }
  if (slide.meta) payload.meta = slide.meta;
  if (slide.chip_label) payload.chip_label = slide.chip_label;
  if (slide.slide_title) payload.slide_title = slide.slide_title;
  return JSON.stringify(payload);
}

function extractSlides(obj: Record<string, unknown>): Record<string, unknown>[] {
  const slides = obj.reverse_study_slides ?? obj.study_slides;
  return Array.isArray(slides) ? slides.filter(isRecord) : [];
}

function compareOptions(
  raw: Record<string, unknown>,
  normalized: Record<string, unknown>,
  differences: NormalizationDiffEntry[],
) {
  const rawQd = isRecord(raw.question_data) ? raw.question_data : {};
  const normQd = isRecord(normalized.question_data) ? normalized.question_data : {};
  const rawOpts = Array.isArray(rawQd.options) ? rawQd.options : [];
  const normOpts = Array.isArray(normQd.options) ? normQd.options : [];

  if (rawOpts.length !== normOpts.length) {
    differences.push({
      path: 'question_data.options.length',
      category: 'SEMANTIC_CHANGE',
      reason: 'Número de alternativas alterado',
      raw_preview: String(rawOpts.length),
      normalized_preview: String(normOpts.length),
    });
    return;
  }

  for (let i = 0; i < rawOpts.length; i++) {
    const ro = isRecord(rawOpts[i]) ? rawOpts[i] : {};
    const no = isRecord(normOpts[i]) ? normOpts[i] : {};
    for (const key of ['id', 'text', 'is_correct'] as const) {
      if (JSON.stringify(ro[key]) !== JSON.stringify(no[key])) {
        differences.push({
          path: `question_data.options[${i}].${key}`,
          category: 'SEMANTIC_CHANGE',
          reason: 'Alternativa alterada',
          raw_preview: preview(ro[key]),
          normalized_preview: preview(no[key]),
        });
      }
    }
  }
}

function compareSemanticDomains(
  raw: Record<string, unknown>,
  normalized: Record<string, unknown>,
): NormalizationDiffEntry[] {
  const differences: NormalizationDiffEntry[] = [];

  const rawQd = isRecord(raw.question_data) ? raw.question_data : {};
  const normQd = isRecord(normalized.question_data) ? normalized.question_data : {};

  if (JSON.stringify(rawQd.instruction) !== JSON.stringify(normQd.instruction)) {
    differences.push({
      path: 'question_data.instruction',
      category: 'SEMANTIC_CHANGE',
      reason: 'Enunciado alterado',
      raw_preview: preview(rawQd.instruction),
      normalized_preview: preview(normQd.instruction),
    });
  }

  if (JSON.stringify(rawQd.text_fragment) !== JSON.stringify(normQd.text_fragment)) {
    differences.push({
      path: 'question_data.text_fragment',
      category: 'SEMANTIC_CHANGE',
      reason: 'text_fragment alterado',
      raw_preview: preview(rawQd.text_fragment),
      normalized_preview: preview(normQd.text_fragment),
    });
  }

  if (JSON.stringify(rawQd.figures) !== JSON.stringify(normQd.figures)) {
    differences.push({
      path: 'question_data.figures',
      category: 'SEMANTIC_CHANGE',
      reason: 'Figuras alteradas',
      raw_preview: preview(rawQd.figures),
      normalized_preview: preview(normQd.figures),
    });
  }

  compareOptions(raw, normalized, differences);

  const rawMeta = isRecord(raw.meta) ? raw.meta : {};
  const normMeta = isRecord(normalized.meta) ? normalized.meta : {};
  const contentReviewKeys = ['reviewed_at', 'reviewer', 'guideline_snapshot', 'exam_vs_current'] as const;
  const rawCr = isRecord(rawMeta.content_review) ? rawMeta.content_review : {};
  const normCr = isRecord(normMeta.content_review) ? normMeta.content_review : {};
  for (const key of contentReviewKeys) {
    if (JSON.stringify(rawCr[key]) !== JSON.stringify(normCr[key])) {
      differences.push({
        path: `meta.content_review.${key}`,
        category: 'SEMANTIC_CHANGE',
        reason: `content_review.${key} alterado`,
        raw_preview: preview(rawCr[key]),
        normalized_preview: preview(normCr[key]),
      });
    }
  }
  for (const key of Object.keys(rawCr)) {
    if (!contentReviewKeys.includes(key as (typeof contentReviewKeys)[number])) {
      differences.push({
        path: `meta.content_review.${key}`,
        category: 'NON_SEMANTIC_OR_PIPELINE_NORMALIZATION',
        reason: 'Campo editorial interno removido pelo schema (não pertence ao write contract)',
        raw_preview: preview(rawCr[key]),
      });
    }
  }

  const metaKeys = [
    'banca',
    'topico',
    'subtopico',
    'ano',
    'orgao',
    'prova',
    'family',
    'content_standard',
    'sources',
    'pedagogical_branch',
    'header_line',
  ] as const;

  for (const key of metaKeys) {
    if (JSON.stringify(rawMeta[key]) !== JSON.stringify(normMeta[key])) {
      const path = `meta.${key}`;
      const category =
        key === 'subtopico' &&
        !rawMeta.subtopico &&
        normMeta.subtopico === (normMeta.topico || 'Geral')
          ? 'NON_SEMANTIC_OR_PIPELINE_NORMALIZATION'
          : 'SEMANTIC_CHANGE';
      differences.push({
        path,
        category,
        reason:
          category === 'NON_SEMANTIC_OR_PIPELINE_NORMALIZATION'
            ? 'Default estrutural de subtopico preenchido pelo validator'
            : `meta.${key} alterado`,
        raw_preview: preview(rawMeta[key]),
        normalized_preview: preview(normMeta[key]),
      });
    }
  }

  for (const key of Object.keys(rawMeta)) {
    if (
      key !== 'content_review' &&
      !metaKeys.includes(key as (typeof metaKeys)[number]) &&
      !(key in normMeta)
    ) {
      differences.push({
        path: `meta.${key}`,
        category: 'NON_SEMANTIC_OR_PIPELINE_NORMALIZATION',
        reason: 'Campo meta removido pelo schema (não pertence ao write contract)',
        raw_preview: preview(rawMeta[key]),
      });
    }
  }

  const rawSlides = extractSlides(raw);
  const normSlides = extractSlides(normalized);
  const rawFingerprints = rawSlides.map(semanticSlideFingerprint);
  const normFingerprints = normSlides.map(semanticSlideFingerprint);

  const rawSorted = [...rawFingerprints].sort();
  const normSorted = [...normFingerprints].sort();

  if (JSON.stringify(rawSorted) !== JSON.stringify(normSorted)) {
    differences.push({
      path: 'reverse_study_slides',
      category: 'SEMANTIC_CHANGE',
      reason: 'Conteúdo semântico dos NeuroSlides alterado após normalização',
      raw_preview: preview(rawSorted),
      normalized_preview: preview(normSorted),
    });
  } else if (JSON.stringify(rawFingerprints) !== JSON.stringify(normFingerprints)) {
    differences.push({
      path: 'reverse_study_slides',
      category: 'NON_SEMANTIC_OR_PIPELINE_NORMALIZATION',
      reason: 'Ordem canônica de slides (conteúdo equivalente)',
    });
  }

  const flattenedRaw = normalizeQuestaoSlideArrays(
    isRecord(raw) ? { ...raw } : raw,
  ) as Record<string, unknown>;
  const flatSlides = extractSlides(flattenedRaw);
  const flatSorted = flatSlides.map(semanticSlideFingerprint).sort();
  if (
    differences.some((d) => d.path === 'reverse_study_slides' && d.category === 'SEMANTIC_CHANGE') &&
    JSON.stringify(flatSorted) === JSON.stringify(normSorted)
  ) {
    for (const d of differences) {
      if (d.path === 'reverse_study_slides') {
        d.category = 'NON_SEMANTIC_OR_PIPELINE_NORMALIZATION';
        d.reason = 'Wrappers achatados e/ou ordem canônica de slides (conteúdo equivalente)';
      }
    }
  }

  return differences;
}

export function buildApplyGateCandidate(
  slug: string,
  raw: unknown,
): { ok: true; data: Record<string, unknown> } | { ok: false; reason: string } {
  const validated = validateAndNormalizeQuestao(slug, raw, { mandatoryEditorialGate: false });
  if (!validated.ok) return validated;
  const stripped = stripCommercialApprovalBinding(validated.data);
  return { ok: true, data: stripped as Record<string, unknown> };
}

export function proveCandidateNormalization(input: {
  slug: string;
  raw: unknown;
  rawFileBytes?: Buffer;
}): NormalizationProofResult {
  const validated = validateAndNormalizeQuestao(input.slug, input.raw, {
    mandatoryEditorialGate: false,
  });
  if (!validated.ok) {
    throw new Error(`validateAndNormalizeQuestao falhou: ${validated.reason}`);
  }

  const normalizedOnly = validated.data as Record<string, unknown>;
  const applyGate = stripCommercialApprovalBinding(validated.data) as Record<string, unknown>;
  const candidateSha = computeCandidateSha256(applyGate);
  const normalizedSha = computeCandidateSha256(normalizedOnly);

  const differences = compareSemanticDomains(
    input.raw as Record<string, unknown>,
    normalizedOnly,
  );

  if (candidateSha !== normalizedSha) {
    differences.push({
      path: 'apply_gate_candidate',
      category: 'NON_SEMANTIC_OR_PIPELINE_NORMALIZATION',
      reason:
        'stripCommercialApprovalBinding altera hash; apply gate usa payload após strip',
      raw_preview: normalizedSha,
      normalized_preview: candidateSha,
    });
  }

  const semantic_change_count = differences.filter((d) => d.category === 'SEMANTIC_CHANGE').length;
  const non_semantic_change_count = differences.filter(
    (d) => d.category === 'NON_SEMANTIC_OR_PIPELINE_NORMALIZATION',
  ).length;

  const candidate_file_sha256 = input.rawFileBytes
    ? sha256Bytes(input.rawFileBytes)
    : sha256Bytes(Buffer.from(JSON.stringify(input.raw), 'utf8'));

  return {
    slug: input.slug,
    candidate_file_sha256,
    candidate_sha256: candidateSha,
    candidate_sha256_matches_apply_gate: candidateSha === normalizedSha,
    semantic_change_count,
    non_semantic_change_count,
    equivalent_for_evidence_rebind: semantic_change_count === 0,
    differences,
  };
}

export function proveCandidateNormalizationFromFile(input: {
  slug: string;
  rawFilePath: string;
}): NormalizationProofResult & { raw_file_path: string } {
  const bytes = readFileSync(input.rawFilePath);
  const raw = JSON.parse(bytes.toString('utf8'));
  const proof = proveCandidateNormalization({
    slug: input.slug,
    raw,
    rawFileBytes: bytes,
  });
  return { ...proof, raw_file_path: input.rawFilePath };
}
