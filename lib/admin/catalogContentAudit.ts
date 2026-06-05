import type { SupabaseClient } from '@supabase/supabase-js';
import {
  QuestaoCompletaSchema,
  payloadContainsTecconcursosReference,
} from '@/lib/validations';
import { normalizeQuestaoSlideArrays } from '@/lib/reverseStudySlidesNormalize';

/** Pacote padrão NeuroSlides (4 tipos principais). */
export const PREMIUM_SLIDE_TYPES = [
  'concept_map',
  'golden_rule',
  'logic_flow',
  'danger_zone',
] as const;

export type PremiumSlideType = (typeof PREMIUM_SLIDE_TYPES)[number];

export type CatalogSlideIssueCode =
  | 'missing_slides'
  | 'slide_count_not_four'
  | 'missing_premium_type'
  | 'zod_invalid'
  | 'tecconcursos_reference';

export type CatalogSlideIssueRow = {
  modulo_slug: string;
  titulo_aula: string | null;
  banca: string | null;
  slide_count: number;
  slide_types: string[];
  issues: CatalogSlideIssueCode[];
  zod_message?: string;
};

export type CatalogPremiumLayoutHints = {
  logic_flow_tap: boolean;
  danger_zone_compare: boolean;
  golden_rule_reference_table: boolean;
};

export type CatalogSampleValidationRow = {
  modulo_slug: string;
  valid: boolean;
  slide_count: number;
  slide_types: string[];
  premium_layouts: CatalogPremiumLayoutHints;
  issues: string[];
};

export type CatalogContentAuditReport = {
  generated_at: string;
  catalog_total: number;
  scanned_rows: number;
  summary: {
    missing_slides: number;
    slide_count_not_four: number;
    missing_premium_type: number;
    zod_invalid: number;
    tecconcursos_reference: number;
    fully_premium_package: number;
  };
  /** Até `issueListLimit` linhas com pelo menos um problema (ordenado por slug). */
  issue_rows: CatalogSlideIssueRow[];
  sample_size: number;
  sample_validation: CatalogSampleValidationRow[];
  notes: string[];
};

const PAGE_SIZE = 500;
const DEFAULT_ISSUE_LIST_LIMIT = 200;
const DEFAULT_SAMPLE_SIZE = 20;

type ModuloRow = {
  modulo_slug: string;
  titulo_aula: string | null;
  banca: string | null;
  conteudo_json: unknown;
};

function slideArrayFromPayload(raw: unknown): unknown[] {
  if (!raw || typeof raw !== 'object') return [];
  const o = raw as Record<string, unknown>;
  const reverse = o.reverse_study_slides;
  if (Array.isArray(reverse) && reverse.length > 0) return reverse;
  const study = o.study_slides;
  if (Array.isArray(study)) return study;
  return [];
}

function slideTypes(slides: unknown[]): string[] {
  return slides
    .map((s) =>
      s && typeof s === 'object' && 'type' in s ? String((s as { type: unknown }).type) : 'unknown',
    )
    .filter(Boolean);
}

function missingPremiumTypes(types: string[]): PremiumSlideType[] {
  const set = new Set(types);
  return PREMIUM_SLIDE_TYPES.filter((t) => !set.has(t));
}

function analyzeRow(row: ModuloRow): CatalogSlideIssueRow | null {
  const slides = slideArrayFromPayload(row.conteudo_json);
  const types = slideTypes(slides);
  const issues: CatalogSlideIssueCode[] = [];

  if (slides.length === 0) {
    issues.push('missing_slides');
  } else if (slides.length !== 4) {
    issues.push('slide_count_not_four');
  }

  const missingTypes = missingPremiumTypes(types);
  if (slides.length > 0 && missingTypes.length > 0) {
    issues.push('missing_premium_type');
  }

  if (payloadContainsTecconcursosReference(row.conteudo_json)) {
    issues.push('tecconcursos_reference');
  }

  let zod_message: string | undefined;
  const parsed = QuestaoCompletaSchema.safeParse(row.conteudo_json);
  if (!parsed.success) {
    issues.push('zod_invalid');
    zod_message = parsed.error.issues[0]?.message ?? 'Validação Zod falhou';
  }

  if (issues.length === 0) return null;

  return {
    modulo_slug: row.modulo_slug,
    titulo_aula: row.titulo_aula,
    banca: row.banca,
    slide_count: slides.length,
    slide_types: types,
    issues,
    zod_message,
  };
}

