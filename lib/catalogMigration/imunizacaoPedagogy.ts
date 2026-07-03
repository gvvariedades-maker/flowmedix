/**
 * Gramática golden-v1 — Imunização (erro reproduzível concept_map ↔ danger_zone).
 * @see docs/GOLDEN_CONTENT_STANDARD.md §5
 * @see data/catalog-migration/imunizacao-pedagogy-errors.json
 */
import type { GoldenContentLintIssue } from '@/lib/goldenContentStandard';

type SlideLike = Record<string, unknown>;

/** Códigos que bloqueiam [READY] mesmo sem --strict-v2-pedagogy. */
export const IMUNIZACAO_ALWAYS_ERROR_CODES = new Set([
  'imunizacao_pegadinha_anchor',
  'imunizacao_concept_gabarito_spoiler',
  'imunizacao_danger_mirror',
  'imunizacao_exceto_semantic',
  'imunizacao_exceto_coringa',
]);

export function isImunizacaoAlwaysErrorCode(code: string): boolean {
  return IMUNIZACAO_ALWAYS_ERROR_CODES.has(code);
}

/** Camada v3 mental — `--strict-v3-pedagogy` (superset de v2). */
export const IMUNIZACAO_V3_ERROR_CODES = new Set([
  'imunizacao_concept_generic_pni',
  'imunizacao_concept_repro_error',
  'imunizacao_golden_rows',
  'imunizacao_golden_vf_judgment',
  'imunizacao_golden_gabarito_row',
  'imunizacao_logic_gabarito',
  'imunizacao_logic_reveal_tap',
  'imunizacao_logic_elimination',
  'imunizacao_danger_letter_binding',
  'imunizacao_exam_vs_current',
  'imunizacao_guideline_snapshot',
]);

export function isImunizacaoV3ErrorCode(code: string): boolean {
  return IMUNIZACAO_V3_ERROR_CODES.has(code);
}

export const IMUNIZACAO_ERROR_PATTERNS = [
  {
    id: 'marco_etario_vacina',
    label: 'Confundir marco etário × vacina',
    re: /\bmarco\b|meses?\s+de\s+vida|\d+\s*º?\s*m[eê]s|meningo|penta|rotav|bcg\s+ao\s+nascer|idade\s+exata/i,
  },
  {
    id: 'intervalo_reforco',
    label: 'Trocar intervalo × reforço',
    re: /intervalo|refor[cç]o|grace|simultane|dose\s+m[ií]nima|entre\s+doses/i,
  },
  {
    id: 'agitar_cadeia',
    label: 'Agitar recupera cadeia rompida',
    re: /agitar|agita[cç][aã]o|recuper|romp|quebra\s+da\s+cadeia|cadeia\s+rompida/i,
  },
  {
    id: 'faixa_termica',
    label: 'Faixa térmica errada (0–2, 8–12, congelamento)',
    re: /2\s*°?\s*c|8\s*°?\s*c|0\s*[-–]\s*2|8\s*[-–]\s*12|congel|temperatura\s+positiva|faixa\s+t[eé]rmica/i,
  },
  {
    id: 'exceto_coringa',
    label: 'EXCETO com frase-coringa em todas as letras',
    re: /incorreta|exceto|afirmativa\s+falsa|mito|conduta\s+errada/i,
  },
  {
    id: 'via_administracao',
    label: 'Trocar via de administração (IM/SC/ID)',
    re: /intramuscular|subcut[aâ]nea|intrad[eé]rmica|\bIM\b|\bSC\b|\bID\b|via\s+(errada|invertida)/i,
  },
] as const;

const PEGADINHA_ITEM_RE =
  /pegadinha|armadilha|erro\s+reproduz|banca\s+induz|confund|troca|mito|metade\s+verdade|julgar\s+via/i;

const GENERIC_PNI_ONLY_RE =
  /^(pnI|calend[aá]rio\s+nacional|manual\s+de\s+vacina|imuniza[cç][aã]o\s+é\s+importante)/i;

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
  for (const p of IMUNIZACAO_ERROR_PATTERNS) {
    if (p.re.test(text)) found.add(p.id);
  }
  return found;
}

