/**
 * Gramática golden-v1 — Verificação de Sinais Vitais (erro reproduzível concept_map ↔ danger_zone).
 * @see docs/GOLDEN_CONTENT_STANDARD.md §5
 * @see data/catalog-migration/sinais-vitais-pedagogy-errors.json
 */
import { extractNumericClaims } from '@/lib/catalogMigration/numericFactcheck';
import type { ContentSource, GoldenContentLintIssue } from '@/lib/goldenContentStandard';
import { SINAIS_VITAIS_ADULTO } from '@/lib/guidelines/sinaisVitais';

type SlideLike = Record<string, unknown>;

/** Códigos que bloqueiam [READY] mesmo sem --strict-v2-pedagogy. */
export const VITALS_ALWAYS_ERROR_CODES = new Set([
  'vitals_pegadinha_anchor',
  'vitals_concept_gabarito_spoiler',
  'vitals_danger_mirror',
  'vitals_exceto_semantic',
  'vitals_exceto_coringa',
]);

export function isVitalsAlwaysErrorCode(code: string): boolean {
  return VITALS_ALWAYS_ERROR_CODES.has(code);
}

/** Camada v3 mental — `--strict-v3-pedagogy` (superset de v2). */
export const VITALS_V3_ERROR_CODES = new Set([
  'vitals_concept_generic_sv',
  'vitals_concept_repro_error',
  'vitals_golden_rows',
  'vitals_golden_vf_judgment',
  'vitals_golden_gabarito_row',
  'vitals_logic_gabarito',
  'vitals_logic_reveal_tap',
  'vitals_logic_elimination',
  'vitals_danger_letter_binding',
  'vitals_exam_vs_current',
  'vitals_guideline_snapshot',
]);

export function isVitalsV3ErrorCode(code: string): boolean {
  return VITALS_V3_ERROR_CODES.has(code);
}

export const VITALS_ERROR_PATTERNS = [
  {
    id: 'braco_nivel_figado',
    label: 'Braço ao nível do fígado em vez do coração',
    re: /f[ií]gado|nível\s+do\s+f[ií]gado|braço\s+pendente/i,
  },
  {
    id: 'pernas_cruzadas_pa',
    label: 'Pernas cruzadas durante aferição PA',
    re: /pernas?\s+cruzad|pés?\s+apoiad/i,
  },
  {
    id: 'manguito_inadequado',
    label: 'Manguito sem cobrir ~80% do braço',
    re: /manguito|80\s*%|circunfer[eê]ncia\s+do\s+bra[cç]o/i,
  },
  {
    id: 'korotkoff_sequencia',
    label: 'Sequência Korotkoff fora do MS',
    re: /korotkoff|fase\s+v|diast[oó]lic|defla[cç][aã]o|20\s*[-–]\s*30\s*mmhg/i,
  },
  {
    id: 'polegar_no_pulso',
    label: 'Palpar pulso com o polegar',
    re: /polegar|indicador\s+e\s+m[eé]dio|dedos?\s+indicador/i,
  },
  {
    id: 'fc_faixa_invertida',
    label: 'Inverter faixa normal FC ou confundir taqui/bradi',
    re: /60\s*[-–]\s*100\s*bpm|taquicard|bradicard|normoc[aá]rd|bpm/i,
  },
  {
    id: 'contar_fr_com_fala',
    label: 'Contar FR com paciente conversando',
    re: /convers.{0,40}(?:fr|respirat|irpm|mpm)|(?:fr|respirat|irpm|mpm).{0,40}convers|contar\s+(?:a\s+)?(?:fr|frequ[eê]ncia\s+respirat)/i,
  },
  {
    id: 'temperatura_pos_exercicio',
    label: 'Aferir temperatura após exercício',
    re: /temperatura|axilar|febre|36\s*°|37[,.]8|exerc[ií]cio|atividade\s+f[ií]sica/i,
  },
  {
    id: 'oximetro_substitui_palpacao',
    label: 'Oxímetro substitui palpação',
    re: /ox[ií]metr|spo2|sp[oó]2|palpa[cç][aã]o\s+do\s+pulso|pulso\s+radial/i,
  },
  {
    id: 'interpretacao_sv_errada',
    label: 'Classificar errado normo/hiper/hipo ou taqui/taquipneia',
    re: /normotens|hipertens|hipotens|taquic[aá]rd|taquipne|eupne|afebril|febril/i,
  },
  {
    id: 'pulso_periferico_central',
    label: 'Confundir pulso periférico com central',
    re: /pulso\s+central|femoral|radial|car[oó]tida|popl[ií]tea|ulnar/i,
  },
  {
    id: 'exceto_coringa',
    label: 'EXCETO com frase-coringa',
    re: /incorreta|exceto|afirmativa\s+falsa|mito|conduta\s+errada/i,
  },
  {
    id: 'conduta_sem_escalonar',
    label: 'Agir sem comunicar alteração de SV',
    re: /comunicar|enfermeiro|registrar\s+no\s+prontu[aá]rio|manter\s+a\s+rotina|antit[eé]rmic/i,
  },
  {
    id: 'faixa_pediatrica_adulto',
    label: 'Aplicar faixa de adulto em pediatria',
    re: /rec[eé]m[-\s]?nascid|lactente|pr[eé][-\s]?escolar|pedi[aá]tr|rn\b/i,
  },
] as const;

