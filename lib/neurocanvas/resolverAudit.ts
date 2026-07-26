import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';

import {
  enrichPresentationContext,
  resolveSlidePresentation,
  type ResolvedSlidePresentation,
} from '@/components/slides/core/slidePresentation';
import { resolveQuestionFamilyId, type FamilyId } from '@/components/slides/core/questionFamily';
import {
  calculateLayoutVariantFromType,
  getLayoutVariantBySubtopic,
} from '@/components/slides/core/themeGenerator';
import {
  getFamilyVisualSlideProfile,
  type FamilySlideType,
} from '@/lib/catalogMigration/familyLayoutProfile';
import { CATALOG_MIGRATION_ROOT } from '@/lib/catalogMigration/paths';
import {
  buildCanonicalCatalog,
  iterateCanonicalQuestions,
  readQuestionJsonFile,
  type CanonicalCatalogResult,
} from '@/lib/neurocanvas/canonicalCatalog';
import { normalizeReverseStudySlide } from '@/lib/reverseStudySlidesNormalize';
import { sortReverseStudySlides } from '@/lib/reverseStudySlideOrder';
import {
  getLayoutVariantForBranch,
  resolvePedagogicalBranch,
  type PedagogicalBranchId,
} from '@/lib/slides/pedagogicalBranch';
import {
  isBespokeLayoutVariant,
  shouldApplySubtopicMold,
  type MoldAffinitySlide,
} from '@/lib/slides/moldAffinity';
import { bespokeMoldHasRenderableSlots } from '@/lib/slides/moldSlotFit';

export type ResolverDecisionKind =
  | 'explicit_json'
  | 'bespoke_affinity'
  | 'family_rotation'
  | 'generic_semantic'
  | 'mold_fallback'
  | 'bespoke_zero_slots';

export type SlideResolverRow = {
  slug: string;
  slide_index: number;
  slide_type: string;
  subtopico?: string;
  pedagogical_branch?: string;
  family_id?: string;
  layout_variant: string;
  decision: ResolverDecisionKind;
  mold_fallback: boolean;
  bespoke_slots_insufficient: boolean;
  subtopic_design_variant?: string;
};

export type ResolverAuditSummary = {
  slides_resolved: number;
  by_decision: Record<ResolverDecisionKind, number>;
  by_layout_variant: Record<string, number>;
  mold_fallback_count: number;
  bespoke_zero_slots_count: number;
  top_layout_variants: { variant: string; count: number; pct: number }[];
  dead_variant_candidates: string[];
};

export type ResolverAuditReport = {
  generated_at: string;
  source: 'visual_anchors' | 'catalog_sample' | 'catalog_full';
  questions_processed: number;
  summary: ResolverAuditSummary;
  rows: SlideResolverRow[];
  limitations: string[];
};

type QuestionJson = {
  meta?: {
    subtopico?: string;
    pedagogical_branch?: string;
    family?: string;
  };
  question_data?: {
    instruction?: string;
    text_fragment?: string;
    options?: { id: string; text: string; is_correct?: boolean }[];
  };
  reverse_study_slides?: unknown[];
  study_slides?: unknown[];
};

const FAMILY_SLIDE_TYPE_MAP: Record<string, FamilySlideType> = {
  concept_map: 'conceptMap',
  golden_rule: 'goldenRule',
  logic_flow: 'logicFlow',
  danger_zone: 'dangerZone',
};

function familySlideKey(slideType: string | undefined): FamilySlideType | null {
  if (!slideType) return null;
  return FAMILY_SLIDE_TYPE_MAP[slideType] ?? null;
}

function resolveSubtopicVariant(
  subtopico: string | undefined,
  slideType: string,
  slide: MoldAffinitySlide,
  branch?: PedagogicalBranchId,
): string | undefined {
  if (subtopico && branch) {
    const fromBranch = getLayoutVariantForBranch(subtopico, slideType, branch);
    if (fromBranch) return fromBranch;
  }
  if (subtopico) {
    return getLayoutVariantBySubtopic(subtopico, slideType, slide);
  }
  return undefined;
}