/** Infere erros ROI da banca aplicáveis ao enunciado + slides. */
export function inferImunizacaoReproErrorIds(corpus: string): string[] {
  return IMUNIZACAO_ERROR_PATTERNS.filter((p) => p.re.test(corpus)).map((p) => p.id);
}

/** concept_map v3: erro ROI do cluster nomeado (mapa imunizacao-pedagogy-errors.json). */
export function lintImunizacaoConceptReproError(
  slides: SlideLike[],
  corpus: string,
): GoldenContentLintIssue[] {
  const applicable = inferImunizacaoReproErrorIds(corpus);
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
      .map((id) => IMUNIZACAO_ERROR_PATTERNS.find((p) => p.id === id)?.label ?? id)
      .join('; ');
    return [
      {
        code: 'imunizacao_concept_repro_error',
        message: `concept_map deve nomear erro reproduzível do cluster (${labels}) — não só contexto PNI.`,
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
export function lintImunizacaoConceptPegadinha(slides: SlideLike[]): GoldenContentLintIssue[] {
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
        code: 'imunizacao_pegadinha_anchor',
        message:
          'concept_map deve nomear erro reproduzível (item Pegadinha/âncora ou núcleo com armadilha da prova) — não resumo genérico de PNI.',
        path: 'reverse_study_slides.concept_map.items',
      },
    ];
  }

  const spoilerItems = items.filter((it) => GABARITO_CONCEPT_LABEL_RE.test(it.label));
  if (spoilerItems.length > 0) {
    return [
      {
        code: 'imunizacao_concept_gabarito_spoiler',
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
      GENERIC_PNI_ONLY_RE.test(it.detail.trim()),
  );
  if (onlyGeneric && items.length >= 3) {
    return [
      {
        code: 'imunizacao_concept_generic_pni',
        message: 'concept_map parece resumo genérico de PNI — enquadrar o caso desta prova.',
        path: 'reverse_study_slides.concept_map',
      },
    ];
  }

  return [];
}

/** danger_zone espelha o erro nomeado no concept_map. */
export function lintImunizacaoDangerMirrorsConcept(slides: SlideLike[]): GoldenContentLintIssue[] {
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
        code: 'imunizacao_danger_mirror',
        message:
          'danger_zone deve espelhar o erro reproduzível do concept_map (mesmo tema/pegadinha em ≥1 item).',
        path: 'reverse_study_slides.danger_zone.items',
      },
    ];
  }

  return [];
}

/** golden_rule: decore normativo com rows (faixas, intervalos, vias). */
export function lintImunizacaoGoldenNormative(slides: SlideLike[]): GoldenContentLintIssue[] {
  const golden = findSlide(slides, 'golden_rule');
  const rows = golden?.rows;
  if (!Array.isArray(rows) || rows.length < 2) {
    return [
      {
        code: 'imunizacao_golden_rows',
        message: 'golden_rule Imunização: preferir rows[] normativos (≥2) — faixas, intervalos, vias, marcos.',
        path: 'reverse_study_slides.golden_rule.rows',
      },
    ];
  }
  return [];
}

/** logic_flow: gabarito/letra deve aparecer nos steps (único lugar permitido). */
export function lintImunizacaoLogicGabaritoPresent(slides: SlideLike[]): GoldenContentLintIssue[] {
  const logic = findSlide(slides, 'logic_flow');
  const steps = Array.isArray(logic?.steps) ? (logic!.steps as unknown[]) : [];
  const blob = steps.map((s) => String(s)).join(' ');
  if (!/\bletra\s+[A-E]\b|marcar\s+[A-E]\b|gabarito/i.test(blob)) {
    return [
      {
        code: 'imunizacao_logic_gabarito',
        message: 'logic_flow deve localizar gabarito/letra nos steps (único slide com resposta).',
        path: 'reverse_study_slides.logic_flow.steps',
      },
    ];
  }
  return [];
}

