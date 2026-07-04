/**
 * Gramática golden-v1 — Vias de Administração (erro reproduzível concept_map ↔ danger_zone).
 * @see docs/GOLDEN_CONTENT_STANDARD.md §5
 * @see data/catalog-migration/vias-pedagogy-errors.json
 */
import { extractNumericClaims } from '@/lib/catalogMigration/numericFactcheck';
import type { ContentSource, GoldenContentLintIssue } from '@/lib/goldenContentStandard';
import { CUIDADOS_ADMIN_COFEN, VIAS_ADMINISTRACAO_COFEN } from '@/lib/guidelines';

type SlideLike = Record<string, unknown>;

/** Dose, ângulo ou volume no enunciado/slides — exige fonte COFEN + snapshot técnico. */
export const VIAS_NUMERIC_TECHNICAL_RE =
  /\bdose[s]?\b|doses?\s+grande|\bvolume\b|\d+\s*m[lL]\b|ângulo|\bangulo|\d+\s*°|\d+\s*graus|pun[cç][aã]o|deltoide|at[eé]\s+\d+\s*m[lL]/i;

/** Códigos que bloqueiam [READY] mesmo sem --strict-v2-pedagogy. */
export const VIAS_ALWAYS_ERROR_CODES = new Set([
  'vias_pegadinha_anchor',
  'vias_concept_gabarito_spoiler',
  'vias_danger_mirror',
  'vias_exceto_semantic',
  'vias_exceto_coringa',
]);

export function isViasAlwaysErrorCode(code: string): boolean {
  return VIAS_ALWAYS_ERROR_CODES.has(code);
}

/** Camada v3 mental — `--strict-v3-pedagogy` (superset de v2). */
export const VIAS_V3_ERROR_CODES = new Set([
  'vias_concept_generic_farmacologia',
  'vias_concept_repro_error',
  'vias_golden_rows',
  'vias_golden_vf_judgment',
  'vias_golden_gabarito_row',
  'vias_logic_gabarito',
  'vias_logic_reveal_tap',
  'vias_logic_elimination',
  'vias_danger_letter_binding',
  'vias_exam_vs_current',
  'vias_guideline_snapshot',
]);

export function isViasV3ErrorCode(code: string): boolean {
  return VIAS_V3_ERROR_CODES.has(code);
}

export const VIAS_ERROR_PATTERNS = [
  {
    id: 'inverter_velocidade_im_sc',
    label: 'Inverter velocidade IM × SC',
    re: /im\s+mais\s+lent|mais\s+lent.*subcut|menor\s+vasculariza|m[uú]sculo.*menos\s+vascular|sc\s+mais\s+r[aá]pid.*im/i,
  },
  {
    id: 'lista_parenteral_incompleta',
    label: 'Lista parenteral incompleta ou com rota não clássica',
    re: /endotraqueal|intratecal|intraperitoneal|intra[oó]ssea|lista.*parenteral|parenteral.*cl[aá]ssic/i,
  },
  {
    id: 'sublingual_irritante',
    label: 'Sublingual indicada para irritantes',
    re: /sublingual.*irritant|irritant.*sublingual|mucosa\s+g[aá]strica.*sublingual/i,
  },
  {
    id: 'retal_sempre_figado',
    label: 'Retal sempre passa pelo fígado',
    re: /retal.*f[ií]gado|f[ií]gado.*retal|biotransforma.*retal|n[aã]o\s+atinge.*circula[cç][aã]o\s+sist[eê]mica/i,
  },
  {
    id: 'vo_estomago_pico',
    label: 'Absorção oral só no estômago',
    re: /intestino\s+delgado|est[oô]mago.*absor|oral.*delgado|principalmente\s+no\s+delgado/i,
  },
  {
    id: 'perfil_iv_imediato',
    label: 'Confundir perfil IV imediato com IM/SC/VO',
    re: /iv\s+imediata|intravenos.*imediata|100%\s+biodispon|trilho.*iv|perfil.*iv/i,
  },
  {
    id: 'ventrogluteo_inseguro',
    label: 'Ventroglúteo como sítio inseguro',
    re: /ventrogl[uú]teo|gl[uú]teo\s+m[eé]dio|menos\s+recomendado.*gl[uú]teo/i,
  },
  {
    id: 'angulo_im_errado',
    label: 'Ângulo de punção IM incorreto',
    re: /ângulo.*90|90\s*°|45\s*°|ângulo.*pun[cç][aã]o|graus.*im/i,
  },
  {
    id: 'nervo_ciatico_gluteo',
    label: 'Punção no glúteo sem citar nervo ciático',
    re: /nervo\s+ci[aá]tico|dorsogl[uú]te|marcos\s+[oó]sseos/i,
  },
  {
    id: 'volume_sc_alto',
    label: 'SC para doses grandes ou efeito rápido',
    re: /dose.*grande|volume.*sc|alta\s+press[aã]o|efeito\s+r[aá]pido.*sc/i,
  },
  {
    id: 'sc_absorcao_rapida',
    label: 'SC para absorção rápida',
    re: /absor[cç][aã]o\s+r[aá]pida|rapidamente.*corrente|lenta\s+e\s+cont[ií]nua/i,
  },
  {
    id: 'viscosidade_sc',
    label: 'Alta viscosidade como critério SC',
    re: /viscosidade|alta\s+viscosidade/i,
  },
  {
    id: 'exceto_coringa',
    label: 'EXCETO com frase-coringa',
    re: /incorreta|exceto|afirmativa\s+falsa|mito|conduta\s+errada/i,
  },
  {
    id: 'vf_im_sem_julgamento',
    label: 'V/F IM sem julgar I–IV',
    re: /\b(i|ii|iii|iv)\s*[-–—]|julgar\s+(i|ii|iii|iv)|afirmativas?\s+a\s+seguir|é\s+correto\s+o\s+que/i,
  },
] as const;

