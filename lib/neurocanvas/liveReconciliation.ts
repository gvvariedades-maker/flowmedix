import { createHash } from 'node:crypto';

import { canonicalJson } from '@/lib/neurocanvas/canonicalJson';
import {
  buildCanonicalCatalog,
  groupQuestionPathsBySlug,
  normalizeQuestionForComparison,
  readQuestionJsonFile,
  walkAllCatalogQuestionPaths,
  type CatalogFileEntry,
  analyzeCatalogFile,
} from '@/lib/neurocanvas/canonicalCatalog';
import { DEDUPE_SCHEMA_VERSION } from '@/lib/neurocanvas/dedupeSchema';
import {
  buildBlockerAnalysisReport,
  type BlockerDetail,
  type BlockerSeverity,
} from '@/lib/neurocanvas/blockerAnalysis';
import {
  getDocumentedPathsForSlug,
  buildSlugAuthorityIndex,
} from '@/lib/neurocanvas/slugAuthority';

export type LiveMatchClass =
  | 'live_exactly_one_candidate'
  | 'live_matches_multiple_identical_candidates'
  | 'live_matches_no_candidate'
  | 'slug_missing_live'
  | 'live_invalid_incomparable'
  | 'live_multiple_records';

export type OperationalStatus = 'matched' | 'missing' | 'ambiguous' | 'incomparable';
export type EditorialStatus = 'documented' | 'unresolved' | 'official_review_required';

export type SectionHashes = {
  meta_pedagogica: string | null;
  question_data: string | null;
  alternativas_gabarito: string | null;
  reverse_study_slides: string | null;
  full_canonical: string | null;
};

export type AnswerDivergence = {
  field: string;
  live_value_summary: string;
  candidate_paths: string[];
};

export type SlugLiveReconciliation = {
  slug: string;
  live_match_class: LiveMatchClass;
  operational_status: OperationalStatus;
  editorial_status: EditorialStatus;
  severity: BlockerSeverity | null;
  live_record_count: number;
  matched_candidate_paths: string[];
  matched_candidate_lotes: string[];
  section_hashes_live: SectionHashes | null;
  section_hashes_candidates: Record<string, SectionHashes>;
  answer_divergences: AnswerDivergence[];
  operational_match_only: boolean;
  official_answer_review_required: boolean;
  s1_single_operational_version: boolean | null;
  s2_production_slide_version_note: string;
  documented_editorial_path: string | null;
};

export type LiveReconciliationReport = {
  generated_at: string;
  dedupe_schema_version: number;
  live_access: {
    available: boolean;
    error?: string;
    method: string;
  };
  scope: {
    unresolved_slugs: number;
    processed: number;
  };
  distribution: Record<LiveMatchClass, number>;
  by_severity: Record<BlockerSeverity, { total: number; live_matched: number; live_missing: number }>;
  answer_key_divergences: {
    count: number;
    slugs: string[];
    all_require_official_review: boolean;
  };
  /** Reconciliação local (blockers) × live — união exige fonte oficial. */
  answer_key_review: {
    s3_slugs: number;
    has_answer_divergence_slugs: number;
    overlap_slugs: number;
    union_requires_official_source: number;
    editorial_official_review_required: number;
    live_detected_answer_divergences: number;
    reconciliation_note: string;
  };
  dual_canonical_summary: {
    operational_matched: number;
    operational_missing: number;
    operational_ambiguous: number;
    operational_incomparable: number;
    editorial_documented: number;
    editorial_unresolved: number;
    editorial_official_review_required: number;
  };
  slugs: SlugLiveReconciliation[];
  limitations: string[];
};

function sha256Hex(input: string): string {
  return createHash('sha256').update(input, 'utf8').digest('hex');
}

function extractSectionHashes(normalized: Record<string, unknown>): SectionHashes {
  const meta = normalized.meta as Record<string, unknown>;
  const qd = normalized.question_data as Record<string, unknown>;
  const options = Array.isArray(qd.options) ? qd.options : [];

  return {
    meta_pedagogica: sha256Hex(
      canonicalJson({
        banca: meta.banca ?? null,
        topico: meta.topico ?? null,
        subtopico: meta.subtopico ?? null,
        family: meta.family ?? null,
        pedagogical_branch: meta.pedagogical_branch ?? null,
        content_standard: meta.content_standard ?? null,
      }),
    ),
    question_data: sha256Hex(
      canonicalJson({
        instruction: qd.instruction ?? '',
        text_fragment: qd.text_fragment ?? null,
      }),
    ),
    alternativas_gabarito: sha256Hex(canonicalJson({ options })),
    reverse_study_slides: sha256Hex(canonicalJson(normalized.reverse_study_slides ?? [])),
    full_canonical: sha256Hex(canonicalJson(normalized)),
  };
}

