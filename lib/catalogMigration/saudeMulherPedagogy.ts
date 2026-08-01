/**
 * Gramática golden-v1 — Saúde da Mulher (erro reproduzível concept_map ↔ danger_zone).
 * @see docs/GOLDEN_CONTENT_STANDARD.md §5
 * @see data/catalog-migration/saude-da-mulher-pedagogy-errors.json
 */
import { detectSlideTopicDrift } from '@/lib/catalogMigration/slideContract';
import {
  ELIMINATION_STEP_RE,
  EXCETO_COMMAND_RE,
  GABARITO_CONCEPT_LABEL_RE,
  GOLDEN_GABARITO_ROW_RE,
  GOLDEN_VF_VERDICT_RE,
  findSlide,
  itemTexts,
  significantWords,
  slidesOf,
  type SlideLike,
} from '@/lib/catalogMigration/unifiedPedagogyDetector';
import type { GoldenContentLintIssue } from '@/lib/goldenContentStandard';

/** Códigos que bloqueiam [READY] mesmo sem --strict-v2-pedagogy. */
export const MULHER_ALWAYS_ERROR_CODES = new Set([
  'mulher_pegadinha_anchor',
  'mulher_concept_gabarito_spoiler',
  'mulher_danger_mirror',
  'mulher_exceto_semantic',
  'mulher_exceto_coringa',
]);

export function isMulherAlwaysErrorCode(code: string): boolean {
  return MULHER_ALWAYS_ERROR_CODES.has(code);
}

/** Camada v3 mental — `--strict-v3-pedagogy` (superset de v2). */
export const MULHER_V3_ERROR_CODES = new Set([
  'mulher_concept_repro_error',
  'mulher_concept_generic_gestacao',
  'mulher_golden_rows',
  'mulher_golden_vf_judgment',
  'mulher_golden_gabarito_row',
  'mulher_logic_gabarito',
  'mulher_logic_reveal_tap',
  'mulher_logic_elimination',
  'mulher_danger_letter_binding',
  'mulher_guideline_snapshot',
  'mulher_exam_vs_current',
  'mulher_topic_drift',
]);

export function isMulherV3ErrorCode(code: string): boolean {
  return MULHER_V3_ERROR_CODES.has(code);
}

export const MULHER_ERROR_PATTERNS = [
  {
    id: 'prenatal_consultas_4',
    label: 'Mínimo 4 consultas (correto: 6+)',
    re: /4\s+consultas|apenas\s+4|m[ií]nimo\s+de\s+4/i,
  },
  {
    id: 'prenatal_ttgo_1_tri',
    label: 'TTGO no 1º trimestre',
    re: /ttgo|toler[aâ]ncia.*glicose|24\s*[-–]\s*28|1[º°]\s*trimestre.*glic|glicemia.*jejum/i,
  },
  {
    id: 'prenatal_tabagismo_irrelevante',
    label: 'Tabagismo irrelevante na gestação',
    re: /tabag|fumo|cigarro|irrelevante.*gesta/i,
  },
  {
    id: 'parto_ctg_universal',
    label: 'CTG contínuo universal',
    re: /ctg|cardiotocograf|monitoriza[cç][aã]o.*cont[ií]nua|fetal.*todas/i,
  },
  {
    id: 'parto_supina_expulsivo',
    label: 'Supina única no expulsivo',
    re: /supina|dorsal|expulsiv|vertical|lateral|posi[cç][aã]o.*parto/i,
  },
  {
    id: 'parto_clampeamento_imediato',
    label: 'Clampeamento imediato do cordão',
    re: /clampeamento|cord[aã]o\s+umbilical|tardio|imediato/i,
  },
  {
    id: 'papanicolau_inicio_40',
    label: 'Papanicolau início aos 40',
    re: /40\s+anos|in[ií]cio.*40|papanicolau.*40/i,
  },
  {
    id: 'papanicolau_anual_universal',
    label: 'Papanicolau anual universal',
    re: /anual|trienal|3\s+anos|dois\s+exames\s+anuai/i,
  },
  {
    id: 'papanicolau_vacina_dispensa',
    label: 'Vacina HPV dispensa citologia',
    re: /hpv|vacina.*dispens|citologia.*vacina/i,
  },
  {
    id: 'mama_inicio_40',
    label: 'Mamografia início aos 40',
    re: /mamograf|40\s+anos|in[ií]cio.*40/i,
  },
  {
    id: 'mama_anual_universal',
    label: 'Mamografia anual universal',
    re: /bienal|anual.*mama|50\s*[-–]\s*69|2\s+anos/i,
  },
  {
    id: 'mama_autoexame_substituto',
    label: 'Autoexame substitui mamografia',
    re: /autoexame|autopalpa[cç][aã]o|substitui.*mamograf/i,
  },
  {
    id: 'rastreio_so_sintomatica',
    label: 'Rastreio só em sintomáticas',
    re: /sintom[aá]tic|assintom[aá]tic|rastreio.*sintoma/i,
  },
  {
    id: 'puerperio_30_dias',
    label: 'Puerpério até 30 dias',
    re: /puerp[eé]rio|30\s+dias|42\s+dias|lacta[cç][aã]o/i,
  },
  {
    id: 'topic_drift_anatomia',
    label: 'Drift taxonômico anatomia',
    re: /\b(bundle|ipcs|cvc|barreira estéril|corrente sangu[ií]nea)\b/i,
  },
] as const;

