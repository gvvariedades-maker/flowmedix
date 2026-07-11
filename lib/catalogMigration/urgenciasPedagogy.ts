/**
 * Gramática golden-v1 — Urgências e Emergências (erro reproduzível concept_map ↔ danger_zone).
 * @see docs/GOLDEN_CONTENT_STANDARD.md §5
 * @see data/catalog-migration/urgencias-pedagogy-errors.json
 */
import type { GoldenContentLintIssue } from '@/lib/goldenContentStandard';
import { detectSlideTopicDrift } from '@/lib/catalogMigration/slideContract';

type SlideLike = Record<string, unknown>;

/** Códigos que bloqueiam [READY] mesmo sem --strict-v2-pedagogy. */
export const URGENCIAS_ALWAYS_ERROR_CODES = new Set([
  'urgencias_pegadinha_anchor',
  'urgencias_concept_gabarito_spoiler',
  'urgencias_danger_mirror',
  'urgencias_exceto_semantic',
  'urgencias_exceto_coringa',
]);

export function isUrgenciasAlwaysErrorCode(code: string): boolean {
  return URGENCIAS_ALWAYS_ERROR_CODES.has(code);
}

/** Camada v3 mental — `--strict-v3-pedagogy` (superset de v2). */
export const URGENCIAS_V3_ERROR_CODES = new Set([
  'urgencias_concept_repro_error',
  'urgencias_concept_generic_sbv',
  'urgencias_golden_rows',
  'urgencias_golden_vf_judgment',
  'urgencias_golden_gabarito_row',
  'urgencias_logic_gabarito',
  'urgencias_logic_reveal_tap',
  'urgencias_logic_elimination',
  'urgencias_danger_letter_binding',
  'urgencias_guideline_snapshot',
  'urgencias_exam_vs_current',
  'urgencias_topic_drift',
]);

export function isUrgenciasV3ErrorCode(code: string): boolean {
  return URGENCIAS_V3_ERROR_CODES.has(code);
}

export const URGENCIAS_ERROR_PATTERNS = [
  {
    id: 'rcp_pulso_cada_ciclo',
    label: 'Checar pulso a cada ciclo 30:2',
    re: /pulso|cada\s+ciclo|2\s*min|troca\s+(de\s+)?socorrista|interromper\s+compress/i,
  },
  {
    id: 'rcp_15_2_adulto',
    label: 'Usar 15:2 em adulto',
    re: /15:2|30:2|propor[cç][aã]o|adulto|pedi[aá]tr|lactente/i,
  },
  {
    id: 'rcp_profundidade_frequencia',
    label: 'Trocar profundidade × frequência RCP',
    re: /5\s*[-–]\s*6\s*cm|100\s*[-–]\s*120|profundidade|frequ[eê]ncia|compress/i,
  },
  {
    id: 'exceto_frase_coringa',
    label: 'EXCETO com frase-coringa',
    re: /incorreta|exceto|afirmativa\s+falsa|conduta\s+errada|imobilizar\s+sem\s+for[cç]ar/i,
  },
  {
    id: 'avc_glasgow_iam',
    label: 'Confundir Cincinnati com Glasgow/IAM',
    re: /cincinnati|fast|face|bra[cç]o|fala|glasgow|iam|men[ií]ngea|avc|derrame/i,
  },
  {
    id: 'trauma_torniquete_pescoco',
    label: 'Torniquete no pescoço / reposicionar à força',
    re: /torniquete|xabcde|hemorrag|imobiliz|fratura|reposicion|pesco[cç]o|trauma/i,
  },
  {
    id: 'queimadura_pasta_caseira',
    label: 'Pasta caseira na queimadura',
    re: /queimadura|pasta\s+de\s+dente|manteiga|gelo|caseir|primeiros\s+socorros|resfriar/i,
  },
  {
    id: 'choque_eletrico_tocar',
    label: 'Tocar antes de desenergizar',
    re: /choque\s+el[eé]tric|corrente|desenergiz|seguran[cç]a\s+da\s+cena|fonte\s+de\s+energia/i,
  },
  {
    id: 'anafilaxia_iv_primeira',
    label: 'Epinefrina IV de rotina',
    re: /anafilax|epinefrina|adrenalina|\bIM\b|\bIV\b|coxa/i,
  },
  {
    id: 'convulsao_boca_objeto',
    label: 'Objeto na boca na convulsão',
    re: /convuls|crise\s+epil[eé]pt|objeto\s+na\s+boca|pano\s+na\s+boca|mand[ií]bula/i,
  },
  {
    id: 'engasgo_heimlich_inconsciente',
    label: 'Heimlich em inconsciente / sinal universal',
    re: /engasg|heimlich|obstru[cç][aã]o|sinal\s+universal|pesco[cç]o|ovace/i,
  },
  {
    id: 'manchester_azul_instavel',
    label: 'Inverter cores Manchester',
    re: /manchester|triagem|etiqueta|vermelho|amarelo|verde|azul|n[aã]o\s+urgente/i,
  },
  {
    id: 'vf_protocolo_inverter_itens',
    label: 'Inverter julgamento V/F I–IV',
    re: /\b(i|ii|iii|iv)\s*[-–—]|sequ[eê]ncia\s+v\/f|julgue\s+os\s+itens/i,
  },
  {
    id: 'topic_drift_ipcs',
    label: 'Vazar vocabulário IPCS/CVC',
    re: /\b(bundle|ipcs|cvc|barreira estéril máxima|corrente sangu[ií]nea)\b/i,
  },
] as const;