function classifyDecision(input: {
  slide: MoldAffinitySlide & { layout_variant?: string; type?: string };
  resolved: ResolvedSlidePresentation;
  subtopico?: string;
  branch?: PedagogicalBranchId;
  familyId?: FamilyId;
  slug: string;
  slideIndex: number;
}): { decision: ResolverDecisionKind; subtopicDesignVariant?: string; bespokeSlotsInsufficient: boolean } {
  const { slide, resolved, subtopico, branch, familyId } = input;

  if (slide.layout_variant?.trim()) {
    return { decision: 'explicit_json', bespokeSlotsInsufficient: false };
  }

  if (resolved.moldFallback) {
    return { decision: 'mold_fallback', bespokeSlotsInsufficient: true };
  }

  const subtopicVariant = subtopico
    ? resolveSubtopicVariant(subtopico, slide.type ?? '', slide, branch)
    : undefined;

  const affinityCtx = {
    slideType: slide.type,
    familyId,
    subtopico,
    pedagogicalBranch: branch,
  };

  const subtopicMoldWouldApply =
    Boolean(subtopicVariant) &&
    shouldApplySubtopicMold(subtopicVariant!, slide, affinityCtx) &&
    (!isBespokeLayoutVariant(subtopicVariant!) ||
      bespokeMoldHasRenderableSlots(subtopicVariant!, slide));

  if (
    subtopicVariant &&
    isBespokeLayoutVariant(subtopicVariant) &&
    !bespokeMoldHasRenderableSlots(subtopicVariant, slide)
  ) {
    return {
      decision: 'bespoke_zero_slots',
      subtopicDesignVariant: subtopicVariant,
      bespokeSlotsInsufficient: true,
    };
  }

  if (subtopicMoldWouldApply && isBespokeLayoutVariant(resolved.layoutVariant)) {
    return {
      decision: 'bespoke_affinity',
      subtopicDesignVariant: subtopicVariant,
      bespokeSlotsInsufficient: false,
    };
  }

  const familySlide = familyId ? familySlideKey(slide.type) : null;
  const familyVisual =
    familyId && familySlide
      ? getFamilyVisualSlideProfile(familyId, familySlide)
      : undefined;
  const semantic = calculateLayoutVariantFromType(slide.type ?? '', slide);
  const inFamilyPool =
    familyVisual?.pool?.includes(resolved.layoutVariant) ||
    familyVisual?.anchor === resolved.layoutVariant;

  if (inFamilyPool && !isBespokeLayoutVariant(resolved.layoutVariant)) {
    return { decision: 'family_rotation', bespokeSlotsInsufficient: false };
  }

  if (resolved.layoutVariant === semantic || !isBespokeLayoutVariant(resolved.layoutVariant)) {
    return { decision: 'generic_semantic', bespokeSlotsInsufficient: false };
  }

  return { decision: 'generic_semantic', bespokeSlotsInsufficient: false };
}

function resolveQuestionSlides(
  question: QuestionJson,
  slug: string,
): SlideResolverRow[] {
  const slidesRaw = question.reverse_study_slides ?? question.study_slides;
  if (!Array.isArray(slidesRaw) || slidesRaw.length === 0) return [];

  const meta = question.meta ?? {};
  const qd = question.question_data ?? {};
  const familyId = resolveQuestionFamilyId({
    instruction: qd.instruction,
    subtopico: meta.subtopico,
    options: (qd.options ?? []).map((o) => ({
      id: o.id,
      text: o.text,
      is_correct: o.is_correct ?? false,
    })),
    textFragment: qd.text_fragment,
    metaFamily: meta.family as FamilyId | undefined,
  });

  const sorted = sortReverseStudySlides(
    slidesRaw.map((s) => normalizeReverseStudySlide(s)) as { type?: string }[],
  ) as (MoldAffinitySlide & {
    layout_variant?: string;
    type?: string;
    meta?: { subtopico?: string };
    rows?: { label: string; value: string }[];
  })[];

  const branch = resolvePedagogicalBranch(
    meta.subtopico,
    qd.instruction ?? '',
    sorted,
    meta.pedagogical_branch,
    familyId,
  );

  const rows: SlideResolverRow[] = [];

  sorted.forEach((slide, slideIndex) => {
    const presentationContext = enrichPresentationContext(
      {
        questionSlug: slug,
        slideIndex,
        jsonLayoutVariant: slide.layout_variant,
        familyId,
      },
      slide.meta,
      qd.instruction,
      sorted,
      {
        subtopico: meta.subtopico,
        pedagogical_branch: meta.pedagogical_branch,
      },
    );

    const resolved = resolveSlidePresentation(slide, presentationContext);
    const { decision, subtopicDesignVariant, bespokeSlotsInsufficient } = classifyDecision({
      slide,
      resolved,
      subtopico: meta.subtopico,
      branch,
      familyId,
      slug,
      slideIndex,
    });

    rows.push({
      slug,
      slide_index: slideIndex,
      slide_type: String(slide.type ?? 'unknown'),
      subtopico: meta.subtopico,
      pedagogical_branch: branch,
      family_id: familyId,
      layout_variant: resolved.layoutVariant,
      decision,
      mold_fallback: Boolean(resolved.moldFallback),
      bespoke_slots_insufficient: bespokeSlotsInsufficient,
      subtopic_design_variant: subtopicDesignVariant,
    });
  });

  return rows;
}