const PEGADINHA_ITEM_RE =
  /pegadinha|armadilha|erro\s+reproduz|banca\s+induz|confund|troca|mito|trilho|perfil\s+de\s+via|inverte|lista\s+incompleta|via\s+errada/i;

const GENERIC_FARMACO_ONLY_RE =
  /^(farmacologia|farmaco|medicamento|administra[cç][aã]o\s+de\s+medicamento|vias?\s+de\s+administra[cç][aã]o)/i;

const GABARITO_CONCEPT_LABEL_RE = /combina[cç][aã]o\s+correta|gabarito\s+letra|^gabarito$/i;

const GOLDEN_VF_VERDICT_RE =
  /\b(falsa|verdadeira|falso|verdadeiro)\s*:|:\s*(v|f)\b|\b(v|f)\s*—|→\s*letra\s+[a-e]/i;

const GOLDEN_GABARITO_ROW_RE = /gabarito|combina[cç][aã]o\s+correta/i;

const ELIMINATION_STEP_RE =
  /\beliminar\b|\btestar\s+[a-e]\b|\bjulgar\s+[a-e]\b|\bletra\s+[a-e]\b.*→|^\s*[a-e]\s*[-–—].*\beliminar\b/i;

const ROMAN_JUDGMENT_STEP_RE = /\bjulgar\s+(i|ii|iii|iv)\b|\b(i|ii|iii|iv)\s*[-–—].*→\s*(v|f)\b/i;

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
  for (const p of VIAS_ERROR_PATTERNS) {
    if (p.re.test(text)) found.add(p.id);
  }
  return found;
}

/** Infere erros ROI da banca aplicáveis ao enunciado + slides. */
export function inferViasReproErrorIds(corpus: string): string[] {
  return VIAS_ERROR_PATTERNS.filter((p) => p.re.test(corpus)).map((p) => p.id);
}