const PEGADINHA_ITEM_RE =
  /pegadinha|armadilha|erro\s+reproduz|banca\s+induz|confund|troca|mito|metade\s+verdade|julgar\s+via|xabcde|15:2|30:2|cincinnati|heimlich|manchester/i;

const GENERIC_SBV_ONLY_RE =
  /^(rcp|sbv|urg[eê]ncias|suporte b[aá]sico|emerg[eê]ncia|primeiros socorros)/i;

const GABARITO_CONCEPT_LABEL_RE = /combina[cç][aã]o\s+correta|gabarito\s+letra|^gabarito$/i;

const GOLDEN_VF_VERDICT_RE =
  /\b(falsa|verdadeira|falso|verdadeiro)\s*:|:\s*(v|f)\b|\b(v|f)\s*—|→\s*letra\s+[a-e]/i;

const GOLDEN_GABARITO_ROW_RE = /gabarito|combina[cç][aã]o\s+correta/i;

const ELIMINATION_STEP_RE =
  /\beliminar\b|\btestar\s+[a-e]\b|\bjulgar\s+[a-e]\b|\bletra\s+[a-e]\b.*→|^\s*[a-e]\s*[-–—].*\beliminar\b/i;

const ROMAN_JUDGMENT_STEP_RE =
  /\bjulgar\s+(i|ii|iii|iv)\b|\b(i|ii|iii|iv)\s*[-–—].*→\s*(v|f|verdadeiro|falso)\b|\bitem\s+(i|ii|iii|iv)\b.*→\s*(verdadeiro|falso|v|f)/i;

const ASSERTION_STEP_RE = /asser[cç][aã]o\s+(i|ii)\b|rela[cç][aã]o:/i;

function isAssertionProtocol(instruction: string): boolean {
  return /avalie\s+as\s+asser[cç]/i.test(instruction) || /\bporque\b[\s\S]*\bii\s*[-–—]/i.test(instruction);
}

const LETTER_JUDGMENT_STEP_RE =
  /^\s*[a-e]\s*[-–—].*→\s*(fals[oa]|verdadeir[oa])|^\s*letra\s+[a-e]\b.*eliminar/i;

function countReasoningEliminationSteps(steps: string[]): number {
  return steps.filter(
    (s) =>
      ELIMINATION_STEP_RE.test(s) ||
      ASSERTION_STEP_RE.test(s) ||
      ROMAN_JUDGMENT_STEP_RE.test(s) ||
      LETTER_JUDGMENT_STEP_RE.test(s.trim()),
  ).length;
}

function slidesOf(payload: {
  reverse_study_slides?: SlideLike[];
  study_slides?: SlideLike[];
}): SlideLike[] {
  const s = payload.reverse_study_slides ?? payload.study_slides;
  return Array.isArray(s) ? s : [];
}

function findSlide(slides: SlideLike[], type: string): SlideLike | undefined {
  return slides.find((s) => s.type === type);
}

function itemTexts(items: unknown): { label: string; detail: string }[] {
  if (!Array.isArray(items)) return [];
  return items
    .filter((i) => i && typeof i === 'object')
    .map((i) => {
      const row = i as Record<string, unknown>;
      return {
        label: String(row.label ?? ''),
        detail: String(row.detail ?? ''),
      };
    });
}

function matchErrorPatterns(text: string): Set<string> {
  const found = new Set<string>();
  for (const p of URGENCIAS_ERROR_PATTERNS) {
    if (p.re.test(text)) found.add(p.id);
  }
  return found;
}