function tryNormalizeLivePayload(raw: unknown): { normalized: Record<string, unknown> } | { error: string } {
  if (!raw || typeof raw !== 'object') {
    return { error: 'conteudo_json ausente ou não-objeto' };
  }
  try {
    const normalized = normalizeQuestionForComparison(raw as Record<string, unknown>);
    if (!Array.isArray(normalized.reverse_study_slides) || normalized.reverse_study_slides.length === 0) {
      return { error: 'reverse_study_slides vazio ou ausente' };
    }
    return { normalized };
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) };
  }
}

function buildCandidateIndex(): Map<string, { path: string; entry: CatalogFileEntry; hashes: SectionHashes }[]> {
  const paths = walkAllCatalogQuestionPaths();
  const groups = groupQuestionPathsBySlug(paths);
  const index = new Map<string, { path: string; entry: CatalogFileEntry; hashes: SectionHashes }[]>();

  for (const [slug, filePaths] of groups) {
    const candidates: { path: string; entry: CatalogFileEntry; hashes: SectionHashes }[] = [];
    for (const p of filePaths) {
      const entry = analyzeCatalogFile(p);
      if (entry.parse_error || !entry.semantic_sha256) continue;
      try {
        const raw = readQuestionJsonFile(p);
        const normalized = normalizeQuestionForComparison(raw);
        candidates.push({ path: p, entry, hashes: extractSectionHashes(normalized) });
      } catch {
        continue;
      }
    }
    if (candidates.length) index.set(slug, candidates);
  }
  return index;
}

function matchCandidates(
  liveHashes: SectionHashes,
  candidates: { path: string; entry: CatalogFileEntry; hashes: SectionHashes }[],
): string[] {
  return candidates
    .filter((c) => c.hashes.full_canonical === liveHashes.full_canonical)
    .map((c) => c.path);
}

function editorialStatusForBlocker(
  officialReview: boolean,
  fallback: EditorialStatus = 'unresolved',
): EditorialStatus {
  return officialReview ? 'official_review_required' : fallback;
}

function buildAnswerKeyReview(
  blockerReport: ReturnType<typeof buildBlockerAnalysisReport>,
  editorialOfficialReviewRequired: number,
  liveDetectedAnswerDivergences: number,
): LiveReconciliationReport['answer_key_review'] {
  const s3 = new Set(blockerReport.blockers.filter((b) => b.severity === 'S3').map((b) => b.slug));
  const ans = new Set(blockerReport.blockers.filter((b) => b.has_answer_divergence).map((b) => b.slug));
  const overlap = [...s3].filter((s) => ans.has(s)).length;
  const union = new Set([...s3, ...ans]);

  return {
    s3_slugs: s3.size,
    has_answer_divergence_slugs: ans.size,
    overlap_slugs: overlap,
    union_requires_official_source: union.size,
    editorial_official_review_required: editorialOfficialReviewRequired,
    live_detected_answer_divergences: liveDetectedAnswerDivergences,
    reconciliation_note:
      editorialOfficialReviewRequired === union.size
        ? 'editorial_official_review_required alinha com união S3 ∪ has_answer_divergence (blockers locais).'
        : `editorial_official_review_required (${editorialOfficialReviewRequired}) deve igualar união (${union.size}); slugs S3/gabarito com live inválido/ausente também marcam official_review_required.`,
  };
}