/** concept_map v3: erro ROI do cluster nomeado (mapa vias-pedagogy-errors.json). */
export function lintViasConceptReproError(
  slides: SlideLike[],
  corpus: string,
): GoldenContentLintIssue[] {
  const applicable = inferViasReproErrorIds(corpus);
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
      /pegadinha|armadilha|erro reproduz|padrão|trilho/i.test(it.label) &&
      matchErrorPatterns(`${it.label} ${it.detail}`).size > 0,
  );

  if (!matched && !hasNamedPegadinha) {
    const labels = applicable
      .map((id) => VIAS_ERROR_PATTERNS.find((p) => p.id === id)?.label ?? id)
      .join('; ');
    return [
      {
        code: 'vias_concept_repro_error',
        message: `concept_map deve nomear erro reproduzível do cluster (${labels}) — não só contexto genérico de farmacologia.`,
        path: 'reverse_study_slides.concept_map.items',
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

/** concept_map: enquadramento da prova + item que nomeia erro reproduzível. */
export function lintViasConceptPegadinha(slides: SlideLike[]): GoldenContentLintIssue[] {
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
        code: 'vias_pegadinha_anchor',
        message:
          'concept_map deve nomear erro reproduzível (trilho/pegadinha/âncora ou núcleo com armadilha da prova) — não resumo genérico de vias.',
        path: 'reverse_study_slides.concept_map.items',
      },
    ];
  }

  const spoilerItems = items.filter((it) => GABARITO_CONCEPT_LABEL_RE.test(it.label));
  if (spoilerItems.length > 0) {
    return [
      {
        code: 'vias_concept_gabarito_spoiler',
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
      GENERIC_FARMACO_ONLY_RE.test(it.detail.trim()),
  );
  if (onlyGeneric && items.length >= 3) {
    return [
      {
        code: 'vias_concept_generic_farmacologia',
        message: 'concept_map parece resumo genérico de farmacologia — enquadrar o caso desta prova.',
        path: 'reverse_study_slides.concept_map',
      },
    ];
  }

  return [];
}

/** danger_zone espelha o erro nomeado no concept_map. */
export function lintViasDangerMirrorsConcept(slides: SlideLike[]): GoldenContentLintIssue[] {
  const concept = findSlide(slides, 'concept_map');
  const danger = findSlide(slides, 'danger_zone');
  const conceptItems = itemTexts(concept?.items);
  const dangerItems = itemTexts(danger?.items);

  if (conceptItems.length === 0 || dangerItems.length === 0) return [];

  const pegadinhaItems = conceptItems.filter(
    (it) =>
      PEGADINHA_ITEM_RE.test(it.label) ||
      PEGADINHA_ITEM_RE.test(it.detail) ||
      /pegadinha|armadilha|padrão|trilho/i.test(it.label),
  );

  const falsasItems = conceptItems.filter((it) => /\bFALSA\b|\bFALSO\b/i.test(it.detail));

  const errorAnchors = conceptItems.filter(
    (it) => matchErrorPatterns(`${it.label} ${it.detail}`).size > 0,
  );

  const anchorCandidates =
    pegadinhaItems.length > 0
      ? [
          ...pegadinhaItems,
          ...errorAnchors.filter((e) => !pegadinhaItems.some((p) => p.label === e.label)),
        ]
      : falsasItems.length > 0
        ? falsasItems
        : errorAnchors;

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

  const wordOverlap = anchorCandidates.some((it) => {
    const words = significantWords(`${it.label} ${it.detail}`).slice(0, 12);
    return words.filter((w) => dangerBlob.toLowerCase().includes(w)).length >= 2;
  });

  if (!patternOverlap && !wordOverlap) {
    return [
      {
        code: 'vias_danger_mirror',
        message:
          'danger_zone deve espelhar o erro reproduzível do concept_map (mesmo tema/pegadinha em ≥1 item).',
        path: 'reverse_study_slides.danger_zone.items',
      },
    ];
  }

  return [];
}

/** golden_rule: decore normativo com rows (velocidade, volumes, sítios). */
export function lintViasGoldenNormative(slides: SlideLike[]): GoldenContentLintIssue[] {
  const golden = findSlide(slides, 'golden_rule');
  const rows = golden?.rows;
  if (!Array.isArray(rows) || rows.length < 2) {
    return [
      {
        code: 'vias_golden_rows',
        message:
          'golden_rule Vias: preferir rows[] normativos (≥2) — velocidade IV/IM/SC/VO, volumes, sítios, ângulos.',
        path: 'reverse_study_slides.golden_rule.rows',
      },
    ];
  }
  return [];
}

/** logic_flow: gabarito/letra deve aparecer nos steps (único lugar permitido). */
export function lintViasLogicGabaritoPresent(slides: SlideLike[]): GoldenContentLintIssue[] {
  const logic = findSlide(slides, 'logic_flow');
  const steps = Array.isArray(logic?.steps) ? (logic!.steps as unknown[]) : [];
  const blob = steps.map((s) => String(s)).join(' ');
  if (!/\bletra\s+[A-E]\b|marcar\s+[A-E]\b|gabarito/i.test(blob)) {
    return [
      {
        code: 'vias_logic_gabarito',
        message: 'logic_flow deve localizar gabarito/letra nos steps (único slide com resposta).',
        path: 'reverse_study_slides.logic_flow.steps',
      },
    ];
  }
  return [];
}

function isVfVias(instruction: string, family?: string): boolean {
  if (/\bexceto\b|incorret[oa]\s+afirmar|é\s+incorret[oa]/i.test(instruction)) {
    return false;
  }
  return (
    family === 'vf' ||
    (family === 'certo_errado' && /\b(i|ii|iii|iv)\s*[-–—]/i.test(instruction)) ||
    /\b(i|ii|iii|iv)\s*[-–—]/i.test(instruction) ||
    /julgue\s+os\s+itens|verdadeira.*falsa|é\s+correto\s+o\s+que/i.test(instruction)
  );
}

function collectCorpus(payload: {
  question_data?: {
    instruction?: string;
    options?: { text?: string; id?: string; is_correct?: boolean }[];
  };
  reverse_study_slides?: SlideLike[];
  study_slides?: SlideLike[];
}): string {
  const slides = slidesOf(payload);
  const slideText = slides.map((s) => JSON.stringify(s)).join(' ');
  const optionsText = (payload.question_data?.options ?? []).map((o) => o.text ?? '').join(' ');
  return `${payload.question_data?.instruction ?? ''} ${optionsText} ${slideText}`;
}

/** golden_rule v3: só decore normativo — sem julgamento V/F ou gabarito na tabela. */
export function lintViasGoldenDecoreOnly(slides: SlideLike[]): GoldenContentLintIssue[] {
  const golden = findSlide(slides, 'golden_rule');
  const rows = golden?.rows;
  if (!Array.isArray(rows)) return [];

  const issues: GoldenContentLintIssue[] = [];
  for (const row of rows as Record<string, unknown>[]) {
    const label = String(row.label ?? '');
    const value = String(row.value ?? '');
    if (GOLDEN_GABARITO_ROW_RE.test(label)) {
      issues.push({
        code: 'vias_golden_gabarito_row',
        message: `golden_rule row "${label}" antecipa gabarito — mover para logic_flow (v3 decore only).`,
        path: 'reverse_study_slides.golden_rule.rows',
      });
    }
    if (GOLDEN_VF_VERDICT_RE.test(value) || GOLDEN_VF_VERDICT_RE.test(label)) {
      issues.push({
        code: 'vias_golden_vf_judgment',
        message: `golden_rule row "${label}": decore normativo only — sem FALSA/VERDADEIRA ou → letra (julgamento fica no logic_flow).`,
        path: 'reverse_study_slides.golden_rule.rows',
      });
    }
  }
  return issues;
}

/** logic_flow v3: reveal_mode tap + eliminação por distrator (MCQ) ou julgamento I–IV (VF). */
export function lintViasLogicTapElimination(
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
      code: 'vias_logic_reveal_tap',
      message: 'logic_flow Vias v3: reveal_mode "tap" obrigatório (eliminação passo a passo).',
      path: 'reverse_study_slides.logic_flow.reveal_mode',
    });
  }

  const steps = Array.isArray(logic.steps) ? (logic!.steps as unknown[]).map(String) : [];
  const instruction = String(payload.question_data?.instruction ?? '');
  const options = payload.question_data?.options ?? [];
  const wrongIds = options.filter((o) => !o.is_correct).map((o) => o.id);

  if (steps.length === 0) return issues;

  if (isVfVias(instruction, payload.meta?.family)) {
    const romanSteps = steps.filter(
      (s) =>
        ROMAN_JUDGMENT_STEP_RE.test(s) || /^\s*(i|ii|iii|iv)\s*[-–—]/i.test(s.trim()),
    ).length;
    const resolvesLetter = steps.some((s) =>
      /marcar\s+[a-e]|→\s*letra\s+[a-e]|sequ[eê]ncia.*letra/i.test(s),
    );
    if (romanSteps < 2 || !resolvesLetter) {
      issues.push({
        code: 'vias_logic_elimination',
        message:
          'logic_flow V/F v3: julgar afirmativas I–IV e fechar com letra/combinação — não só narrativa.',
        path: 'reverse_study_slides.logic_flow.steps',
      });
    }
    return issues;
  }

  if (wrongIds.length >= 2) {
    const covered = wrongIds.filter((id) =>
      steps.some((s) => new RegExp(`\\b${id}\\b`, 'i').test(s) && ELIMINATION_STEP_RE.test(s)),
    ).length;
    const minCovered = Math.max(2, Math.ceil(wrongIds.length / 2));
    if (covered < minCovered) {
      issues.push({
        code: 'vias_logic_elimination',
        message: `logic_flow v3: eliminar distratores por letra (${covered}/${wrongIds.length} com passo de eliminação — mín. ${minCovered}).`,
        path: 'reverse_study_slides.logic_flow.steps',
      });
    }
  }

  return issues;
}