const PEGADINHA_ITEM_RE =
  /pegadinha|armadilha|erro\s+reproduz|banca\s+induz|confund|troca|mito|trienal|bienal|ttgo|6\s+consultas|25.?64|50.?69|supina|ctg|clampeamento|tabagismo/i;

const GENERIC_GESTACAO_ONLY_RE =
  /^(pr[eé]-natal|gest[aã]o|sa[uú]de da mulher|consultas de gesta|acompanhamento obst[eé]tr)/i;

/** Estende a base unificada: aceita "item I → verdadeiro" por extenso. */
const ROMAN_JUDGMENT_STEP_RE =
  /\bjulgar\s+(i|ii|iii|iv)\b|\b(i|ii|iii|iv)\s*[-–—].*→\s*(v|f|verdadeiro|falso)\b|\bitem\s+(i|ii|iii|iv)\b.*→\s*(verdadeiro|falso|v|f)/i;

const LETTER_JUDGMENT_STEP_RE =
  /^\s*[a-e]\s*[-–—].*→\s*(fals[oa]|verdadeir[oa])|^\s*letra\s+[a-e]\b.*eliminar/i;

const GESTATION_ANCHOR_RE =
  /\b(gest[aã]o|pr[eé]-natal|parto|puerp[eé]rio|papanicolau|colo|mama|mamografia|rastreio|obst[eé]tr|trabalho de parto|citolog)/i;

function countReasoningEliminationSteps(steps: string[]): number {
  return steps.filter(
    (s) =>
      ELIMINATION_STEP_RE.test(s) ||
      ROMAN_JUDGMENT_STEP_RE.test(s) ||
      LETTER_JUDGMENT_STEP_RE.test(s.trim()),
  ).length;
}

function matchErrorPatterns(text: string): Set<string> {
  const found = new Set<string>();
  for (const p of MULHER_ERROR_PATTERNS) {
    if (p.re.test(text)) found.add(p.id);
  }
  return found;
}

export function inferMulherReproErrorIds(corpus: string): string[] {
  return MULHER_ERROR_PATTERNS.filter((p) => p.re.test(corpus)).map((p) => p.id);
}

export function lintMulherConceptReproError(
  slides: SlideLike[],
  corpus: string,
): GoldenContentLintIssue[] {
  const applicable = inferMulherReproErrorIds(corpus).filter((id) => id !== 'topic_drift_anatomia');
  if (applicable.length === 0) return [];

  const concept = findSlide(slides, 'concept_map');
  const items = itemTexts(concept?.items);
  if (items.length === 0) return [];

  const conceptPatterns = new Set<string>();
  for (const it of items) {
    for (const id of matchErrorPatterns(`${it.label} ${it.detail}`)) {
      conceptPatterns.add(id);
    }
  }

  const matched = applicable.some((id) => conceptPatterns.has(id));
  const hasNamedPegadinha = items.some(
    (it) =>
      /pegadinha|armadilha|erro reproduz/i.test(it.label) &&
      matchErrorPatterns(`${it.label} ${it.detail}`).size > 0,
  );

  if (!matched && !hasNamedPegadinha) {
    const labels = applicable
      .map((id) => MULHER_ERROR_PATTERNS.find((p) => p.id === id)?.label ?? id)
      .join('; ');
    return [
      {
        code: 'mulher_concept_repro_error',
        message: `concept_map deve nomear erro reproduzível do cluster (${labels}) — não só resumo genérico de gestação/rastreio.`,
        path: 'reverse_study_slides.concept_map.items',
      },
    ];
  }

  return [];
}