function premiumLayoutHints(slides: unknown[]): CatalogPremiumLayoutHints {
  const hints: CatalogPremiumLayoutHints = {
    logic_flow_tap: false,
    danger_zone_compare: false,
    golden_rule_reference_table: false,
  };

  for (const slide of slides) {
    if (!slide || typeof slide !== 'object') continue;
    const s = slide as Record<string, unknown>;
    if (s.type === 'logic_flow' && s.reveal_mode === 'tap') {
      hints.logic_flow_tap = true;
    }
    if (s.type === 'golden_rule' && Array.isArray(s.rows) && s.rows.length > 0) {
      hints.golden_rule_reference_table = true;
    }
    if (s.type === 'danger_zone' && Array.isArray(s.items)) {
      const hasCompare = (s.items as unknown[]).some(
        (it) =>
          it &&
          typeof it === 'object' &&
          typeof (it as { correct?: unknown }).correct === 'string' &&
          (it as { correct: string }).correct.trim().length > 0,
      );
      if (hasCompare) hints.danger_zone_compare = true;
    }
  }

  return hints;
}

function validateSampleRow(row: ModuloRow): CatalogSampleValidationRow {
  const normalized = normalizeQuestaoSlideArrays(row.conteudo_json);
  const slides = slideArrayFromPayload(normalized);
  const types = slideTypes(slides);
  const issues: string[] = [];

  if (slides.length === 0) issues.push('Sem reverse_study_slides');
  if (slides.length !== 4) issues.push(`slide_count=${slides.length} (esperado 4)`);

  const missingTypes = missingPremiumTypes(types);
  if (missingTypes.length > 0) {
    issues.push(`Tipos ausentes: ${missingTypes.join(', ')}`);
  }

  const parsed = QuestaoCompletaSchema.safeParse(normalized);
  if (!parsed.success) {
    issues.push(parsed.error.issues.map((i) => i.message).join('; '));
  }

  return {
    modulo_slug: row.modulo_slug,
    valid: parsed.success && issues.length === 0,
    slide_count: slides.length,
    slide_types: types,
    premium_layouts: premiumLayoutHints(slides),
    issues,
  };
}

/** Amostra determinística: ordena por slug e pega índices espaçados. */
export function pickCatalogSampleRows<T extends { modulo_slug: string }>(
  rows: T[],
  sampleSize: number,
): T[] {
  if (rows.length <= sampleSize) return [...rows];
  const sorted = [...rows].sort((a, b) => a.modulo_slug.localeCompare(b.modulo_slug));
  const out: T[] = [];
  const step = sorted.length / sampleSize;
  for (let i = 0; i < sampleSize; i += 1) {
    const idx = Math.min(sorted.length - 1, Math.floor(i * step));
    const row = sorted[idx];
    if (row && !out.some((r) => r.modulo_slug === row.modulo_slug)) {
      out.push(row);
    }
  }
  while (out.length < sampleSize && out.length < sorted.length) {
    const next = sorted[out.length];
    if (next && !out.some((r) => r.modulo_slug === next.modulo_slug)) out.push(next);
    else break;
  }
  return out;
}

export type RunCatalogContentAuditOptions = {
  issueListLimit?: number;
  sampleSize?: number;
  /** Limite de linhas lidas do banco (0 = sem limite). */
  maxRows?: number;
};