/** danger_zone v3: items[].correct ligados à letra A–E quando há compare. */
export function lintViasDangerLetterBinding(
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
        code: 'vias_danger_letter_binding',
        message: `danger_zone: falta item com label ligado à letra ${opt} (compare semântico por alternativa).`,
        path: 'reverse_study_slides.danger_zone.items',
      });
      break;
    }
  }

  return issues;
}

/** content_review v3: guideline_snapshot + exam_vs_current explícito. */
export function lintViasContentReview(
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
      code: 'vias_guideline_snapshot',
      message:
        'meta.content_review.guideline_snapshot obrigatório (ex.: "Potter/Perry — administração de medicamentos").',
      path: 'meta.content_review.guideline_snapshot',
    });
  } else if (
    !/potter|perry|cofen|farmacocin|farmaco|enfermagem|manual|anvisa|ms\//i.test(
      review.guideline_snapshot,
    )
  ) {
    issues.push({
      code: 'vias_guideline_snapshot',
      message: 'guideline_snapshot deve citar fonte tier A/B (Potter/Perry, COFEN, referência técnica).',
      path: 'meta.content_review.guideline_snapshot',
    });
  }

  if (review?.exam_vs_current === undefined || review.exam_vs_current === null) {
    issues.push({
      code: 'vias_exam_vs_current',
      message:
        'meta.content_review.exam_vs_current ausente — use "none" ou texto curto se prova diverge da referência atual.',
      path: 'meta.content_review.exam_vs_current',
    });
  }

  return issues;
}