export function lintMulherConceptPegadinha(slides: SlideLike[]): GoldenContentLintIssue[] {
  const concept = findSlide(slides, 'concept_map');
  const items = itemTexts(concept?.items);
  if (items.length === 0) return [];

  const hasPegadinhaItem = items.some(
    (it) =>
      PEGADINHA_ITEM_RE.test(it.label) ||
      PEGADINHA_ITEM_RE.test(it.detail) ||
      matchErrorPatterns(`${it.label} ${it.detail}`).size > 0,
  );

  if (!hasPegadinhaItem) {
    return [
      {
        code: 'mulher_pegadinha_anchor',
        message:
          'concept_map deve nomear erro reproduzível (item Pegadinha/âncora ou núcleo com armadilha da prova) — não resumo genérico de gestação/rastreio.',
        path: 'reverse_study_slides.concept_map.items',
      },
    ];
  }

  const spoilerItems = items.filter((it) => GABARITO_CONCEPT_LABEL_RE.test(it.label));
  if (spoilerItems.length > 0) {
    return [
      {
        code: 'mulher_concept_gabarito_spoiler',
        message:
          'concept_map não deve ter item "Combinação correta" / gabarito — letra só no logic_flow (golden-v1 v2).',
        path: 'reverse_study_slides.concept_map.items',
      },
    ];
  }

  const onlyGeneric = items.every(
    (it) =>
      !PEGADINHA_ITEM_RE.test(it.label) &&
      !PEGADINHA_ITEM_RE.test(it.detail) &&
      GENERIC_GESTACAO_ONLY_RE.test(it.detail.trim()),
  );
  if (onlyGeneric && items.length >= 3) {
    return [
      {
        code: 'mulher_concept_generic_gestacao',
        message:
          'concept_map parece resumo genérico de gestação/saúde da mulher — enquadrar o caso desta prova.',
        path: 'reverse_study_slides.concept_map',
      },
    ];
  }

  return [];
}

export function lintMulherDangerMirrorsConcept(slides: SlideLike[]): GoldenContentLintIssue[] {
  const concept = findSlide(slides, 'concept_map');
  const danger = findSlide(slides, 'danger_zone');
  const conceptItems = itemTexts(concept?.items);
  const dangerItems = itemTexts(danger?.items);

  if (conceptItems.length === 0 || dangerItems.length === 0) return [];

  const pegadinhaItems = conceptItems.filter(
    (it) =>
      PEGADINHA_ITEM_RE.test(it.label) ||
      PEGADINHA_ITEM_RE.test(it.detail) ||
      /pegadinha|armadilha/i.test(it.label),
  );

  const falsasItems = conceptItems.filter((it) => /\bFALSA\b/i.test(it.detail));

  const anchorCandidates =
    pegadinhaItems.length > 0
      ? pegadinhaItems
      : falsasItems.length > 0
        ? falsasItems
        : conceptItems.filter((it) => matchErrorPatterns(`${it.label} ${it.detail}`).size > 0);

  if (anchorCandidates.length === 0) return [];

  const dangerBlob = dangerItems
    .map((it) => {
      const correct = (danger?.items as Record<string, unknown>[] | undefined)?.find(
        (d) => d.label === it.label,
      );
      return `${it.label} ${it.detail} ${String((correct as { correct?: string })?.correct ?? '')}`;
    })
    .join(' ');

  const dangerPatterns = matchErrorPatterns(dangerBlob);
  const conceptPatterns = new Set<string>();
  for (const it of anchorCandidates) {
    for (const id of matchErrorPatterns(`${it.label} ${it.detail}`)) {
      conceptPatterns.add(id);
    }
  }

  const patternOverlap = [...conceptPatterns].some((id) => dangerPatterns.has(id));
  const anchorWords = anchorCandidates
    .flatMap((it) => significantWords(`${it.label} ${it.detail}`))
    .slice(0, 16);
  const wordOverlap = anchorWords.filter((w) => dangerBlob.toLowerCase().includes(w)).length >= 2;

  if (!patternOverlap && !wordOverlap) {
    return [
      {
        code: 'mulher_danger_mirror',
        message:
          'danger_zone deve espelhar o erro reproduzível do concept_map (mesmo tema/pegadinha em ≥1 item).',
        path: 'reverse_study_slides.danger_zone.items',
      },
    ];
  }

  return [];
}