function detectAnswerDivergences(
  liveNormalized: Record<string, unknown>,
  candidates: { path: string; hashes: SectionHashes }[],
): AnswerDivergence[] {
  const divergences: AnswerDivergence[] = [];
  const liveQd = liveNormalized.question_data as {
    instruction?: string;
    options?: { id: string; text: string; is_correct: boolean }[];
  };
  const liveInstruction = String(liveQd.instruction ?? '');
  const liveOptions = liveQd.options ?? [];

  const pathsByInstruction = new Map<string, string[]>();
  const pathsByOptions = new Map<string, string[]>();
  const pathsByCorrect = new Map<string, string[]>();

  for (const c of candidates) {
    try {
      const raw = readQuestionJsonFile(c.path);
      const norm = normalizeQuestionForComparison(raw);
      const qd = norm.question_data as { instruction?: string; options?: typeof liveOptions };
      const instr = String(qd.instruction ?? '');
      const opts = qd.options ?? [];
      const instrKey = sha256Hex(instr);
      const optsKey = sha256Hex(canonicalJson(opts));
      const correctKey = sha256Hex(
        canonicalJson(opts.map((o) => ({ id: o.id, is_correct: o.is_correct }))),
      );

      pathsByInstruction.set(instrKey, [...(pathsByInstruction.get(instrKey) ?? []), c.path]);
      pathsByOptions.set(optsKey, [...(pathsByOptions.get(optsKey) ?? []), c.path]);
      pathsByCorrect.set(correctKey, [...(pathsByCorrect.get(correctKey) ?? []), c.path]);
    } catch {
      continue;
    }
  }

  const liveInstrKey = sha256Hex(liveInstruction);
  const liveOptsKey = sha256Hex(canonicalJson(liveOptions));
  const liveCorrectKey = sha256Hex(
    canonicalJson(liveOptions.map((o) => ({ id: o.id, is_correct: o.is_correct }))),
  );

  if (!pathsByInstruction.has(liveInstrKey) && pathsByInstruction.size > 0) {
    divergences.push({
      field: 'question_data.instruction',
      live_value_summary: liveInstruction.slice(0, 120),
      candidate_paths: [...new Set(candidates.map((c) => c.path))],
    });
  }
  if (!pathsByOptions.has(liveOptsKey) && pathsByOptions.size > 0) {
    divergences.push({
      field: 'question_data.options',
      live_value_summary: `${liveOptions.length} alternativas`,
      candidate_paths: [...new Set(candidates.map((c) => c.path))],
    });
  }
  if (!pathsByCorrect.has(liveCorrectKey) && pathsByCorrect.size > 0) {
    const correctIds = liveOptions.filter((o) => o.is_correct).map((o) => o.id);
    divergences.push({
      field: 'question_data.options[].is_correct / gabarito',
      live_value_summary: `corretas: ${correctIds.join(', ') || '(nenhuma)'}`,
      candidate_paths: [...new Set(candidates.map((c) => c.path))],
    });
  }

  return divergences;
}

type LiveRow = {
  modulo_slug: string;
  conteudo_json: unknown;
};