type VisualAnchorsFile = {
  anchors: Record<
    string,
    { pedagogical_branch: string; slug: string; lote: string; json_path: string }
  >;
};

export function loadVisualAnchorQuestions(): { slug: string; path: string }[] {
  const anchorsPath = resolve(CATALOG_MIGRATION_ROOT, '../catalog-migration/visual-anchors.json');
  const fixed = resolve(process.cwd(), 'data/catalog-migration/visual-anchors.json');
  const path = existsSync(fixed) ? fixed : anchorsPath;
  if (!existsSync(path)) return [];

  const file = JSON.parse(readFileSync(path, 'utf8')) as VisualAnchorsFile;
  return Object.values(file.anchors).map((a) => ({
    slug: a.slug,
    path: resolve(process.cwd(), a.json_path),
  }));
}

export type ResolverAuditOptions = {
  mode: 'anchors' | 'catalog';
  limit?: number;
  /** Seleção canônica determinística no modo catalog (padrão). */
  canonical?: boolean;
  strict?: boolean;
};

export function buildResolverAuditReport(options: ResolverAuditOptions): ResolverAuditReport {
  const limitations: string[] = [];
  const rows: SlideResolverRow[] = [];
  let questionsProcessed = 0;

  if (options.mode === 'anchors') {
    const anchors = loadVisualAnchorQuestions();
    for (const { slug, path } of anchors) {
      if (options.limit && questionsProcessed >= options.limit) break;
      if (!existsSync(path)) {
        limitations.push(`Anchor missing: ${path}`);
        continue;
      }
      const question = JSON.parse(readFileSync(path, 'utf8')) as QuestionJson;
      rows.push(...resolveQuestionSlides(question, slug));
      questionsProcessed += 1;
    }
  } else {
    const useCanonical = options.canonical !== false;
    let catalog: CanonicalCatalogResult | undefined;

    const processFile = (slug: string, filePath: string) => {
      if (options.limit && questionsProcessed >= options.limit) return;
      let question: QuestionJson;
      try {
        question = readQuestionJsonFile(filePath) as QuestionJson;
      } catch {
        limitations.push(`JSON inválido: ${filePath}`);
        return;
      }
      rows.push(...resolveQuestionSlides(question, slug));
      questionsProcessed += 1;
    };

    if (useCanonical) {
      catalog = buildCanonicalCatalog({ strict: options.strict });
      iterateCanonicalQuestions(processFile, catalog);
    } else {
      const seen = new Set<string>();
      const walk = (dir: string): void => {
        if (!existsSync(dir)) return;
        for (const ent of readdirSync(dir, { withFileTypes: true })) {
          const p = join(dir, ent.name);
          if (ent.isDirectory()) {
            if (ent.name === 'questions') {
              for (const f of readdirSync(p)) {
                if (!f.endsWith('.json')) continue;
                const slug = f.replace(/\.json$/, '');
                if (seen.has(slug)) continue;
                seen.add(slug);
                processFile(slug, join(p, f));
              }
            } else {
              walk(p);
            }
          }
        }
      };
      walk(CATALOG_MIGRATION_ROOT);
      limitations.push('Modo filesystem_first — não determinístico entre OS.');
    }
  }

  const byDecision = {
    explicit_json: 0,
    bespoke_affinity: 0,
    family_rotation: 0,
    generic_semantic: 0,
    mold_fallback: 0,
    bespoke_zero_slots: 0,
  } satisfies Record<ResolverDecisionKind, number>;

  const byLayout: Record<string, number> = {};
  let moldFallbackCount = 0;
  let bespokeZeroSlots = 0;

  for (const row of rows) {
    byDecision[row.decision] += 1;
    byLayout[row.layout_variant] = (byLayout[row.layout_variant] ?? 0) + 1;
    if (row.mold_fallback) moldFallbackCount += 1;
    if (row.bespoke_slots_insufficient) bespokeZeroSlots += 1;
  }

  const total = rows.length || 1;
  const topLayout = Object.entries(byLayout)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 25)
    .map(([variant, count]) => ({
      variant,
      count,
      pct: Math.round((count / total) * 1000) / 10,
    }));

  const usedVariants = new Set(Object.keys(byLayout));
  const deadCandidates: string[] = [];
  const routerFiles = [
    'components/slides/core/NeuroSlide.tsx',
    'components/slides/variants/ConceptMap.tsx',
    'components/slides/variants/GoldenRule.tsx',
    'components/slides/variants/LogicFlow.tsx',
    'components/slides/variants/DangerZone.tsx',
  ];
  const routerCorpus = routerFiles
    .map((rel) => resolve(process.cwd(), rel))
    .filter((p) => existsSync(p))
    .map((p) => readFileSync(p, 'utf8'))
    .join('\n');

  if (routerCorpus.length > 0) {
    for (const variant of usedVariants) {
      if (
        isBespokeLayoutVariant(variant) &&
        !routerCorpus.includes(`'${variant}'`) &&
        !routerCorpus.includes(`"${variant}"`) &&
        !routerCorpus.includes(`layoutVariant === '${variant}'`)
      ) {
        deadCandidates.push(variant);
      }
    }
  }

  return {
    generated_at: new Date().toISOString(),
    source: options.mode === 'anchors' ? 'visual_anchors' : options.limit ? 'catalog_sample' : 'catalog_full',
    questions_processed: questionsProcessed,
    summary: {
      slides_resolved: rows.length,
      by_decision: byDecision,
      by_layout_variant: byLayout,
      mold_fallback_count: moldFallbackCount,
      bespoke_zero_slots_count: bespokeZeroSlots,
      top_layout_variants: topLayout,
      dead_variant_candidates: deadCandidates.sort(),
    },
    rows,
    limitations,
  };
}