export function lintMulherGoldenNormative(slides: SlideLike[]): GoldenContentLintIssue[] {
  const golden = findSlide(slides, 'golden_rule');
  const rows = golden?.rows;
  if (!Array.isArray(rows) || rows.length < 2) {
    return [
      {
        code: 'mulher_golden_rows',
        message:
          'golden_rule Saúde da Mulher: preferir rows[] normativos (≥2) — marcos AB 32/INCA/OMS.',
        path: 'reverse_study_slides.golden_rule.rows',
      },
    ];
  }
  return [];
}

export function lintMulherLogicGabaritoPresent(slides: SlideLike[]): GoldenContentLintIssue[] {
  const logic = findSlide(slides, 'logic_flow');
  const steps = Array.isArray(logic?.steps) ? (logic!.steps as unknown[]) : [];
  const blob = steps.map((s) => String(s)).join(' ');
  if (!/\bletra\s+[A-E]\b|marcar\s+[A-E]\b|gabarito/i.test(blob)) {
    return [
      {
        code: 'mulher_logic_gabarito',
        message: 'logic_flow deve localizar gabarito/letra nos steps (único slide com resposta).',
        path: 'reverse_study_slides.logic_flow.steps',
      },
    ];
  }
  return [];
}

function isVfMulher(instruction: string, family?: string): boolean {
  if (/\bexceto\b|incorret[oa]\s+afirmar|é\s+incorret[oa]/i.test(instruction)) {
    return false;
  }
  return (
    family === 'vf' ||
    (family === 'certo_errado' && /\b(i|ii|iii|iv)\s*[-–—]/i.test(instruction)) ||
    /\b(i|ii|iii|iv)\s*[-–—]/i.test(instruction) ||
    /analise as afirmativas|é\s+correto\s+o\s+que\s+se\s+afirma/i.test(instruction)
  );
}

function collectCorpus(payload: {
  question_data?: { instruction?: string };
  reverse_study_slides?: SlideLike[];
  study_slides?: SlideLike[];
}): string {
  const slides = slidesOf(payload);
  const slideText = slides.map((s) => JSON.stringify(s)).join(' ');
  return `${payload.question_data?.instruction ?? ''} ${slideText}`;
}

export function lintMulherGoldenDecoreOnly(slides: SlideLike[]): GoldenContentLintIssue[] {
  const golden = findSlide(slides, 'golden_rule');
  const rows = golden?.rows;
  if (!Array.isArray(rows)) return [];

  const issues: GoldenContentLintIssue[] = [];
  for (const row of rows as Record<string, unknown>[]) {
    const label = String(row.label ?? '');
    const value = String(row.value ?? '');
    if (GOLDEN_GABARITO_ROW_RE.test(label)) {
      issues.push({
        code: 'mulher_golden_gabarito_row',
        message: `golden_rule row "${label}" antecipa gabarito — mover para logic_flow (v3 decore only).`,
        path: 'reverse_study_slides.golden_rule.rows',
      });
    }
    if (GOLDEN_VF_VERDICT_RE.test(value) || GOLDEN_VF_VERDICT_RE.test(label)) {
      issues.push({
        code: 'mulher_golden_vf_judgment',
        message: `golden_rule row "${label}": decore normativo only — sem FALSA/VERDADEIRA ou → letra (julgamento fica no logic_flow).`,
        path: 'reverse_study_slides.golden_rule.rows',
      });
    }
  }
  return issues;
}