export function inferUrgenciasReproErrorIds(corpus: string): string[] {
  return URGENCIAS_ERROR_PATTERNS.filter((p) => p.re.test(corpus)).map((p) => p.id);
}

export function lintUrgenciasConceptReproError(
  slides: SlideLike[],
  corpus: string,
): GoldenContentLintIssue[] {
  const applicable = inferUrgenciasReproErrorIds(corpus).filter((id) => id !== 'topic_drift_ipcs');
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
      .map((id) => URGENCIAS_ERROR_PATTERNS.find((p) => p.id === id)?.label ?? id)
      .join('; ');
    return [
      {
        code: 'urgencias_concept_repro_error',
        message: `concept_map deve nomear erro reproduzível do cluster (${labels}) — não só resumo genérico de urgência.`,
        path: 'reverse_study_slides.concept_map.items',
      },
    ];
  }

  return [];
}

export function lintUrgenciasConceptPegadinha(slides: SlideLike[]): GoldenContentLintIssue[] {
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
        code: 'urgencias_pegadinha_anchor',
        message:
          'concept_map deve nomear erro reproduzível (item Pegadinha/âncora ou núcleo com armadilha da prova) — não resumo genérico de SBV/urgência.',
        path: 'reverse_study_slides.concept_map.items',
      },
    ];
  }

  const spoilerItems = items.filter((it) => GABARITO_CONCEPT_LABEL_RE.test(it.label));
  if (spoilerItems.length > 0) {
    return [
      {
        code: 'urgencias_concept_gabarito_spoiler',
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
      GENERIC_SBV_ONLY_RE.test(it.detail.trim()),
  );
  if (onlyGeneric && items.length >= 3) {
    return [
      {
        code: 'urgencias_concept_generic_sbv',
        message: 'concept_map parece resumo genérico de SBV/urgência — enquadrar o caso desta prova.',
        path: 'reverse_study_slides.concept_map',
      },
    ];
  }

  return [];
}

function significantWords(text: string): string[] {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 5);
}

export function lintUrgenciasDangerMirrorsConcept(slides: SlideLike[]): GoldenContentLintIssue[] {
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
        code: 'urgencias_danger_mirror',
        message:
          'danger_zone deve espelhar o erro reproduzível do concept_map (mesmo tema/pegadinha em ≥1 item).',
        path: 'reverse_study_slides.danger_zone.items',
      },
    ];
  }

  return [];
}

export function lintUrgenciasGoldenNormative(slides: SlideLike[]): GoldenContentLintIssue[] {
  const golden = findSlide(slides, 'golden_rule');
  const rows = golden?.rows;
  if (!Array.isArray(rows) || rows.length < 2) {
    return [
      {
        code: 'urgencias_golden_rows',
        message:
          'golden_rule Urgências: preferir rows[] normativos (≥2) — RCP, XABCDE, triagem, anafilaxia.',
        path: 'reverse_study_slides.golden_rule.rows',
      },
    ];
  }
  return [];
}

export function lintUrgenciasLogicGabaritoPresent(slides: SlideLike[]): GoldenContentLintIssue[] {
  const logic = findSlide(slides, 'logic_flow');
  const steps = Array.isArray(logic?.steps) ? (logic!.steps as unknown[]) : [];
  const blob = steps.map((s) => String(s)).join(' ');
  if (!/\bletra\s+[A-E]\b|marcar\s+[A-E]\b|gabarito/i.test(blob)) {
    return [
      {
        code: 'urgencias_logic_gabarito',
        message: 'logic_flow deve localizar gabarito/letra nos steps (único slide com resposta).',
        path: 'reverse_study_slides.logic_flow.steps',
      },
    ];
  }
  return [];
}