const PEGADINHA_ITEM_RE =
  /pegadinha|armadilha|erro\s+reproduz|banca\s+induz|confund|troca|mito|t[eé]cnica|par[aâ]metro|monitor|trilho|korotkoff|manguito/i;

const GENERIC_SV_ONLY_RE =
  /^(sinais\s+vitais|verifica[cç][aã]o\s+de\s+sinais|aferi[cç][aã]o\s+é\s+importante|medir\s+press[aã]o)/i;

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
  for (const p of VITALS_ERROR_PATTERNS) {
    if (p.re.test(text)) found.add(p.id);
  }
  return found;
}

/** Infere erros ROI da banca aplicáveis ao enunciado + slides. */
export function inferVitalsReproErrorIds(corpus: string): string[] {
  return VITALS_ERROR_PATTERNS.filter((p) => p.re.test(corpus)).map((p) => p.id);
}

/** concept_map v3: erro ROI do cluster nomeado (mapa vitals-pedagogy-errors.json). */
export function lintVitalsConceptReproError(
  slides: SlideLike[],
  corpus: string,
): GoldenContentLintIssue[] {
  const applicable = inferVitalsReproErrorIds(corpus);
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
      .map((id) => VITALS_ERROR_PATTERNS.find((p) => p.id === id)?.label ?? id)
      .join('; ');
    return [
      {
        code: 'vitals_concept_repro_error',
        message: `concept_map deve nomear erro reproduzível do cluster (${labels}) — não só contexto genérico de SV.`,
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
export function lintVitalsConceptPegadinha(slides: SlideLike[]): GoldenContentLintIssue[] {
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
        code: 'vitals_pegadinha_anchor',
        message:
          'concept_map deve nomear erro reproduzível (item Pegadinha/âncora ou núcleo com armadilha da prova) — não resumo genérico de sinais vitais.',
        path: 'reverse_study_slides.concept_map.items',
      },
    ];
  }

  const spoilerItems = items.filter((it) => GABARITO_CONCEPT_LABEL_RE.test(it.label));
  if (spoilerItems.length > 0) {
    return [
      {
        code: 'vitals_concept_gabarito_spoiler',
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
      GENERIC_SV_ONLY_RE.test(it.detail.trim()),
  );
  if (onlyGeneric && items.length >= 3) {
    return [
      {
        code: 'vitals_concept_generic_sv',
        message: 'concept_map parece resumo genérico de sinais vitais — enquadrar o caso desta prova.',
        path: 'reverse_study_slides.concept_map',
      },
    ];
  }

  return [];
}

/** danger_zone espelha o erro nomeado no concept_map. */
export function lintVitalsDangerMirrorsConcept(slides: SlideLike[]): GoldenContentLintIssue[] {
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
        code: 'vitals_danger_mirror',
        message:
          'danger_zone deve espelhar o erro reproduzível do concept_map (mesmo tema/pegadinha em ≥1 item).',
        path: 'reverse_study_slides.danger_zone.items',
      },
    ];
  }

  return [];
}

/** golden_rule: decore normativo com rows (faixas, intervalos, vias). */
export function lintVitalsGoldenNormative(slides: SlideLike[]): GoldenContentLintIssue[] {
  const golden = findSlide(slides, 'golden_rule');
  const rows = golden?.rows;
  if (!Array.isArray(rows) || rows.length < 2) {
    return [
      {
        code: 'vitals_golden_rows',
        message: 'golden_rule SV: preferir rows[] normativos (≥2) — faixas FC/FR/PA/Temp, técnica, Korotkoff.',
        path: 'reverse_study_slides.golden_rule.rows',
      },
    ];
  }
  return [];
}