export function lintMulherLogicTapElimination(
  payload: {
    meta?: { family?: string };
    question_data?: { instruction?: string; options?: { id: string; is_correct?: boolean }[] };
    reverse_study_slides?: SlideLike[];
    study_slides?: SlideLike[];
  },
): GoldenContentLintIssue[] {
  const slides = slidesOf(payload);
  const logic = findSlide(slides, 'logic_flow');
  if (!logic) return [];

  const issues: GoldenContentLintIssue[] = [];
  if (logic.reveal_mode !== 'tap') {
    issues.push({
      code: 'mulher_logic_reveal_tap',
      message: 'logic_flow Saúde da Mulher v3: reveal_mode "tap" obrigatório (eliminação passo a passo).',
      path: 'reverse_study_slides.logic_flow.reveal_mode',
    });
  }

  const steps = Array.isArray(logic.steps) ? (logic!.steps as unknown[]).map(String) : [];
  const instruction = String(payload.question_data?.instruction ?? '');
  const options = payload.question_data?.options ?? [];
  const wrongIds = options.filter((o) => !o.is_correct).map((o) => o.id);

  if (steps.length === 0) return issues;

  const resolvesLetter = steps.some((s) =>
    /marcar\s+[a-e]|→\s*letra\s+[a-e]|letra\s+[a-e]\b/i.test(s),
  );

  if (isVfMulher(instruction, payload.meta?.family)) {
    const romanSteps = steps.filter(
      (s) =>
        ROMAN_JUDGMENT_STEP_RE.test(s) ||
        /^\s*item\s+(i|ii|iii|iv)\b/i.test(s.trim()) ||
        /^\s*(i|ii|iii|iv)\s*[-–—]/i.test(s.trim()) ||
        /:\s*(verdadeira|falsa)\b/i.test(s),
    ).length;
    if (romanSteps < 2 || !resolvesLetter) {
      issues.push({
        code: 'mulher_logic_elimination',
        message:
          'logic_flow V/F v3: julgar afirmativas I–IV e fechar com letra/combinação — não só narrativa.',
        path: 'reverse_study_slides.logic_flow.steps',
      });
    }
    return issues;
  }

  if (wrongIds.length >= 2) {
    const covered = wrongIds.filter((id) =>
      steps.some((s) => {
        const trimmed = s.trim();
        return (
          (new RegExp(`\\b${id}\\b`, 'i').test(s) && ELIMINATION_STEP_RE.test(s)) ||
          new RegExp(`^\\s*${id}\\s*[-–—].*→\\s*fals`, 'i').test(trimmed) ||
          new RegExp(`^\\s*letra\\s+${id}\\b`, 'i').test(trimmed) ||
          new RegExp(`eliminar.*\\b${id}\\b`, 'i').test(s)
        );
      }),
    ).length;
    const thematicElimination = countReasoningEliminationSteps(steps);
    const minCovered = Math.max(2, Math.ceil(wrongIds.length / 2));
    const okByLetter = covered >= minCovered;
    const okByTheme = thematicElimination >= minCovered && resolvesLetter;
    if (!okByLetter && !okByTheme) {
      issues.push({
        code: 'mulher_logic_elimination',
        message: `logic_flow v3: eliminar distratores (${covered}/${wrongIds.length} por letra; ${thematicElimination} temáticos — mín. ${minCovered}).`,
        path: 'reverse_study_slides.logic_flow.steps',
      });
    }
  }

  return issues;
}

export function lintMulherDangerLetterBinding(
  payload: {
    question_data?: { options?: { id: string; is_correct?: boolean }[] };
    reverse_study_slides?: SlideLike[];
    study_slides?: SlideLike[];
  },
): GoldenContentLintIssue[] {
  const options = payload.question_data?.options ?? [];
  if (options.length < 3) return [];

  const slides = slidesOf(payload);
  const danger = findSlide(slides, 'danger_zone');
  const items = Array.isArray(danger?.items) ? (danger!.items as Record<string, unknown>[]) : [];
  const withCorrect = items.filter((it) => typeof it.correct === 'string' && it.correct.trim());
  if (withCorrect.length === 0) return [];

  const issues: GoldenContentLintIssue[] = [];
  const wrongIds = options.filter((o) => !o.is_correct).map((o) => o.id);

  for (const opt of wrongIds) {
    const bound = withCorrect.some((it) => {
      const label = String(it.label ?? '');
      return new RegExp(`\\b${opt}\\b`, 'i').test(label);
    });
    if (!bound) {
      issues.push({
        code: 'mulher_danger_letter_binding',
        message: `danger_zone: falta item com label ligado à letra ${opt} (compare semântico por alternativa).`,
        path: 'reverse_study_slides.danger_zone.items',
      });
      break;
    }
  }

  return issues;
}