function isVfUrgencias(instruction: string, family?: string): boolean {
  if (/\bexceto\b|incorret[oa]\s+afirmar|é\s+incorret[oa]/i.test(instruction)) {
    return false;
  }
  return (
    family === 'vf' ||
    (family === 'certo_errado' && /\b(i|ii|iii|iv)\s*[-–—]/i.test(instruction)) ||
    /\b(i|ii|iii|iv)\s*[-–—]/i.test(instruction) ||
    /julgue\s+os\s+itens|verdadeira.*falsa|sequência\s+v\/f/i.test(instruction)
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

export function lintUrgenciasGoldenDecoreOnly(slides: SlideLike[]): GoldenContentLintIssue[] {
  const golden = findSlide(slides, 'golden_rule');
  const rows = golden?.rows;
  if (!Array.isArray(rows)) return [];

  const issues: GoldenContentLintIssue[] = [];
  for (const row of rows as Record<string, unknown>[]) {
    const label = String(row.label ?? '');
    const value = String(row.value ?? '');
    if (GOLDEN_GABARITO_ROW_RE.test(label)) {
      issues.push({
        code: 'urgencias_golden_gabarito_row',
        message: `golden_rule row "${label}" antecipa gabarito — mover para logic_flow (v3 decore only).`,
        path: 'reverse_study_slides.golden_rule.rows',
      });
    }
    if (GOLDEN_VF_VERDICT_RE.test(value) || GOLDEN_VF_VERDICT_RE.test(label)) {
      issues.push({
        code: 'urgencias_golden_vf_judgment',
        message: `golden_rule row "${label}": decore normativo only — sem FALSA/VERDADEIRA ou → letra (julgamento fica no logic_flow).`,
        path: 'reverse_study_slides.golden_rule.rows',
      });
    }
  }
  return issues;
}

export function lintUrgenciasLogicTapElimination(
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
      code: 'urgencias_logic_reveal_tap',
      message: 'logic_flow Urgências v3: reveal_mode "tap" obrigatório (eliminação passo a passo).',
      path: 'reverse_study_slides.logic_flow.reveal_mode',
    });
  }

  const steps = Array.isArray(logic.steps) ? (logic!.steps as unknown[]).map(String) : [];
  const instruction = String(payload.question_data?.instruction ?? '');
  const options = payload.question_data?.options ?? [];
  const wrongIds = options.filter((o) => !o.is_correct).map((o) => o.id);

  if (steps.length === 0) return issues;

  const resolvesLetter = steps.some((s) =>
    /marcar\s+[a-e]|→\s*letra\s+[a-e]|sequ[eê]ncia.*letra/i.test(s),
  );

  if (isAssertionProtocol(instruction)) {
    const assertionSteps = steps.filter((s) => ASSERTION_STEP_RE.test(s)).length;
    if (assertionSteps < 2 || !resolvesLetter) {
      issues.push({
        code: 'urgencias_logic_elimination',
        message:
          'logic_flow asserções I/II v3: julgar I, II e relação PORQUE — fechar com letra.',
        path: 'reverse_study_slides.logic_flow.steps',
      });
    }
    return issues;
  }

  if (isVfUrgencias(instruction, payload.meta?.family)) {
    const romanSteps = steps.filter(
      (s) =>
        ROMAN_JUDGMENT_STEP_RE.test(s) ||
        /^\s*item\s+(i|ii|iii|iv)\b/i.test(s.trim()) ||
        /^\s*(i|ii|iii|iv)\s*[-–—]/i.test(s.trim()),
    ).length;
    if (romanSteps < 2 || !resolvesLetter) {
      issues.push({
        code: 'urgencias_logic_elimination',
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
          new RegExp(`^\\s*letra\\s+${id}\\b`, 'i').test(trimmed)
        );
      }),
    ).length;
    const thematicElimination = countReasoningEliminationSteps(steps);
    const minCovered = Math.max(2, Math.ceil(wrongIds.length / 2));
    const okByLetter = covered >= minCovered;
    const okByTheme = thematicElimination >= minCovered && resolvesLetter;
    if (!okByLetter && !okByTheme) {
      issues.push({
        code: 'urgencias_logic_elimination',
        message: `logic_flow v3: eliminar distratores (${covered}/${wrongIds.length} por letra; ${thematicElimination} temáticos — mín. ${minCovered}).`,
        path: 'reverse_study_slides.logic_flow.steps',
      });
    }
  }

  return issues;
}

export function lintUrgenciasDangerLetterBinding(
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
        code: 'urgencias_danger_letter_binding',
        message: `danger_zone: falta item com label ligado à letra ${opt} (compare semântico por alternativa).`,
        path: 'reverse_study_slides.danger_zone.items',
      });
      break;
    }
  }

  return issues;
}