/** logic_flow: gabarito/letra deve aparecer nos steps (único lugar permitido). */
export function lintVitalsLogicGabaritoPresent(slides: SlideLike[]): GoldenContentLintIssue[] {
  const logic = findSlide(slides, 'logic_flow');
  const steps = Array.isArray(logic?.steps) ? (logic!.steps as unknown[]) : [];
  const blob = steps.map((s) => String(s)).join(' ');
  if (!/\bletra\s+[A-E]\b|marcar\s+[A-E]\b|marcar\s+certo|marcar\s+errado|gabarito/i.test(blob)) {
    return [
      {
        code: 'vitals_logic_gabarito',
        message: 'logic_flow deve localizar gabarito/letra nos steps (único slide com resposta).',
        path: 'reverse_study_slides.logic_flow.steps',
      },
    ];
  }
  return [];
}

function isVfVitals(instruction: string, family?: string): boolean {
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
  question_data?: {
    instruction?: string;
    options?: { text?: string }[];
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
export function lintVitalsGoldenDecoreOnly(slides: SlideLike[]): GoldenContentLintIssue[] {
  const golden = findSlide(slides, 'golden_rule');
  const rows = golden?.rows;
  if (!Array.isArray(rows)) return [];

  const issues: GoldenContentLintIssue[] = [];
  for (const row of rows as Record<string, unknown>[]) {
    const label = String(row.label ?? '');
    const value = String(row.value ?? '');
    if (GOLDEN_GABARITO_ROW_RE.test(label)) {
      issues.push({
        code: 'vitals_golden_gabarito_row',
        message: `golden_rule row "${label}" antecipa gabarito — mover para logic_flow (v3 decore only).`,
        path: 'reverse_study_slides.golden_rule.rows',
      });
    }
    if (GOLDEN_VF_VERDICT_RE.test(value) || GOLDEN_VF_VERDICT_RE.test(label)) {
      issues.push({
        code: 'vitals_golden_vf_judgment',
        message: `golden_rule row "${label}": decore normativo only — sem FALSA/VERDADEIRA ou → letra (julgamento fica no logic_flow).`,
        path: 'reverse_study_slides.golden_rule.rows',
      });
    }
  }
  return issues;
}

/** logic_flow v3: reveal_mode tap + eliminação por distrator (MCQ) ou julgamento I–IV (VF). */
export function lintVitalsLogicTapElimination(
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
      code: 'vitals_logic_reveal_tap',
      message: 'logic_flow SV v3: reveal_mode "tap" obrigatório (eliminação passo a passo).',
      path: 'reverse_study_slides.logic_flow.reveal_mode',
    });
  }

  const steps = Array.isArray(logic.steps) ? (logic!.steps as unknown[]).map(String) : [];
  const instruction = String(payload.question_data?.instruction ?? '');
  const options = payload.question_data?.options ?? [];
  const wrongIds = options.filter((o) => !o.is_correct).map((o) => o.id);

  if (steps.length === 0) return issues;

  if (isVfVitals(instruction, payload.meta?.family)) {
    const romanSteps = steps.filter(
      (s) =>
        ROMAN_JUDGMENT_STEP_RE.test(s) || /^\s*(i|ii|iii|iv)\s*[-–—]/i.test(s.trim()),
    ).length;
    const resolvesLetter = steps.some((s) =>
      /marcar\s+[a-e]|→\s*letra\s+[a-e]|sequ[eê]ncia.*letra/i.test(s),
    );
    if (romanSteps < 2 || !resolvesLetter) {
      issues.push({
        code: 'vitals_logic_elimination',
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
        code: 'vitals_logic_elimination',
        message: `logic_flow v3: eliminar distratores por letra (${covered}/${wrongIds.length} com passo de eliminação — mín. ${minCovered}).`,
        path: 'reverse_study_slides.logic_flow.steps',
      });
    }
  }

  return issues;
}

/** danger_zone v3: items[].correct ligados à letra A–E quando há compare. */
export function lintVitalsDangerLetterBinding(
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
        code: 'vitals_danger_letter_binding',
        message: `danger_zone: falta item com label ligado à letra ${opt} (compare semântico por alternativa).`,
        path: 'reverse_study_slides.danger_zone.items',
      });
      break;
    }
  }

  return issues;
}