const EXCETO_COMMAND_RE =
  /\bexceto\b|alternativa\s+incorreta|incorret[oa]\s+afirmar|é\s+incorret[oa]|n[aã]o\s+corresponde\s+(a\s+)?(verdade|realidade)/i;

const DISTRACTOR_CORRECT_RE =
  /afirmativa correta|conduta correta|verdadeir|orienta[cç][aã]o correta|eliminar|n[aã]o [ée] o (exceto|gabarito)|sinal v[aá]lido|n[aã]o [ée] o incorret/i;

const GABARITO_EXCEPTION_RE =
  /incorret[oa]|fals[oa]|mito|exce[cç][aã]o|n[aã]o (adiai|suspende|exige)|pegadinha/i;

function isExcetoIncCommand(instruction: string): boolean {
  return EXCETO_COMMAND_RE.test(instruction);
}

/** EXCETO/INCORRETA: distratores explicam conduta correta; só gabarito aponta exceção. */
export function lintViasExcetoSemantic(
  payload: {
    question_data?: { instruction?: string; options?: { id: string; is_correct?: boolean }[] };
    reverse_study_slides?: SlideLike[];
    study_slides?: SlideLike[];
  },
): GoldenContentLintIssue[] {
  const instruction = String(payload.question_data?.instruction ?? '');
  if (!isExcetoIncCommand(instruction)) return [];

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
        code: 'vias_exceto_semantic',
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
      return new RegExp(`\\b${opt.id}\\b`, 'i').test(label);
    });
    if (!item) continue;

    const correctText = String(item.correct ?? '').trim();
    if (opt.id === correctOpt.id) {
      if (!GABARITO_EXCEPTION_RE.test(correctText)) {
        issues.push({
          code: 'vias_exceto_semantic',
          message: `Letra ${opt.id} (gabarito): items[].correct deve apontar mito/exceção/falsidade — não conduta correta.`,
          path: 'reverse_study_slides.danger_zone.items',
        });
      }
    } else {
      distractorCorrectTexts.push(correctText);
      if (!DISTRACTOR_CORRECT_RE.test(correctText)) {
        issues.push({
          code: 'vias_exceto_semantic',
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
        code: 'vias_exceto_coringa',
        message:
          'EXCETO/INCORRETA: distratores repetem a mesma justificativa — cada letra errada precisa explicar por que É correta.',
        path: 'reverse_study_slides.danger_zone.items',
      });
    }
  }

  return issues;
}