function isVfImunizacao(instruction: string, family?: string): boolean {
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
  const slideText = slides
    .map((s) => JSON.stringify(s))
    .join(' ');
  return `${payload.question_data?.instruction ?? ''} ${slideText}`;
}

/** golden_rule v3: só decore normativo — sem julgamento V/F ou gabarito na tabela. */
export function lintImunizacaoGoldenDecoreOnly(slides: SlideLike[]): GoldenContentLintIssue[] {
  const golden = findSlide(slides, 'golden_rule');
  const rows = golden?.rows;
  if (!Array.isArray(rows)) return [];

  const issues: GoldenContentLintIssue[] = [];
  for (const row of rows as Record<string, unknown>[]) {
    const label = String(row.label ?? '');
    const value = String(row.value ?? '');
    if (GOLDEN_GABARITO_ROW_RE.test(label)) {
      issues.push({
        code: 'imunizacao_golden_gabarito_row',
        message: `golden_rule row "${label}" antecipa gabarito — mover para logic_flow (v3 decore only).`,
        path: 'reverse_study_slides.golden_rule.rows',
      });
    }
    if (GOLDEN_VF_VERDICT_RE.test(value) || GOLDEN_VF_VERDICT_RE.test(label)) {
      issues.push({
        code: 'imunizacao_golden_vf_judgment',
        message: `golden_rule row "${label}": decore normativo only — sem FALSA/VERDADEIRA ou → letra (julgamento fica no logic_flow).`,
        path: 'reverse_study_slides.golden_rule.rows',
      });
    }
  }
  return issues;
}

/** logic_flow v3: reveal_mode tap + eliminação por distrator (MCQ) ou julgamento I–IV (VF). */
export function lintImunizacaoLogicTapElimination(
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
      code: 'imunizacao_logic_reveal_tap',
      message: 'logic_flow Imunização v3: reveal_mode "tap" obrigatório (eliminação passo a passo).',
      path: 'reverse_study_slides.logic_flow.reveal_mode',
    });
  }

  const steps = Array.isArray(logic.steps) ? (logic!.steps as unknown[]).map(String) : [];
  const instruction = String(payload.question_data?.instruction ?? '');
  const options = payload.question_data?.options ?? [];
  const wrongIds = options.filter((o) => !o.is_correct).map((o) => o.id);

  if (steps.length === 0) return issues;

  if (isVfImunizacao(instruction, payload.meta?.family)) {
    const romanSteps = steps.filter(
      (s) =>
        ROMAN_JUDGMENT_STEP_RE.test(s) || /^\s*(i|ii|iii|iv)\s*[-–—]/i.test(s.trim()),
    ).length;
    const resolvesLetter = steps.some((s) =>
      /marcar\s+[a-e]|→\s*letra\s+[a-e]|sequ[eê]ncia.*letra/i.test(s),
    );
    if (romanSteps < 2 || !resolvesLetter) {
      issues.push({
        code: 'imunizacao_logic_elimination',
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
        code: 'imunizacao_logic_elimination',
        message: `logic_flow v3: eliminar distratores por letra (${covered}/${wrongIds.length} com passo de eliminação — mín. ${minCovered}).`,
        path: 'reverse_study_slides.logic_flow.steps',
      });
    }
  }

  return issues;
}

/** danger_zone v3: items[].correct ligados à letra A–E quando há compare. */
export function lintImunizacaoDangerLetterBinding(
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
        code: 'imunizacao_danger_letter_binding',
        message: `danger_zone: falta item com label ligado à letra ${opt} (compare semântico por alternativa).`,
        path: 'reverse_study_slides.danger_zone.items',
      });
      break;
    }
  }

  return issues;
}