export function lintUrgenciasContentReview(
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
      code: 'urgencias_guideline_snapshot',
      message:
        'meta.content_review.guideline_snapshot obrigatório (ex.: "AHA 2020 SBV" ou "MS/SAMU protocolo").',
      path: 'meta.content_review.guideline_snapshot',
    });
  } else if (
    !/ms|minist[eé]rio|aha|ilcor|samu|sbv|protocolo|manchester|202[0-9]/i.test(review.guideline_snapshot)
  ) {
    issues.push({
      code: 'urgencias_guideline_snapshot',
      message: 'guideline_snapshot deve citar fonte tier A (MS/SAMU/AHA/ILCOR) e recência.',
      path: 'meta.content_review.guideline_snapshot',
    });
  }

  if (review?.exam_vs_current === undefined || review.exam_vs_current === null) {
    issues.push({
      code: 'urgencias_exam_vs_current',
      message:
        'meta.content_review.exam_vs_current ausente — use "none" ou texto curto se prova diverge do guideline atual.',
      path: 'meta.content_review.exam_vs_current',
    });
  }

  return issues;
}

export function lintUrgenciasTopicDrift(
  payload: {
    question_data?: { instruction?: string };
    reverse_study_slides?: SlideLike[];
    study_slides?: SlideLike[];
  },
): GoldenContentLintIssue[] {
  const instruction = String(payload.question_data?.instruction ?? '');
  const slides = slidesOf(payload);
  if (instruction && detectSlideTopicDrift(instruction, slides)) {
    return [
      {
        code: 'urgencias_topic_drift',
        message:
          'Slides citam vocabulário IPCS/CVC/bundle sem âncora no enunciado — gate urgencias_topic_drift.',
        path: 'reverse_study_slides',
      },
    ];
  }
  return [];
}

const EXCETO_COMMAND_RE =
  /\bexceto\b|incorret[oa]\s+afirmar|é\s+incorret[oa]|n[aã]o\s+corresponde\s+(a\s+)?(verdade|realidade)/i;

const DISTRACTOR_CORRECT_RE =
  /afirmativa correta|conduta correta|verdadeir|orienta[cç][aã]o correta|eliminar|n[aã]o [ée] o (exceto|gabarito)|sinal v[aá]lido|n[aã]o [ée] o incorret|imobiliz/i;

const GABARITO_EXCEPTION_RE =
  /incorret[oa]|fals[oa]|mito|exce[cç][aã]o|n[aã]o (adiai|suspende|exige|for[cç]ar)|pegadinha|sem\s+for[cç]ar/i;

export function lintUrgenciasExcetoSemantic(
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
        code: 'urgencias_exceto_semantic',
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
          code: 'urgencias_exceto_semantic',
          message: `Letra ${opt.id} (gabarito): items[].correct deve apontar mito/exceção/falsidade — não conduta correta.`,
          path: 'reverse_study_slides.danger_zone.items',
        });
      }
    } else {
      distractorCorrectTexts.push(correctText);
      if (!DISTRACTOR_CORRECT_RE.test(correctText)) {
        issues.push({
          code: 'urgencias_exceto_semantic',
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
        code: 'urgencias_exceto_coringa',
        message:
          'EXCETO/INCORRETA: distratores repetem a mesma justificativa — cada letra errada precisa explicar por que É correta.',
        path: 'reverse_study_slides.danger_zone.items',
      });
    }
  }

  return issues;
}

export function lintUrgenciasPedagogy(
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
  if (payload.meta?.subtopico?.trim() !== 'Urgências e Emergências') return [];
  if (payload.meta?.content_standard !== 'golden-v1') return [];

  const strictV3 = options.strictV3 === true;
  const strictV2 = strictV3 || options.strictV2 === true;
  const corpus = collectCorpus(payload);
  const slides = slidesOf(payload);

  const issues: GoldenContentLintIssue[] = [
    ...lintUrgenciasConceptPegadinha(slides),
    ...lintUrgenciasDangerMirrorsConcept(slides),
    ...lintUrgenciasExcetoSemantic(payload),
  ];

  if (strictV2) {
    issues.push(
      ...lintUrgenciasGoldenNormative(slides),
      ...lintUrgenciasLogicGabaritoPresent(slides),
    );
  }

  if (strictV3) {
    issues.push(
      ...lintUrgenciasConceptReproError(slides, corpus),
      ...lintUrgenciasGoldenDecoreOnly(slides),
      ...lintUrgenciasLogicTapElimination(payload),
      ...lintUrgenciasDangerLetterBinding(payload),
      ...lintUrgenciasContentReview(payload),
      ...lintUrgenciasTopicDrift(payload),
    );
  }

  if (!strictV2) {
    return issues.filter((i) => isUrgenciasAlwaysErrorCode(i.code));
  }

  return issues;
}

export function urgenciasPedagogyHasErrors(issues: GoldenContentLintIssue[]): boolean {
  return issues.length > 0;
}