export function lintMulherContentReview(
  payload: {
    meta?: {
      content_review?: {
        guideline_snapshot?: string;
        exam_vs_current?: string;
      };
    };
  },
): GoldenContentLintIssue[] {
  const review = payload.meta?.content_review;
  const issues: GoldenContentLintIssue[] = [];

  if (!review?.guideline_snapshot?.trim()) {
    issues.push({
      code: 'mulher_guideline_snapshot',
      message:
        'meta.content_review.guideline_snapshot obrigatório (ex.: "Caderno AB 32" ou "INCA rastreio colo").',
      path: 'meta.content_review.guideline_snapshot',
    });
  } else if (
    !/ms|minist[eé]rio|inca|oms|caderno\s+ab|pnh|humaniza|201[0-9]|202[0-9]/i.test(review.guideline_snapshot)
  ) {
    issues.push({
      code: 'mulher_guideline_snapshot',
      message: 'guideline_snapshot deve citar fonte tier A (MS/INCA/OMS/Caderno AB) e recência.',
      path: 'meta.content_review.guideline_snapshot',
    });
  }

  if (review?.exam_vs_current === undefined || review.exam_vs_current === null) {
    issues.push({
      code: 'mulher_exam_vs_current',
      message:
        'meta.content_review.exam_vs_current ausente — use "none" ou texto curto se prova diverge do guideline atual.',
      path: 'meta.content_review.exam_vs_current',
    });
  }

  return issues;
}

export function lintMulherTopicDrift(
  payload: {
    question_data?: { instruction?: string };
    reverse_study_slides?: SlideLike[];
    study_slides?: SlideLike[];
  },
): GoldenContentLintIssue[] {
  const instruction = String(payload.question_data?.instruction ?? '');
  const slides = slidesOf(payload);
  const slideText = JSON.stringify(slides);

  if (instruction && detectSlideTopicDrift(instruction, slides)) {
    return [
      {
        code: 'mulher_topic_drift',
        message:
          'Slides citam vocabulário IPCS/CVC/bundle sem âncora no enunciado — gate mulher_topic_drift.',
        path: 'reverse_study_slides',
      },
    ];
  }

  if (
    !GESTATION_ANCHOR_RE.test(instruction) &&
    /\b(bundle|ipcs|cvc|barreira estéril máxima|corrente sanguínea)\b/i.test(slideText)
  ) {
    return [
      {
        code: 'mulher_topic_drift',
        message:
          'Enunciado sem âncora gestacional/ginecológica mas slides usam vocabulário de outro subtópico — reclassificar ou reescrever.',
        path: 'reverse_study_slides',
      },
    ];
  }

  return [];
}

const DISTRACTOR_CORRECT_RE =
  /afirmativa correta|conduta correta|verdadeir|orienta[cç][aã]o correta|eliminar|n[aã]o [ée] o (exceto|gabarito)|rastreio|trienal|bienal|humaniz/i;

const GABARITO_EXCEPTION_RE =
  /incorret[oa]|fals[oa]|mito|exce[cç][aã]o|n[aã]o (adiai|suspende|exige|for[cç]ar)|pegadinha|irrelevante|supina\s+fixa/i;