function inferViasSourceCovers(corpus: string): string[] {
  const covers = new Set<string>();
  if (/ângulo|\d+\s*°|graus|pun[cç][aã]o/i.test(corpus)) {
    covers.add('ângulo de punção IM/SC');
    covers.add('técnica IM');
  }
  if (/\bvolume\b|\d+\s*m[lL]|deltoide/i.test(corpus)) {
    covers.add('volume por sítio IM');
    covers.add('deltoide até 2 mL');
  }
  if (/\bdose/i.test(corpus)) {
    covers.add('dose certa');
    covers.add('indicação de via');
  }
  if (/im\s|intramuscular|ventrogl[uú]teo|nervo\s+ci[aá]tico/i.test(corpus)) {
    covers.add('absorção IM x SC');
    covers.add('sítios de punção');
  }
  if (/subcut|sc\b|hipoderme/i.test(corpus)) {
    covers.add('via subcutânea');
    covers.add('absorção lenta');
  }
  if (covers.size === 0) {
    covers.add('absorção por via');
    covers.add('técnica de administração');
  }
  return [...covers].slice(0, 8);
}

export function buildViasCofenSource(corpus: string): ContentSource {
  return {
    id: VIAS_ADMINISTRACAO_COFEN.id,
    tier: 'A',
    issuer: VIAS_ADMINISTRACAO_COFEN.issuer,
    title: VIAS_ADMINISTRACAO_COFEN.title,
    year: VIAS_ADMINISTRACAO_COFEN.year,
    url: VIAS_ADMINISTRACAO_COFEN.url,
    covers: inferViasSourceCovers(corpus),
  };
}

export function buildViasCuidadosDoseSource(): ContentSource {
  return {
    id: CUIDADOS_ADMIN_COFEN.id,
    tier: 'A',
    issuer: CUIDADOS_ADMIN_COFEN.issuer,
    title: CUIDADOS_ADMIN_COFEN.title,
    year: CUIDADOS_ADMIN_COFEN.year,
    url: CUIDADOS_ADMIN_COFEN.url,
    covers: ['dose certa', 'via certa', 'administração segura'],
  };
}

export function buildViasNumericGuidelineSnapshot(
  corpus: string,
  existing?: string,
): string {
  const technical: string[] = [];
  if (/ângulo|\d+\s*°|graus|pun[cç][aã]o/i.test(corpus)) technical.push('ângulo');
  if (/\bvolume\b|\d+\s*m[lL]|deltoide/i.test(corpus)) technical.push('volume');
  if (/\bdose/i.test(corpus)) technical.push('dose');
  const techSuffix = technical.length > 0 ? ` (${technical.join(', ')})` : '';
  const cofenPart = `COFEN — ${VIAS_ADMINISTRACAO_COFEN.snapshot}${techSuffix}`;

  const trimmed = existing?.trim();
  if (!trimmed) return cofenPart;
  if (/cofen/i.test(trimmed)) return trimmed;
  return `${cofenPart} · ${trimmed}`;
}

export function hasViasNumericTechnicalTrigger(corpus: string, slides: SlideLike[] = []): boolean {
  return VIAS_NUMERIC_TECHNICAL_RE.test(corpus) || extractNumericClaims(slides).length > 0;
}

export function needsViasCofenGuidelineMeta(payload: {
  meta?: { subtopico?: string; content_standard?: string };
  question_data?: { instruction?: string; options?: { text?: string }[] };
  reverse_study_slides?: SlideLike[];
  study_slides?: SlideLike[];
}): boolean {
  if (payload.meta?.subtopico?.trim() !== 'Vias de Administração') return false;
  if (payload.meta?.content_standard !== 'golden-v1') return false;
  const slides = slidesOf(payload);
  const corpus = collectCorpus(payload);
  return VIAS_NUMERIC_TECHNICAL_RE.test(corpus) || extractNumericClaims(slides).length > 0;
}

export type EnrichViasGuidelineMetaResult = {
  payload: Record<string, unknown>;
  changed: boolean;
  reasons: string[];
};

