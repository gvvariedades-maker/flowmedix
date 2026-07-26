import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';

import {
  buildCanonicalCatalog,
  DEDUPE_SCHEMA_VERSION,
  iterateCanonicalQuestions,
  type CanonicalCatalogResult,
} from '@/lib/neurocanvas/canonicalCatalog';
import { normalizeReverseStudySlide } from '@/lib/reverseStudySlidesNormalize';
import { sortReverseStudySlides } from '@/lib/reverseStudySlideOrder';
import { CATALOG_MIGRATION_ROOT } from '@/lib/catalogMigration/paths';
import { resolveAuditRoots, type NeurocanvasAuditRoots } from '@/lib/neurocanvas/auditRoots';

const WRAPPER_KEYS = ['concept_map', 'golden_rule', 'logic_flow', 'danger_zone'] as const;

export type CatalogAuditOptions = {
  /** Incluir `examples/*.json` além do catálogo migration. */
  includeExamples?: boolean;
  /** Limitar slugs processados (debug). */
  limit?: number;
  /** Usar seleção canônica determinística (padrão). */
  canonical?: boolean;
  /** Falhar se houver slug divergente sem regra canônica. */
  strict?: boolean;
} & Partial<NeurocanvasAuditRoots>;

export type CatalogAuditReport = {
  generated_at: string;
  sources: {
    catalog_migration: boolean;
    examples: boolean;
  };
  selection: {
    mode: 'filesystem_first' | 'canonical';
    canonical_blockers: number;
    divergent_slugs: number;
    content_divergent_slugs: number;
    unresolved_slugs: number;
    baseline_materially_affected: boolean;
    dedupe_schema_version: number;
  };
  questions: {
    unique_slugs: number;
    duplicate_files_skipped: number;
    with_reverse_study_slides: number;
    slide_count_not_four: number;
    nested_slide_wrappers: number;
    flat_slides: number;
  };
  slides: {
    total: number;
    by_type: Record<string, number>;
    shape_combos: Record<string, number>;
    slot_stats: {
      items: { count: number; median: number; p90: number; max: number };
      steps: { count: number; median: number; p90: number; max: number };
      rows: { count: number; median: number; p90: number; max: number };
    };
    explicit_layout_variant: number;
    explicit_template: number;
    explicit_theme_id: number;
    danger_with_correct: number;
    danger_items_without_correct: number;
    logic_flow_tap: number;
    logic_flow_auto: number;
  };
  meta: {
    subtopico: number;
    family: number;
    pedagogical_branch: number;
    golden_v1: number;
  };
  limitations: string[];
};

type QuestionRow = {
  slug: string;
  path: string;
  slideCount: number;
  nestedWrappers: number;
};

function percentile(sorted: number[], p: number): number {
  if (!sorted.length) return 0;
  const idx = Math.min(sorted.length - 1, Math.floor(sorted.length * p));
  return sorted[idx] ?? 0;
}

function median(nums: number[]): number {
  if (!nums.length) return 0;
  const a = [...nums].sort((x, y) => x - y);
  const m = Math.floor(a.length / 2);
  return a.length % 2 ? a[m]! : (a[m - 1]! + a[m]!) / 2;
}

function isNestedWrapperSlide(raw: Record<string, unknown>): boolean {
  const t = raw.type;
  if (typeof t !== 'string') return false;
  const inner = raw[t];
  return Boolean(inner && typeof inner === 'object' && !Array.isArray(inner));
}

function slideShapeKey(slide: Record<string, unknown>): string {
  const hasItems = Array.isArray(slide.items) && slide.items.length > 0;
  const hasSteps = Array.isArray(slide.steps) && slide.steps.length > 0;
  const hasRows = Array.isArray(slide.rows) && slide.rows.length > 0;
  const hasContent = typeof slide.content === 'string' && slide.content.trim().length > 0;
  const parts = [
    hasItems ? 'items' : null,
    hasSteps ? 'steps' : null,
    hasRows ? 'rows' : null,
    hasContent ? 'content' : null,
  ].filter(Boolean);
  return parts.length ? parts.join('+') : 'empty';
}

function walkQuestionFiles(root: string, out: string[]): void {
  if (!existsSync(root)) return;
  for (const ent of readdirSync(root, { withFileTypes: true })) {
    const p = join(root, ent.name);
    if (ent.isDirectory()) {
      if (ent.name === 'questions') {
        for (const f of readdirSync(p)) {
          if (f.endsWith('.json')) out.push(join(p, f));
        }
      } else {
        walkQuestionFiles(p, out);
      }
    }
  }
}