export function lintMulherExcetoSemantic(
  payload: {
    question_data?: { instruction?: string; options?: { id: string; is_correct?: boolean }[] };
    reverse_study_slides?: SlideLike[];
    study_slides?: SlideLike[];
  },
): GoldenContentLintIssue[] {
  const instruction = String(payload.question_data?.instruction ?? '');
  if (!EXCETO_COMMAND_RE.test(instruction)) return [];

  const options = payload.question_data?.options ?? [];
  const correctOpt = options.find((o) => o.is_correct);
  if (!correctOpt || options.length < 3) return [];

  const slides = slidesOf(payload);
  const danger = findSlide(slides, 'danger_zone');
  const items = Array.isArray(danger?.items) ? (danger!.items as Record<string, unknown>[]) : [];
  const withCorrect = items.filter((it) => typeof it.correct === 'string' && it.correct.trim());

  if (withCorrect.length < options.length - 1) {
    return [
      {
        code: 'mulher_exceto_semantic',
        message:
          'EXCETO/INCORRETA: danger_zone compare — cada alternativa do enunciado precisa items[].correct semântico.',
        path: 'reverse_study_slides.danger_zone.items',
      },
    ];
  }

  const issues: GoldenContentLintIssue[] = [];
  const distractorCorrectTexts: string[] = [];

  for (const opt of options) {
    const item = withCorrect.find((it) => {
      const label = String(it.label ?? '');
      return new RegExp(`(?:Letra|Alt\\.?)\\s*${opt.id}\\b`, 'i').test(label);
    });
    if (!item) continue;

    const correctText = String(item.correct ?? '').trim();
    if (opt.id === correctOpt.id) {
      if (!GABARITO_EXCEPTION_RE.test(correctText)) {
        issues.push({
          code: 'mulher_exceto_semantic',
          message: `Letra ${opt.id} (gabarito): items[].correct deve apontar mito/exceção/falsidade — não conduta correta.`,
          path: 'reverse_study_slides.danger_zone.items',
        });
      }
    } else {
      distractorCorrectTexts.push(correctText);
      if (!DISTRACTOR_CORRECT_RE.test(correctText)) {
        issues.push({
          code: 'mulher_exceto_semantic',
          message: `Letra ${opt.id} (distrator): items[].correct deve explicar por que a alternativa É conduta/afirmativa correta.`,
          path: 'reverse_study_slides.danger_zone.items',
        });
      }
    }
  }

  if (distractorCorrectTexts.length >= 2) {
    const normalized = distractorCorrectTexts.map((t) => t.toLowerCase().replace(/\s+/g, ' ').trim());
    const unique = new Set(normalized);
    if (unique.size === 1) {
      issues.push({
        code: 'mulher_exceto_coringa',
        message:
          'EXCETO/INCORRETA: distratores repetem a mesma justificativa — cada letra errada precisa explicar por que É correta.',
        path: 'reverse_study_slides.danger_zone.items',
      });
    }
  }

  return issues;
}

export function lintSaudeMulherPedagogy(
  payload: {
    meta?: {
      subtopico?: string;
      content_standard?: string;
      family?: string;
      content_review?: {
        guideline_snapshot?: string;
        exam_vs_current?: string;
      };
    };
    question_data?: { instruction?: string; options?: { id: string; is_correct?: boolean }[] };
    reverse_study_slides?: SlideLike[];
    study_slides?: SlideLike[];
  },
  options: { strictV2?: boolean; strictV3?: boolean } = {},
): GoldenContentLintIssue[] {
  if (payload.meta?.subtopico?.trim() !== 'Saúde da Mulher') return [];
  if (payload.meta?.content_standard !== 'golden-v1') return [];

  const strictV3 = options.strictV3 === true;
  const strictV2 = strictV3 || options.strictV2 === true;
  const corpus = collectCorpus(payload);
  const slides = slidesOf(payload);

  const issues: GoldenContentLintIssue[] = [
    ...lintMulherConceptPegadinha(slides),
    ...lintMulherDangerMirrorsConcept(slides),
    ...lintMulherExcetoSemantic(payload),
  ];

  if (strictV2) {
    issues.push(
      ...lintMulherGoldenNormative(slides),
      ...lintMulherLogicGabaritoPresent(slides),
    );
  }

  if (strictV3) {
    issues.push(
      ...lintMulherConceptReproError(slides, corpus),
      ...lintMulherGoldenDecoreOnly(slides),
      ...lintMulherLogicTapElimination(payload),
      ...lintMulherDangerLetterBinding(payload),
      ...lintMulherContentReview(payload),
      ...lintMulherTopicDrift(payload),
    );
  }

  if (!strictV2) {
    return issues.filter((i) => isMulherAlwaysErrorCode(i.code));
  }

  return issues;
}

export function saudeMulherPedagogyHasErrors(issues: GoldenContentLintIssue[]): boolean {
  return issues.length > 0;
}