/** Preenche meta.sources + guideline_snapshot com COFEN quando há dose/ângulo/volume ou claims numéricos. */
export function enrichViasGuidelineMeta(
  payload: Record<string, unknown>,
  options: { forceSnapshot?: boolean } = {},
): EnrichViasGuidelineMetaResult {
  if (!needsViasCofenGuidelineMeta(payload as never)) {
    return { payload, changed: false, reasons: [] };
  }

  const reasons: string[] = [];
  const rawMeta = payload.meta;
  const meta: Record<string, unknown> =
    rawMeta && typeof rawMeta === 'object' && !Array.isArray(rawMeta)
      ? { ...(rawMeta as Record<string, unknown>) }
      : {};

  const corpus = collectCorpus(payload as never);
  const existingSources = Array.isArray(meta.sources)
    ? ([...(meta.sources as ContentSource[])] as ContentSource[])
    : [];

  const hasCofen = existingSources.some(
    (s) => s.id === VIAS_ADMINISTRACAO_COFEN.id || /cofen/i.test(s.issuer ?? ''),
  );
  if (!hasCofen) {
    existingSources.unshift(buildViasCofenSource(corpus));
    reasons.push('added_cofen_source');
  } else {
    const idx = existingSources.findIndex(
      (s) => s.id === VIAS_ADMINISTRACAO_COFEN.id || /cofen/i.test(s.issuer ?? ''),
    );
    if (idx >= 0) {
      const merged = new Set([
        ...(existingSources[idx].covers ?? []),
        ...inferViasSourceCovers(corpus),
      ]);
      existingSources[idx] = {
        ...existingSources[idx],
        id: VIAS_ADMINISTRACAO_COFEN.id,
        tier: 'A',
        covers: [...merged].slice(0, 10),
      };
      reasons.push('merged_cofen_covers');
    }
  }

  if (/\bdose/i.test(corpus)) {
    const hasDoseSource = existingSources.some((s) => s.id === CUIDADOS_ADMIN_COFEN.id);
    if (!hasDoseSource) {
      existingSources.push(buildViasCuidadosDoseSource());
      reasons.push('added_cuidados_dose_source');
    }
  }

  meta.sources = existingSources;

  const review =
    meta.content_review && typeof meta.content_review === 'object'
      ? { ...(meta.content_review as Record<string, unknown>) }
      : {};

  const existingSnapshot =
    typeof review.guideline_snapshot === 'string' ? review.guideline_snapshot : undefined;

  if (!existingSnapshot?.trim() || options.forceSnapshot || !/cofen/i.test(existingSnapshot)) {
    review.guideline_snapshot = buildViasNumericGuidelineSnapshot(corpus, existingSnapshot);
    if (!review.reviewed_at) {
      review.reviewed_at = new Date().toISOString().slice(0, 10);
    }
    if (!review.exam_vs_current) {
      review.exam_vs_current = 'none';
    }
    reasons.push('updated_guideline_snapshot');
  }

  meta.content_review = review;

  const changed = reasons.length > 0;
  return {
    payload: { ...payload, meta },
    changed,
    reasons,
  };
}

export function lintViasPedagogy(
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
  if (payload.meta?.subtopico?.trim() !== 'Vias de Administração') return [];
  if (payload.meta?.content_standard !== 'golden-v1') return [];

  const strictV3 = options.strictV3 === true;
  const strictV2 = strictV3 || options.strictV2 === true;
  const corpus = collectCorpus(payload);
  const slides = slidesOf(payload);

  const issues: GoldenContentLintIssue[] = [
    ...lintViasConceptPegadinha(slides),
    ...lintViasDangerMirrorsConcept(slides),
    ...lintViasExcetoSemantic(payload),
  ];

  if (strictV2) {
    issues.push(
      ...lintViasGoldenNormative(slides),
      ...lintViasLogicGabaritoPresent(slides),
    );
  }

  if (strictV3) {
    issues.push(
      ...lintViasConceptReproError(slides, corpus),
      ...lintViasGoldenDecoreOnly(slides),
      ...lintViasLogicTapElimination(payload),
      ...lintViasDangerLetterBinding(payload),
      ...lintViasContentReview(payload),
    );
  }

  if (!strictV2) {
    return issues.filter((i) => isViasAlwaysErrorCode(i.code));
  }

  return issues;
}

export function viasPedagogyHasErrors(issues: GoldenContentLintIssue[]): boolean {
  return issues.length > 0;
}