export function renderResolverAuditMarkdown(report: ResolverAuditReport): string {
  const s = report.summary;
  const total = s.slides_resolved || 1;
  const pct = (n: number) => `${((n / total) * 100).toFixed(1)}%`;

  const decisionRows = (Object.entries(s.by_decision) as [ResolverDecisionKind, number][])
    .sort((a, b) => b[1] - a[1])
    .map(([k, v]) => `| ${k} | ${v} | ${pct(v)} |`);

  const layoutRows = s.top_layout_variants
    .map((r) => `| ${r.variant} | ${r.count} | ${r.pct}% |`);

  return [
    '# NeuroCanvas — auditoria resolveSlidePresentation',
    '',
    `Gerado em: ${report.generated_at}`,
    `Fonte: ${report.source}`,
    `Questões: ${report.questions_processed}`,
    `Slides resolvidos: ${s.slides_resolved}`,
    '',
    '## Decisões',
    '',
    '| kind | count | % |',
    '|------|------:|--:|',
    ...decisionRows,
    '',
    `mold_fallback (flag): ${s.mold_fallback_count}`,
    `bespoke zero slots (pré-fallback): ${s.bespoke_zero_slots_count}`,
    '',
    '## Top layout_variant',
    '',
    '| variant | count | % |',
    '|---------|------:|--:|',
    ...layoutRows,
    '',
    s.dead_variant_candidates.length
      ? `## Variantes bespoke resolvidas sem rota nos routers (${s.dead_variant_candidates.length})\n\n${s.dead_variant_candidates.map((v) => `- ${v}`).join('\n')}\n`
      : '',
    report.limitations.length
      ? `## Limitações\n\n${report.limitations.map((l) => `- ${l}`).join('\n')}\n`
      : '',
  ].join('\n');
}
