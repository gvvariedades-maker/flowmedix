/**
 * Gate premium — barreira única para impedir que uma questão atualizada num pacote
 * premium chegue ao banco com **conteúdo genérico** (stub/hybrid) ou **visual genérico**
 * (molde bespoke do subtópico caindo em fallback por falta do contrato de dados).
 *
 * Usado no chokepoint de escrita (`applyLoteToSupabase`) e na auditoria de catálogo
 * (`scripts/audit-premium-catalog.ts`).
 *
 * @see docs/PACOTE_PREMIUM_CHECKLIST.md · docs/GOLDEN_CONTENT_STANDARD.md
 */
import { getDesignBySubtopic } from '@/components/slides/core/themeGenerator';
import { hasPremiumStubMarkers } from '@/lib/catalogMigration/upgradePremiumHybrid';
import {
  detectDangerGabaritoMismatch,
  detectSlideTopicDrift,
  hasInstructionArtifacts,
} from '@/lib/catalogMigration/slideContract';

export type PremiumGateSeverity = 'error' | 'warn';

export type PremiumGateIssue = {
  code: string;
  severity: PremiumGateSeverity;
  message: string;
  slideType?: string;
};

type SlideLike = Record<string, unknown>;

type QuestaoLike = {
  meta?: { subtopico?: string; topico?: string } & Record<string, unknown>;
  question_data?: { instruction?: string; options?: { id?: string; is_correct?: boolean }[] };
  reverse_study_slides?: unknown;
  study_slides?: unknown;
};

/**
 * Variantes genéricas (tipografia/layout de fallback) — NÃO são moldes bespoke.
 * Um subtópico cujo design usa apenas estas variantes é legitimamente "genérico"
 * e não dispara o contrato premium.
 */
const GENERIC_VARIANTS = new Set<string>([
  'center',
  'compact',
  'minimal',
  'banner',
  'grid',
  'morphological',
  'molecular',
  'bridge',
  'stack',
  'cards',
  'list',
  'vertical',
  'horizontal',
  'compare',
  'reference_table',
]);

function isBespokeVariant(variant: string | undefined): boolean {
  return Boolean(variant) && !GENERIC_VARIANTS.has(variant as string);
}

function slidesOf(q: QuestaoLike): SlideLike[] {
  const s = q.reverse_study_slides ?? q.study_slides;
  return Array.isArray(s) ? (s as SlideLike[]) : [];
}

function findSlide(slides: SlideLike[], type: string): SlideLike | undefined {
  return slides.find((s) => s?.type === type);
}

function hasValidRows(slide: SlideLike | undefined): boolean {
  const rows = slide?.rows;
  return (
    Array.isArray(rows) &&
    rows.some(
      (r) =>
        r &&
        typeof (r as { label?: unknown }).label === 'string' &&
        (r as { label: string }).label.trim().length > 0 &&
        typeof (r as { value?: unknown }).value === 'string' &&
        (r as { value: string }).value.trim().length > 0,
    )
  );
}

function hasItemsWithCorrect(slide: SlideLike | undefined): boolean {
  const items = slide?.items;
  return (
    Array.isArray(items) &&
    items.some(
      (i) =>
        i &&
        typeof (i as { correct?: unknown }).correct === 'string' &&
        (i as { correct: string }).correct.trim().length > 0,
    )
  );
}

function countItems(slide: SlideLike | undefined): number {
  return Array.isArray(slide?.items) ? (slide!.items as unknown[]).length : 0;
}

function countSteps(slide: SlideLike | undefined): number {
  return Array.isArray(slide?.steps) ? (slide!.steps as unknown[]).length : 0;
}

/**
 * Subtópico é "premium" quando seu design tem ao menos um molde bespoke
 * (fora do conjunto de variantes genéricas).
 */
export function isPremiumSubtopico(subtopico: string | undefined): boolean {
  if (!subtopico?.trim()) return false;
  const design = getDesignBySubtopic(subtopico);
  if (!design) return false;
  return (
    isBespokeVariant(design.conceptMap) ||
    isBespokeVariant(design.goldenRule) ||
    isBespokeVariant(design.logicFlow) ||
    isBespokeVariant(design.dangerZone)
  );
}

/**
 * Audita uma questão para o gate premium.
 * - `error`: bloqueia escrita (stub/genérico ou contrato de molde quebrado).
 * - `warn`: não bloqueia, mas registra (ex.: reveal_mode ausente).
 */