function loadJson(path: string): unknown {
  const text = readFileSync(path, 'utf8').replace(/^\uFEFF/, '');
  return JSON.parse(text);
}

function collectFilesystemFirstFiles(
  includeExamples: boolean,
  catalogRoot: string,
  repoRoot: string,
): {
  files: { slug: string; path: string }[];
  duplicateSkipped: number;
} {
  const seen = new Map<string, string>();
  const files: { slug: string; path: string }[] = [];
  let duplicateSkipped = 0;
  const rawPaths: string[] = [];

  if (existsSync(catalogRoot)) {
    walkQuestionFiles(catalogRoot, rawPaths);
  }

  if (includeExamples) {
    const exDir = resolve(repoRoot, 'examples');
    if (existsSync(exDir)) {
      for (const f of readdirSync(exDir)) {
        if (f.endsWith('.json')) rawPaths.push(join(exDir, f));
      }
    }
  }

  for (const filePath of rawPaths) {
    const slug = filePath.split(/[/\\]/).pop()?.replace(/\.json$/, '') ?? filePath;
    if (seen.has(slug)) {
      duplicateSkipped += 1;
      continue;
    }
    seen.set(slug, filePath);
    files.push({ slug, path: filePath });
  }

  return { files, duplicateSkipped };
}

export function buildCatalogAuditReport(options: CatalogAuditOptions = {}): CatalogAuditReport {
  const { catalogRoot, repoRoot } = resolveAuditRoots(options);
  const limitations: string[] = [];
  const useCanonical = options.canonical !== false;
  let canonicalCatalog: CanonicalCatalogResult | undefined;
  let files: { slug: string; path: string }[] = [];
  let duplicateSkipped = 0;

  if (!existsSync(catalogRoot)) {
    limitations.push('data/catalog-migration ausente — baseline NOT READY sem export local.');
  }

  if (useCanonical && existsSync(catalogRoot)) {
    canonicalCatalog = buildCanonicalCatalog({ strict: options.strict, catalogRoot, repoRoot });
    duplicateSkipped = canonicalCatalog.duplicate_groups.reduce(
      (sum, g) => sum + g.file_count - 1,
      0,
    );
    iterateCanonicalQuestions((slug, path) => {
      files.push({ slug, path });
    }, canonicalCatalog);
    if (options.includeExamples) {
      const exDir = resolve(repoRoot, 'examples');
      if (existsSync(exDir)) {
        for (const f of readdirSync(exDir)) {
          if (!f.endsWith('.json')) continue;
          const slug = f.replace(/\.json$/, '');
          if (!files.some((row) => row.slug === slug)) {
            files.push({ slug, path: join(exDir, f) });
          }
        }
      }
    }
  } else {
    const legacy = collectFilesystemFirstFiles(Boolean(options.includeExamples), catalogRoot, repoRoot);
    files = legacy.files;
    duplicateSkipped = legacy.duplicateSkipped;
    limitations.push('Modo filesystem_first — não determinístico entre OS.');
  }

  const report: CatalogAuditReport = {
    generated_at: new Date().toISOString(),
    sources: {
      catalog_migration: existsSync(catalogRoot),
      examples: Boolean(options.includeExamples),
    },
    selection: {
      mode: useCanonical ? 'canonical' : 'filesystem_first',
      canonical_blockers: canonicalCatalog?.blockers.length ?? 0,
      divergent_slugs: canonicalCatalog?.content_divergent_slugs.length ?? 0,
      content_divergent_slugs: canonicalCatalog?.content_divergent_slugs.length ?? 0,
      unresolved_slugs: canonicalCatalog?.unresolved_slugs.length ?? 0,
      baseline_materially_affected: canonicalCatalog?.baseline_materially_affected ?? false,
      dedupe_schema_version: DEDUPE_SCHEMA_VERSION,
    },
    questions: {
      unique_slugs: 0,
      duplicate_files_skipped: 0,
      with_reverse_study_slides: 0,
      slide_count_not_four: 0,
      nested_slide_wrappers: 0,
      flat_slides: 0,
    },
    slides: {
      total: 0,
      by_type: {},
      shape_combos: {},
      slot_stats: {
        items: { count: 0, median: 0, p90: 0, max: 0 },
        steps: { count: 0, median: 0, p90: 0, max: 0 },
        rows: { count: 0, median: 0, p90: 0, max: 0 },
      },
      explicit_layout_variant: 0,
      explicit_template: 0,
      explicit_theme_id: 0,
      danger_with_correct: 0,
      danger_items_without_correct: 0,
      logic_flow_tap: 0,
      logic_flow_auto: 0,
    },
    meta: {
      subtopico: 0,
      family: 0,
      pedagogical_branch: 0,
      golden_v1: 0,
    },
    limitations,
  };

  const itemLens: number[] = [];
  const stepLens: number[] = [];
  const rowLens: number[] = [];
  let processed = 0;
  report.questions.duplicate_files_skipped = duplicateSkipped;

  for (const { slug, path: filePath } of files) {
    if (options.limit && processed >= options.limit) break;

    let raw: Record<string, unknown>;
    try {
      raw = loadJson(filePath) as Record<string, unknown>;
    } catch {
      continue;
    }

    processed += 1;

    const meta = (raw.meta ?? {}) as Record<string, unknown>;
    if (meta.subtopico) report.meta.subtopico += 1;
    if (meta.family) report.meta.family += 1;
    if (meta.pedagogical_branch) report.meta.pedagogical_branch += 1;
    if (meta.content_standard === 'golden-v1') report.meta.golden_v1 += 1;

    const slidesRaw = (raw.reverse_study_slides ?? raw.study_slides) as unknown;
    if (!Array.isArray(slidesRaw) || slidesRaw.length === 0) continue;

    report.questions.with_reverse_study_slides += 1;
    if (slidesRaw.length !== 4) report.questions.slide_count_not_four += 1;

    const sorted = sortReverseStudySlides(
      slidesRaw.map((s) => normalizeReverseStudySlide(s)) as { type?: string }[],
    ) as Record<string, unknown>[];

    for (const slideRaw of slidesRaw) {
      if (slideRaw && typeof slideRaw === 'object' && !Array.isArray(slideRaw)) {
        if (isNestedWrapperSlide(slideRaw as Record<string, unknown>)) {
          report.questions.nested_slide_wrappers += 1;
        } else {
          report.questions.flat_slides += 1;
        }
      }
    }

    for (const slide of sorted) {
      report.slides.total += 1;
      const type = String(slide.type ?? 'unknown');
      report.slides.by_type[type] = (report.slides.by_type[type] ?? 0) + 1;

      const shape = slideShapeKey(slide);
      report.slides.shape_combos[shape] = (report.slides.shape_combos[shape] ?? 0) + 1;

      if (slide.layout_variant) report.slides.explicit_layout_variant += 1;
      if (slide.template) report.slides.explicit_template += 1;
      if (slide.theme_id) report.slides.explicit_theme_id += 1;

      if (Array.isArray(slide.items) && slide.items.length > 0) {
        itemLens.push(slide.items.length);
      }
      if (Array.isArray(slide.steps) && slide.steps.length > 0) {
        stepLens.push(slide.steps.length);
      }
      if (Array.isArray(slide.rows) && slide.rows.length > 0) {
        rowLens.push(slide.rows.length);
      }

      if (type === 'danger_zone' && Array.isArray(slide.items)) {
        const withCorrect = slide.items.filter(
          (it) =>
            it &&
            typeof it === 'object' &&
            typeof (it as { correct?: unknown }).correct === 'string' &&
            String((it as { correct: string }).correct).trim().length > 0,
        ).length;
        if (withCorrect > 0) report.slides.danger_with_correct += 1;
        else if (slide.items.length > 0) report.slides.danger_items_without_correct += 1;
      }

      if (type === 'logic_flow') {
        if (slide.reveal_mode === 'tap') report.slides.logic_flow_tap += 1;
        else report.slides.logic_flow_auto += 1;
      }
    }
  }

  report.questions.unique_slugs = processed;

  const fillSlot = (lens: number[]) => {
    const sorted = [...lens].sort((a, b) => a - b);
    return {
      count: lens.length,
      median: median(lens),
      p90: percentile(sorted, 0.9),
      max: sorted[sorted.length - 1] ?? 0,
    };
  };

  report.slides.slot_stats.items = fillSlot(itemLens);
  report.slides.slot_stats.steps = fillSlot(stepLens);
  report.slides.slot_stats.rows = fillSlot(rowLens);

  if (!existsSync(catalogRoot)) {
    limitations.push('Contagens de catálogo podem estar incompletas sem export local.');
  }

  return report;
}