/** content_review v3: guideline_snapshot + exam_vs_current explícito (MS/COFEN). */
export function lintVitalsContentReview(
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
      code: 'vitals_guideline_snapshot',
      message:
        'meta.content_review.guideline_snapshot obrigatório (ex.: "MS/COFEN — faixas de sinais vitais adulto").',
      path: 'meta.content_review.guideline_snapshot',
    });
  } else if (!/ms|cofen|minist[eé]rio|sinais\s+vitais|bpm|mmhg|korotkoff/i.test(review.guideline_snapshot)) {
    issues.push({
      code: 'vitals_guideline_snapshot',
      message: 'guideline_snapshot deve citar fonte tier A (MS/COFEN/protocolo SV).',
      path: 'meta.content_review.guideline_snapshot',
    });
  }

  if (review?.exam_vs_current === undefined || review.exam_vs_current === null) {
    issues.push({
      code: 'vitals_exam_vs_current',
      message:
        'meta.content_review.exam_vs_current ausente — use "none" ou texto curto se prova diverge da referência atual.',
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
export function lintVitalsExcetoSemantic(
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
        code: 'vitals_exceto_semantic',
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
          code: 'vitals_exceto_semantic',
          message: `Letra ${opt.id} (gabarito): items[].correct deve apontar mito/exceção/falsidade — não conduta correta.`,
          path: 'reverse_study_slides.danger_zone.items',
        });
      }
    } else {
      distractorCorrectTexts.push(correctText);
      if (!DISTRACTOR_CORRECT_RE.test(correctText)) {
        issues.push({
          code: 'vitals_exceto_semantic',
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
        code: 'vitals_exceto_coringa',
        message:
          'EXCETO/INCORRETA: distratores repetem a mesma justificativa — cada letra errada precisa explicar por que É correta.',
        path: 'reverse_study_slides.danger_zone.items',
      });
    }
  }

  return issues;
}

export function lintVitalsPedagogy(
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
  if (payload.meta?.subtopico?.trim() !== 'Verificação de Sinais Vitais') return [];
  if (payload.meta?.content_standard !== 'golden-v1') return [];

  const strictV3 = options.strictV3 === true;
  const strictV2 = strictV3 || options.strictV2 === true;
  const corpus = collectCorpus(payload);
  const slides = slidesOf(payload);

  const issues: GoldenContentLintIssue[] = [
    ...lintVitalsConceptPegadinha(slides),
    ...lintVitalsDangerMirrorsConcept(slides),
    ...lintVitalsExcetoSemantic(payload),
  ];

  if (strictV2) {
    issues.push(
      ...lintVitalsGoldenNormative(slides),
      ...lintVitalsLogicGabaritoPresent(slides),
    );
  }

  if (strictV3) {
    issues.push(
      ...lintVitalsConceptReproError(slides, corpus),
      ...lintVitalsGoldenDecoreOnly(slides),
      ...lintVitalsLogicTapElimination(payload),
      ...lintVitalsDangerLetterBinding(payload),
      ...lintVitalsContentReview(payload),
    );
  }

  if (!strictV2) {
    return issues.filter((i) => isVitalsAlwaysErrorCode(i.code));
  }

  return issues;
}

/** Faixas numéricas no enunciado/slides — exige fonte sv-adulto-referencia + snapshot. */
export const VITALS_NUMERIC_TECHNICAL_RE =
  /\b\d{2,3}\s*[×x]\s*\d{2,3}\b|\b\d{2,3}\s*bpm\b|\b\d{1,2}\s*irpm\b|\b\d{1,2}\s*mpm\b|\b\d{1,2}[,.]\d\s*°?\s*c\b|\bspo2\b|\bsp[oó]2\b|≥\s*95\s*%|mmhg|korotkoff|manguito/i;

function inferVitalsSourceCovers(corpus: string): string[] {
  const covers = new Set<string>();
  if (/\bpa\b|press[aã]o\s+arterial|mmhg|korotkoff|manguito/i.test(corpus)) {
    covers.add('PA normotenso');
    covers.add('técnica de aferição PA');
  }
  if (/\bfc\b|pulso|bpm|radial|taquicard|bradicard/i.test(corpus)) {
    covers.add('FC 60-100 bpm');
    covers.add('pulso radial');
  }
  if (/\bfr\b|irpm|mpm|respira[cç]/i.test(corpus)) {
    covers.add('FR 12-20 irpm');
  }
  if (/temperatura|axilar|febre|°\s*c/i.test(corpus)) {
    covers.add('temperatura axilar');
  }
  if (/spo2|ox[ií]metr/i.test(corpus)) {
    covers.add('SpO₂ ≥95%');
  }
  if (covers.size === 0) {
    covers.add('faixas de sinais vitais');
    covers.add('técnica de aferição');
  }
  return [...covers].slice(0, 8);
}