export function auditPremiumQuestao(payload: QuestaoLike): PremiumGateIssue[] {
  const issues: PremiumGateIssue[] = [];
  const slides = slidesOf(payload);

  // 1) Conteúdo genérico / stub (qualquer subtópico)
  if (hasPremiumStubMarkers(slides)) {
    issues.push({
      code: 'stub_markers',
      severity: 'error',
      message: 'Slides contêm marcadores genéricos/stub ([IA], "conceito central", etc.).',
    });
  }

  // 2) Contrato de molde bespoke (apenas subtópicos premium)
  const subtopico = payload.meta?.subtopico;
  if (!isPremiumSubtopico(subtopico)) {
    return issues;
  }

  const design = getDesignBySubtopic(subtopico);
  if (!design) return issues;

  if (isBespokeVariant(design.conceptMap)) {
    const slide = findSlide(slides, 'concept_map');
    if (countItems(slide) < 3) {
      issues.push({
        code: 'molde_concept_map_sem_items',
        severity: 'error',
        slideType: 'concept_map',
        message: `concept_map do molde "${design.conceptMap}" exige ≥3 items — fallback genérico evitado.`,
      });
    }
  }

  if (isBespokeVariant(design.goldenRule)) {
    const slide = findSlide(slides, 'golden_rule');
    if (!hasValidRows(slide)) {
      issues.push({
        code: 'molde_golden_rule_sem_rows',
        severity: 'error',
        slideType: 'golden_rule',
        message: `golden_rule do molde "${design.goldenRule}" exige rows (label+value) — sem rows o player cai em layout genérico.`,
      });
    }
  }

  if (isBespokeVariant(design.logicFlow)) {
    const slide = findSlide(slides, 'logic_flow');
    if (countSteps(slide) < 3) {
      issues.push({
        code: 'molde_logic_flow_sem_steps',
        severity: 'error',
        slideType: 'logic_flow',
        message: `logic_flow do molde "${design.logicFlow}" exige ≥3 steps.`,
      });
    } else if ((slide as { reveal_mode?: unknown })?.reveal_mode !== 'tap') {
      issues.push({
        code: 'molde_logic_flow_sem_tap',
        severity: 'warn',
        slideType: 'logic_flow',
        message: `logic_flow do molde "${design.logicFlow}" recomenda reveal_mode: "tap" (interação passo a passo).`,
      });
    }
  }

  if (isBespokeVariant(design.dangerZone)) {
    const slide = findSlide(slides, 'danger_zone');
    if (!hasItemsWithCorrect(slide)) {
      issues.push({
        code: 'molde_danger_zone_sem_correct',
        severity: 'error',
        slideType: 'danger_zone',
        message: `danger_zone do molde "${design.dangerZone}" exige items com "correct" (layout compare/arena) — sem isso cai em layout legado.`,
      });
    }
  }

  // 3) Gate semântico (warn — não bloqueia escrita na fase piloto)
  const instruction = String(payload.question_data?.instruction ?? '').trim();
  const options = payload.question_data?.options;

  if (instruction && hasInstructionArtifacts(instruction)) {
    issues.push({
      code: 'instruction_import_artifacts',
      severity: 'warn',
      message: 'Enunciado contém artefatos de importação (ex.: numeração 2543) 2544)).',
    });
  }

  if (instruction && detectSlideTopicDrift(instruction, slides)) {
    issues.push({
      code: 'slide_topic_drift',
      severity: 'warn',
      message:
        'Slides citam vocabulário IPCS/CVC/bundle sem âncora no enunciado — possível drift pedagógico.',
    });
  }

  const gabaritoCheck = detectDangerGabaritoMismatch(options, slides);
  if (gabaritoCheck.unparseable) {
    issues.push({
      code: 'danger_gabarito_unparseable',
      severity: 'warn',
      slideType: 'danger_zone',
      message: `danger_zone.items[].correct sem letra parseável (gabarito esperado: ${gabaritoCheck.expected}).`,
    });
  } else if (gabaritoCheck.mismatch) {
    issues.push({
      code: 'danger_gabarito_letter_mismatch',
      severity: 'warn',
      slideType: 'danger_zone',
      message: `Letra em danger_zone (${gabaritoCheck.parsed}) ≠ gabarito da questão (${gabaritoCheck.expected}).`,
    });
  }

  return issues;
}

export function premiumGateErrors(payload: QuestaoLike): PremiumGateIssue[] {
  return auditPremiumQuestao(payload).filter((i) => i.severity === 'error');
}

/** Resumo de uma linha para relatórios/CLI. */
export function formatPremiumGateIssues(issues: PremiumGateIssue[]): string {
  return issues.map((i) => `[${i.severity}] ${i.code}: ${i.message}`).join(' | ');
}