/**
 * Varre `modulos_estudo` e produz relatório para o Laboratório (Fase 8 — conteúdo).
 */
export async function runCatalogContentAudit(
  supabase: SupabaseClient,
  options: RunCatalogContentAuditOptions = {},
): Promise<CatalogContentAuditReport> {
  const issueListLimit = options.issueListLimit ?? DEFAULT_ISSUE_LIST_LIMIT;
  const sampleSize = options.sampleSize ?? DEFAULT_SAMPLE_SIZE;
  const maxRows = options.maxRows ?? 0;

  const { count: totalCount, error: countError } = await supabase
    .from('modulos_estudo')
    .select('id', { count: 'exact', head: true });

  if (countError) {
    throw new Error(`Falha ao contar catálogo: ${countError.message}`);
  }

  const catalog_total = totalCount ?? 0;
  const allRows: ModuloRow[] = [];
  let offset = 0;

  while (true) {
    if (maxRows > 0 && allRows.length >= maxRows) break;

    const rangeEnd = offset + PAGE_SIZE - 1;
    const { data, error } = await supabase
      .from('modulos_estudo')
      .select('modulo_slug, titulo_aula, banca, conteudo_json')
      .order('modulo_slug', { ascending: true })
      .range(offset, rangeEnd);

    if (error) {
      throw new Error(`Falha ao ler modulos_estudo: ${error.message}`);
    }

    const batch = (data ?? []) as ModuloRow[];
    if (batch.length === 0) break;

    allRows.push(...batch);
    offset += PAGE_SIZE;

    if (batch.length < PAGE_SIZE) break;
    if (maxRows > 0 && allRows.length >= maxRows) {
      allRows.splice(maxRows);
      break;
    }
  }

  const issue_rows: CatalogSlideIssueRow[] = [];
  const summary = {
    missing_slides: 0,
    slide_count_not_four: 0,
    missing_premium_type: 0,
    zod_invalid: 0,
    tecconcursos_reference: 0,
    fully_premium_package: 0,
  };

  for (const row of allRows) {
    const slides = slideArrayFromPayload(row.conteudo_json);
    const types = slideTypes(slides);
    if (
      slides.length === 4 &&
      missingPremiumTypes(types).length === 0 &&
      QuestaoCompletaSchema.safeParse(row.conteudo_json).success &&
      !payloadContainsTecconcursosReference(row.conteudo_json)
    ) {
      summary.fully_premium_package += 1;
    }

    const analyzed = analyzeRow(row);
    if (!analyzed) continue;

    if (analyzed.issues.includes('missing_slides')) summary.missing_slides += 1;
    if (analyzed.issues.includes('slide_count_not_four')) summary.slide_count_not_four += 1;
    if (analyzed.issues.includes('missing_premium_type')) summary.missing_premium_type += 1;
    if (analyzed.issues.includes('zod_invalid')) summary.zod_invalid += 1;
    if (analyzed.issues.includes('tecconcursos_reference')) summary.tecconcursos_reference += 1;

    if (issue_rows.length < issueListLimit) {
      issue_rows.push(analyzed);
    }
  }

  const sampleRows = pickCatalogSampleRows(allRows, sampleSize);
  const sample_validation = sampleRows.map(validateSampleRow);

  const notes: string[] = [
    'Contagens de issue podem sobrepor (uma questão pode ter vários códigos).',
    `Amostra de ${sampleSize} slugs: validação QuestaoCompletaSchema + layouts premium (tap / compare / reference_table).`,
  ];
  if (maxRows > 0 && allRows.length < catalog_total) {
    notes.push(`Varredura parcial: ${allRows.length} de ${catalog_total} linhas (maxRows=${maxRows}).`);
  }

  return {
    generated_at: new Date().toISOString(),
    catalog_total,
    scanned_rows: allRows.length,
    summary,
    issue_rows,
    sample_size: sampleSize,
    sample_validation,
    notes,
  };
}