/** content_review v3: guideline_snapshot + exam_vs_current explícito (transparência prova × PNI 2025). */
export function lintImunizacaoContentReview(
  payload: {
    meta?: {
      ano?: string;
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
      code: 'imunizacao_guideline_snapshot',
      message:
        'meta.content_review.guideline_snapshot obrigatório (ex.: "PNI 2025 — Manual Rede de Frio").',
      path: 'meta.content_review.guideline_snapshot',
    });
  } else if (!/pni|manual|ms\/|minist[eé]rio|202[4-9]/i.test(review.guideline_snapshot)) {
    issues.push({
      code: 'imunizacao_guideline_snapshot',
      message: 'guideline_snapshot deve citar fonte tier A (PNI/Manual MS) e recência.',
      path: 'meta.content_review.guideline_snapshot',
    });
  }

  if (review?.exam_vs_current === undefined || review.exam_vs_current === null) {
    issues.push({
      code: 'imunizacao_exam_vs_current',
      message:
        'meta.content_review.exam_vs_current ausente — use "none" ou texto curto se prova diverge do PNI 2025.',
      path: 'meta.content_review.exam_vs_current',
    });
  }

  return issues;
}

const EXCETO_COMMAND_RE =
  /\bexceto\b|incorret[oa]\s+afirmar|é\s+incorret[oa]|n[aã]o\s+corresponde\s+(a\s+)?(verdade|realidade)/i;

const DISTRACTOR_CORRECT_RE =
  /afirmativa correta|conduta correta|verdadeir|orienta[cç][aã]o correta|eliminar|n[aã]o [ée] o (exceto|gabarito)|sinal v[aá]lido|n[aã]o [ée] o incorret/i;

const GABARITO_EXCEPTION_RE =
  /incorret[oa]|fals[oa]|mito|exce[cç][aã]o|n[aã]o (adiai|suspende|exige)|pegadinha/i;

function isExcetoIncCommand(instruction: string): boolean {
  return EXCETO_COMMAND_RE.test(instruction);
}

/** EXCETO/INCORRETA: distratores explicam conduta correta; só gabarito aponta exceção. */
export function lintImunizacaoExcetoSemantic(
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
        code: 'imunizacao_exceto_semantic',
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
          code: 'imunizacao_exceto_semantic',
          message: `Letra ${opt.id} (gabarito): items[].correct deve apontar mito/exceção/falsidade — não conduta correta.`,
          path: 'reverse_study_slides.danger_zone.items',
        });
      }
    } else {
      distractorCorrectTexts.push(correctText);
      if (!DISTRACTOR_CORRECT_RE.test(correctText)) {
        issues.push({
          code: 'imunizacao_exceto_semantic',
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
        code: 'imunizacao_exceto_coringa',
        message:
          'EXCETO/INCORRETA: distratores repetem a mesma justificativa — cada letra errada precisa explicar por que É correta.',
        path: 'reverse_study_slides.danger_zone.items',
      });
    }
  }

  return issues;
}

export function lintImunizacaoPedagogy(
  payload: {
    meta?: {
      subtopico?: string;
      content_standard?: string;
      family?: string;
      ano?: string;
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
  if (payload.meta?.subtopico?.trim() !== 'Imunização') return [];
  if (payload.meta?.content_standard !== 'golden-v1') return [];

  const strictV3 = options.strictV3 === true;
  const strictV2 = strictV3 || options.strictV2 === true;
  const corpus = collectCorpus(payload);
  const slides = slidesOf(payload);

  const issues: GoldenContentLintIssue[] = [
    ...lintImunizacaoConceptPegadinha(slides),
    ...lintImunizacaoDangerMirrorsConcept(slides),
    ...lintImunizacaoExcetoSemantic(payload),
  ];

  if (strictV2) {
    issues.push(
      ...lintImunizacaoGoldenNormative(slides),
      ...lintImunizacaoLogicGabaritoPresent(slides),
    );
  }

  if (strictV3) {
    issues.push(
      ...lintImunizacaoConceptReproError(slides, corpus),
      ...lintImunizacaoGoldenDecoreOnly(slides),
      ...lintImunizacaoLogicTapElimination(payload),
      ...lintImunizacaoDangerLetterBinding(payload),
      ...lintImunizacaoContentReview(payload),
    );
  }

  if (!strictV2) {
    return issues.filter((i) => isImunizacaoAlwaysErrorCode(i.code));
  }

  return issues;
}

export function imunizacaoPedagogyHasErrors(issues: GoldenContentLintIssue[]): boolean {
  return issues.length > 0;
}