export function renderCatalogAuditMarkdown(report: CatalogAuditReport): string {
  const q = report.questions;
  const s = report.slides;
  const m = report.meta;
  const totalQ = q.unique_slugs || 1;
  const totalS = s.total || 1;

  const shapeRows = Object.entries(s.shape_combos)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([k, v]) => `| ${k} | ${v} | ${((v / totalS) * 100).toFixed(1)}% |`);

  const typeRows = Object.entries(s.by_type)
    .sort((a, b) => b[1] - a[1])
    .map(([k, v]) => `| ${k} | ${v} | ${((v / totalS) * 100).toFixed(1)}% |`);

  return [
    '# NeuroCanvas — auditoria de catálogo (slides)',
    '',
    `Gerado em: ${report.generated_at}`,
    '',
    '## Questões',
    '',
    '| Métrica | Valor |',
    '|---------|-------|',
    `| Slugs únicos | ${q.unique_slugs} |`,
    `| Seleção | ${report.selection.mode} |`,
    `| Blockers canônicos | ${report.selection.canonical_blockers} |`,
    `| Slugs divergentes (conteúdo) | ${report.selection.content_divergent_slugs} |`,
    `| Slugs não resolvidos (blocker) | ${report.selection.unresolved_slugs} |`,
    `| dedupe_schema_version | ${report.selection.dedupe_schema_version} |`,
    `| Baseline materialmente afetada | ${report.selection.baseline_materially_affected ? 'sim' : 'não'} |`,
    `| Arquivos duplicados ignorados | ${q.duplicate_files_skipped} |`,
    `| Com reverse_study_slides | ${q.with_reverse_study_slides} |`,
    `| ≠ 4 slides | ${q.slide_count_not_four} |`,
    `| Slides aninhados (wrapper legado) | ${q.nested_slide_wrappers} |`,
    `| Slides planos | ${q.flat_slides} |`,
    '',
    '## Meta (por questão)',
    '',
    '| Campo | Count | % |',
    '|-------|------:|--:|',
    `| subtopico | ${m.subtopico} | ${((m.subtopico / totalQ) * 100).toFixed(1)}% |`,
    `| family | ${m.family} | ${((m.family / totalQ) * 100).toFixed(1)}% |`,
    `| pedagogical_branch | ${m.pedagogical_branch} | ${((m.pedagogical_branch / totalQ) * 100).toFixed(1)}% |`,
    `| golden-v1 | ${m.golden_v1} | ${((m.golden_v1 / totalQ) * 100).toFixed(1)}% |`,
    '',
    '## Slides',
    '',
    '| type | count | % |',
    '|------|------:|--:|',
    ...typeRows,
    '',
    '### Shape (slots preenchidos)',
    '',
    '| combo | count | % |',
    '|-------|------:|--:|',
    ...shapeRows,
    '',
    '### Slots',
    '',
    '| slot | slides com slot | mediana | p90 | máx |',
    '|------|----------------:|--------:|----:|----:|',
    `| items | ${s.slot_stats.items.count} | ${s.slot_stats.items.median} | ${s.slot_stats.items.p90} | ${s.slot_stats.items.max} |`,
    `| steps | ${s.slot_stats.steps.count} | ${s.slot_stats.steps.median} | ${s.slot_stats.steps.p90} | ${s.slot_stats.steps.max} |`,
    `| rows | ${s.slot_stats.rows.count} | ${s.slot_stats.rows.median} | ${s.slot_stats.rows.p90} | ${s.slot_stats.rows.max} |`,
    '',
    '### Explícitos / danger / logic_flow',
    '',
    `| layout_variant explícito | ${s.explicit_layout_variant} (${((s.explicit_layout_variant / totalS) * 100).toFixed(1)}%) |`,
    `| template explícito | ${s.explicit_template} |`,
    `| theme_id explícito | ${s.explicit_theme_id} |`,
    `| danger_zone com items[].correct | ${s.danger_with_correct} |`,
    `| danger_zone items sem correct | ${s.danger_items_without_correct} |`,
    `| logic_flow tap | ${s.logic_flow_tap} |`,
    `| logic_flow auto/omitido | ${s.logic_flow_auto} |`,
    '',
    report.limitations.length ? `## Limitações\n\n${report.limitations.map((l) => `- ${l}`).join('\n')}\n` : '',
  ].join('\n');
}