export function buildVitalsAdultoSource(corpus: string): ContentSource {
  return {
    id: SINAIS_VITAIS_ADULTO.id,
    tier: 'A',
    issuer: SINAIS_VITAIS_ADULTO.issuer,
    title: SINAIS_VITAIS_ADULTO.title,
    year: SINAIS_VITAIS_ADULTO.year,
    url: SINAIS_VITAIS_ADULTO.url,
    covers: inferVitalsSourceCovers(corpus),
  };
}

export function buildVitalsNumericGuidelineSnapshot(corpus: string, existing?: string): string {
  const techSuffix = /korotkoff|manguito/i.test(corpus) ? ' (técnica PA)' : '';
  const msPart = `MS/COFEN — ${SINAIS_VITAIS_ADULTO.snapshot}${techSuffix}`;
  const trimmed = existing?.trim();
  if (!trimmed) return msPart;
  if (/ms|cofen|sinais\s+vitais/i.test(trimmed)) return trimmed;
  return `${msPart} · ${trimmed}`;
}

export function hasVitalsNumericTechnicalTrigger(corpus: string, slides: SlideLike[] = []): boolean {
  return VITALS_NUMERIC_TECHNICAL_RE.test(corpus) || extractNumericClaims(slides).length > 0;
}

export function needsVitalsGuidelineMeta(payload: {
  meta?: { subtopico?: string; content_standard?: string };
  question_data?: { instruction?: string; options?: { text?: string }[] };
  reverse_study_slides?: SlideLike[];
  study_slides?: SlideLike[];
}): boolean {
  if (payload.meta?.subtopico?.trim() !== 'Verificação de Sinais Vitais') return false;
  if (payload.meta?.content_standard !== 'golden-v1') return false;
  const slides = slidesOf(payload);
  const corpus = collectCorpus(payload);
  return VITALS_NUMERIC_TECHNICAL_RE.test(corpus) || extractNumericClaims(slides).length > 0;
}

export type EnrichVitalsGuidelineMetaResult = {
  payload: Record<string, unknown>;
  changed: boolean;
  reasons: string[];
};

/** Preenche meta.sources + guideline_snapshot quando há faixas/valores numéricos de SV. */
export function enrichVitalsGuidelineMeta(
  payload: Record<string, unknown>,
  options: { forceSnapshot?: boolean } = {},
): EnrichVitalsGuidelineMetaResult {
  if (!needsVitalsGuidelineMeta(payload as never)) {
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

  const hasSv = existingSources.some((s) => s.id === SINAIS_VITAIS_ADULTO.id);
  if (!hasSv) {
    existingSources.unshift(buildVitalsAdultoSource(corpus));
    reasons.push('added_sv_adulto_source');
  } else {
    const idx = existingSources.findIndex((s) => s.id === SINAIS_VITAIS_ADULTO.id);
    if (idx >= 0) {
      const merged = new Set([...(existingSources[idx].covers ?? []), ...inferVitalsSourceCovers(corpus)]);
      existingSources[idx] = {
        ...existingSources[idx],
        tier: 'A',
        covers: [...merged].slice(0, 10),
      };
      reasons.push('merged_sv_covers');
    }
  }

  meta.sources = existingSources;

  const review =
    meta.content_review && typeof meta.content_review === 'object'
      ? { ...(meta.content_review as Record<string, unknown>) }
      : {};

  const existingSnapshot =
    typeof review.guideline_snapshot === 'string' ? review.guideline_snapshot : undefined;

  if (!existingSnapshot?.trim() || options.forceSnapshot || !/ms|cofen|sinais/i.test(existingSnapshot)) {
    review.guideline_snapshot = buildVitalsNumericGuidelineSnapshot(corpus, existingSnapshot);
    if (!review.reviewed_at) {
      review.reviewed_at = new Date().toISOString().slice(0, 10);
    }
    if (!review.exam_vs_current) {
      review.exam_vs_current = 'none';
    }
    reasons.push('updated_guideline_snapshot');
  }

  meta.content_review = review;

  if (reasons.length === 0) {
    return { payload, changed: false, reasons: ['already_enriched'] };
  }

  return { payload: { ...payload, meta }, changed: true, reasons };
}

export function vitalsPedagogyHasErrors(issues: GoldenContentLintIssue[]): boolean {
  return issues.length > 0;
}