export async function buildLiveReconciliationReport(
  fetchLiveRows: (slugs: string[]) => Promise<LiveRow[] | { error: string }>,
): Promise<LiveReconciliationReport> {
  const catalog = buildCanonicalCatalog();
  const blockerReport = buildBlockerAnalysisReport();
  const blockerBySlug = new Map(blockerReport.blockers.map((b) => [b.slug, b]));
  const authorityIndex = buildSlugAuthorityIndex();
  const candidateIndex = buildCandidateIndex();
  const unresolvedSlugs = [...catalog.unresolved_slugs].sort();

  const distribution: Record<LiveMatchClass, number> = {
    live_exactly_one_candidate: 0,
    live_matches_multiple_identical_candidates: 0,
    live_matches_no_candidate: 0,
    slug_missing_live: 0,
    live_invalid_incomparable: 0,
    live_multiple_records: 0,
  };

  const bySeverity: LiveReconciliationReport['by_severity'] = {
    S0: { total: 0, live_matched: 0, live_missing: 0 },
    S1: { total: 0, live_matched: 0, live_missing: 0 },
    S2: { total: 0, live_matched: 0, live_missing: 0 },
    S3: { total: 0, live_matched: 0, live_missing: 0 },
    S4: { total: 0, live_matched: 0, live_missing: 0 },
  };

  const slugs: SlugLiveReconciliation[] = [];
  let liveAccess: LiveReconciliationReport['live_access'] = {
    available: false,
    method: 'createServerSupabase → modulos_estudo.select(modulo_slug, conteudo_json)',
  };

  if (unresolvedSlugs.length === 0) {
    return {
      generated_at: new Date().toISOString(),
      dedupe_schema_version: DEDUPE_SCHEMA_VERSION,
      live_access: { available: false, error: 'Nenhum slug unresolved', method: liveAccess.method },
      scope: { unresolved_slugs: 0, processed: 0 },
      distribution,
      by_severity: bySeverity,
      answer_key_divergences: { count: 0, slugs: [], all_require_official_review: true },
      answer_key_review: buildAnswerKeyReview(blockerReport, 0, 0),
      dual_canonical_summary: {
        operational_matched: 0,
        operational_missing: 0,
        operational_ambiguous: 0,
        operational_incomparable: 0,
        editorial_documented: 0,
        editorial_unresolved: 0,
        editorial_official_review_required: 0,
      },
      slugs: [],
      limitations: ['Sem slugs unresolved para reconciliar.'],
    };
  }

  const liveResult = await fetchLiveRows(unresolvedSlugs);

  if ('error' in liveResult) {
    liveAccess = { available: false, error: liveResult.error, method: liveAccess.method };
    return {
      generated_at: new Date().toISOString(),
      dedupe_schema_version: DEDUPE_SCHEMA_VERSION,
      live_access: liveAccess,
      scope: { unresolved_slugs: unresolvedSlugs.length, processed: 0 },
      distribution,
      by_severity: bySeverity,
      answer_key_divergences: { count: 0, slugs: [], all_require_official_review: true },
      answer_key_review: buildAnswerKeyReview(
        blockerReport,
        blockerReport.blockers.filter(
          (b) => b.severity === 'S3' || b.has_answer_divergence,
        ).length,
        0,
      ),
      dual_canonical_summary: {
        operational_matched: 0,
        operational_missing: 0,
        operational_ambiguous: 0,
        operational_incomparable: unresolvedSlugs.length,
        editorial_documented: 0,
        editorial_unresolved: unresolvedSlugs.length,
        editorial_official_review_required: blockerReport.blockers.filter(
          (b) => b.severity === 'S3' || b.has_answer_divergence,
        ).length,
      },
      slugs: unresolvedSlugs.map((slug) => ({
        slug,
        live_match_class: 'live_invalid_incomparable',
        operational_status: 'incomparable',
        editorial_status: 'unresolved',
        severity: blockerBySlug.get(slug)?.severity ?? null,
        live_record_count: 0,
        matched_candidate_paths: [],
        matched_candidate_lotes: [],
        section_hashes_live: null,
        section_hashes_candidates: {},
        answer_divergences: [],
        operational_match_only: false,
        official_answer_review_required: blockerBySlug.get(slug)?.has_answer_divergence ?? false,
        s1_single_operational_version: null,
        s2_production_slide_version_note: 'Live indisponível — versão em produção não verificada.',
        documented_editorial_path: null,
      })),
      limitations: [
        'Comparação live não executada — credenciais Supabase indisponíveis ou erro de leitura.',
        'Supabase operacional ≠ canônico editorial; manifest continua obrigatório para editorial.',
      ],
    };
  }

  liveAccess = { available: true, method: liveAccess.method };

  const liveBySlug = new Map<string, LiveRow[]>();
  for (const row of liveResult) {
    const slug = row.modulo_slug;
    const list = liveBySlug.get(slug) ?? [];
    list.push(row);
    liveBySlug.set(slug, list);
  }

  for (const slug of unresolvedSlugs) {
    const blocker = blockerBySlug.get(slug);
    const severity = blocker?.severity ?? null;
    if (severity) {
      bySeverity[severity].total += 1;
    }

    const candidates = candidateIndex.get(slug) ?? [];
    const sectionHashesCandidates: Record<string, SectionHashes> = {};
    for (const c of candidates) {
      sectionHashesCandidates[c.path] = c.hashes;
    }

    const documented = getDocumentedPathsForSlug(slug, candidates.map((c) => c.path), authorityIndex);
    const documentedPath = documented.length === 1 ? documented[0]!.path : null;
    const editorialStatus: EditorialStatus = documented.length > 0 ? 'unresolved' : 'unresolved';
    const officialReview =
      blocker?.has_answer_divergence || severity === 'S3' || (blocker?.field_kinds.includes('answer_key') ?? false);

    const liveRows = liveBySlug.get(slug) ?? [];

    if (liveRows.length === 0) {
      distribution.slug_missing_live += 1;
      if (severity) bySeverity[severity].live_missing += 1;
      slugs.push({
        slug,
        live_match_class: 'slug_missing_live',
        operational_status: 'missing',
        editorial_status: editorialStatusForBlocker(officialReview, editorialStatus),
        severity,
        live_record_count: 0,
        matched_candidate_paths: [],
        matched_candidate_lotes: [],
        section_hashes_live: null,
        section_hashes_candidates: sectionHashesCandidates,
        answer_divergences: [],
        operational_match_only: false,
        official_answer_review_required: officialReview,
        s1_single_operational_version: false,
        s2_production_slide_version_note: 'Slug unresolved e ausente no Supabase live.',
        documented_editorial_path: documentedPath,
      });
      continue;
    }

    if (liveRows.length > 1) {
      distribution.live_multiple_records += 1;
      if (severity) bySeverity[severity].live_missing += 1;
      slugs.push({
        slug,
        live_match_class: 'live_multiple_records',
        operational_status: 'ambiguous',
        editorial_status: editorialStatusForBlocker(officialReview, editorialStatus),
        severity,
        live_record_count: liveRows.length,
        matched_candidate_paths: [],
        matched_candidate_lotes: [],
        section_hashes_live: null,
        section_hashes_candidates: sectionHashesCandidates,
        answer_divergences: [],
        operational_match_only: false,
        official_answer_review_required: officialReview,
        s1_single_operational_version: false,
        s2_production_slide_version_note: `${liveRows.length} registros live — ambíguo operacionalmente.`,
        documented_editorial_path: documentedPath,
      });
      continue;
    }

    const liveRow = liveRows[0]!;
    const parsed = tryNormalizeLivePayload(liveRow.conteudo_json);
    if ('error' in parsed) {
      distribution.live_invalid_incomparable += 1;
      slugs.push({
        slug,
        live_match_class: 'live_invalid_incomparable',
        operational_status: 'incomparable',
        editorial_status: editorialStatusForBlocker(officialReview, editorialStatus),
        severity,
        live_record_count: 1,
        matched_candidate_paths: [],
        matched_candidate_lotes: [],
        section_hashes_live: null,
        section_hashes_candidates: sectionHashesCandidates,
        answer_divergences: [],
        operational_match_only: false,
        official_answer_review_required: officialReview,
        s1_single_operational_version: null,
        s2_production_slide_version_note: `Live inválido: ${parsed.error}`,
        documented_editorial_path: documentedPath,
      });
      continue;
    }

    const liveHashes = extractSectionHashes(parsed.normalized);
    const matched = matchCandidates(liveHashes, candidates);
    const answerDivergences = detectAnswerDivergences(parsed.normalized, candidates);

    let liveClass: LiveMatchClass;
    let operationalStatus: OperationalStatus;

    if (matched.length === 0) {
      liveClass = 'live_matches_no_candidate';
      operationalStatus = 'missing';
      if (severity) bySeverity[severity].live_missing += 1;
    } else if (matched.length === 1) {
      liveClass = 'live_exactly_one_candidate';
      operationalStatus = 'matched';
      if (severity) bySeverity[severity].live_matched += 1;
    } else {
      liveClass = 'live_matches_multiple_identical_candidates';
      operationalStatus = 'ambiguous';
      if (severity) bySeverity[severity].live_matched += 1;
    }

    distribution[liveClass] += 1;

    const s1Single = matched.length === 1;
    const s2Note =
      matched.length === 1
        ? `NeuroSlides em produção alinhados byte-semântico ao candidato ${matched[0]} (não implica correção pedagógica).`
        : matched.length > 1
          ? 'Produção coincide com múltiplas cópias locais idênticas — editorial ainda exige manifest.'
          : 'Produção não coincide com nenhum candidato local — revisar origem operacional.';

    slugs.push({
      slug,
      live_match_class: liveClass,
      operational_status: operationalStatus,
      editorial_status: editorialStatusForBlocker(officialReview, editorialStatus),
      severity,
      live_record_count: 1,
      matched_candidate_paths: matched,
      matched_candidate_lotes: matched.map((p) => p.match(/catalog-migration\/([^/]+)\//)?.[1] ?? 'unknown'),
      section_hashes_live: liveHashes,
      section_hashes_candidates: sectionHashesCandidates,
      answer_divergences: answerDivergences,
      operational_match_only: matched.length > 0,
      official_answer_review_required: officialReview,
      s1_single_operational_version: s1Single,
      s2_production_slide_version_note: s2Note,
      documented_editorial_path: documentedPath,
    });
  }

  const answerSlugs = slugs.filter((s) => s.answer_divergences.length > 0).map((s) => s.slug);
  const dual = {
    operational_matched: slugs.filter((s) => s.operational_status === 'matched').length,
    operational_missing: slugs.filter((s) => s.operational_status === 'missing').length,
    operational_ambiguous: slugs.filter((s) => s.operational_status === 'ambiguous').length,
    operational_incomparable: slugs.filter((s) => s.operational_status === 'incomparable').length,
    editorial_documented: slugs.filter((s) => s.documented_editorial_path).length,
    editorial_unresolved: slugs.filter((s) => s.editorial_status === 'unresolved').length,
    editorial_official_review_required: slugs.filter((s) => s.editorial_status === 'official_review_required').length,
  };

  const editorialOfficial = dual.editorial_official_review_required;

  return {
    generated_at: new Date().toISOString(),
    dedupe_schema_version: DEDUPE_SCHEMA_VERSION,
    live_access: liveAccess,
    scope: { unresolved_slugs: unresolvedSlugs.length, processed: slugs.length },
    distribution,
    by_severity: bySeverity,
    answer_key_divergences: {
      count: answerSlugs.length,
      slugs: answerSlugs,
      all_require_official_review: true,
    },
    answer_key_review: buildAnswerKeyReview(blockerReport, editorialOfficial, answerSlugs.length),
    dual_canonical_summary: dual,
    slugs,
    limitations: [
      `dedupe_schema_version: ${DEDUPE_SCHEMA_VERSION}`,
      'Supabase live = evidência operacional; manifest/registry = canônico editorial.',
      'S3: operational_match_only=true e official_answer_review_required=true mesmo com match live.',
      'Nenhuma escrita Supabase; nenhuma alteração em manifests/registry.',
    ],
  };
}

export function renderLiveReconciliationMarkdown(report: LiveReconciliationReport): string {
  const distRows = Object.entries(report.distribution).map(([k, v]) => `| ${k} | ${v} |`);
  const sevRows = (['S0', 'S1', 'S2', 'S3', 'S4'] as BlockerSeverity[]).map(
    (s) =>
      `| ${s} | ${report.by_severity[s].total} | ${report.by_severity[s].live_matched} | ${report.by_severity[s].live_missing} |`,
  );

  return [
    '# NeuroCanvas — reconciliação operacional vs editorial (G0.2 live)',
    '',
    `Gerado em: ${report.generated_at}`,
    '',
    `## Acesso live: **${report.live_access.available ? 'disponível' : 'indisponível'}**`,
    '',
    report.live_access.error ? `Erro: ${report.live_access.error}` : `Método: ${report.live_access.method}`,
    '',
    `Slugs unresolved processados: **${report.scope.processed}** / ${report.scope.unresolved_slugs}`,
    '',
    '## Distribuição A–F',
    '',
    '| classe | count |',
    '|--------|------:|',
    ...distRows,
    '',
    '## Por severidade (S1–S3)',
    '',
    '| severity | total | live_matched | live_missing/ambiguous |',
    '|----------|------:|-------------:|-----------------------:|',
    ...sevRows,
    '',
    '## Dual canônico',
    '',
    `| operational matched | ${report.dual_canonical_summary.operational_matched} |`,
    `| operational missing | ${report.dual_canonical_summary.operational_missing} |`,
    `| operational ambiguous | ${report.dual_canonical_summary.operational_ambiguous} |`,
    `| operational incomparable | ${report.dual_canonical_summary.operational_incomparable} |`,
    `| editorial documented path | ${report.dual_canonical_summary.editorial_documented} |`,
    `| editorial unresolved | ${report.dual_canonical_summary.editorial_unresolved} |`,
    `| editorial official_review_required | ${report.dual_canonical_summary.editorial_official_review_required} |`,
    '',
    '## Revisão oficial de gabarito (blockers locais)',
    '',
    '| Métrica | Count |',
    '|---------|------:|',
    `| S3 | ${report.answer_key_review.s3_slugs} |`,
    `| has_answer_divergence | ${report.answer_key_review.has_answer_divergence_slugs} |`,
    `| overlap (S3 ∩ gabarito) | ${report.answer_key_review.overlap_slugs} |`,
    `| **união (exige fonte oficial)** | **${report.answer_key_review.union_requires_official_source}** |`,
    `| editorial_official_review_required | ${report.answer_key_review.editorial_official_review_required} |`,
    `| live_detected_answer_divergences | ${report.answer_key_review.live_detected_answer_divergences} |`,
    '',
    report.answer_key_review.reconciliation_note,
    '',
    `## Divergências live×candidatos (campo answer_divergences): **${report.answer_key_divergences.count}**`,
    '',
    report.answer_key_divergences.count
      ? report.answer_key_divergences.slugs.slice(0, 30).map((s) => `- ${s}`).join('\n')
      : 'Nenhuma detectada na comparação live×candidatos (live pode coincidir com uma cópia local enquanto outras divergem).',
    '',
    '## Limitações',
    '',
    ...report.limitations.map((l) => `- ${l}`),
    '',
  ].join('\n');
}

export type { BlockerDetail };
