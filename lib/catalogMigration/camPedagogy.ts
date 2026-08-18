/**
 * Gramática golden-v1 — Cuidados na Administração de Medicamentos (erro reproduzível concept_map ↔ danger_zone).
 * @see docs/GOLDEN_CONTENT_STANDARD.md §5
 * @see data/catalog-migration/cuidados-na-administracao-de-medicamentos-pedagogy-errors.json
 */
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

const CAM_SUBTOPICO = 'Cuidados na Administração de Medicamentos';

/** Códigos que bloqueiam [READY] mesmo sem --strict-v2-pedagogy. */
export const CAM_ALWAYS_ERROR_CODES = new Set([
  'cam_pegadinha_anchor',
  'cam_concept_gabarito_spoiler',
  'cam_danger_mirror',
  'cam_exceto_semantic',
  'cam_exceto_coringa',
]);

export function isCamAlwaysErrorCode(code: string): boolean {
  return CAM_ALWAYS_ERROR_CODES.has(code);
}

/** Camada v3 mental — `--strict-v3-pedagogy` (superset de v2). */
export const CAM_V3_ERROR_CODES = new Set([
  'cam_concept_repro_error',
  'cam_concept_generic_certos',
  'cam_golden_vf_judgment',
  'cam_golden_gabarito_row',
  'cam_logic_reveal_tap',
  'cam_logic_elimination',
  'cam_danger_letter_binding',
  'cam_exam_vs_current',
  'cam_guideline_snapshot',
]);

export function isCamV3ErrorCode(code: string): boolean {
  return CAM_V3_ERROR_CODES.has(code);
}

export const CAM_ERROR_PATTERNS = [
  {
    id: 'uso_habitual_duvida',
    label: 'Uso habitual libera administração com dúvida',
    re: /uso\s+habitual|prescri[cç][aã]o\s+ileg[ií]vel|dose\s+duvidosa|d[uú]vida.*administrar|suspender.*comunicar/i,
  },
  {
    id: 'identificacao_leito',
    label: 'Identificar pelo leito, não pelo paciente',
    re: /dois\s+identificador|identifica[cç][aã]o.*paciente|pulseira|leito.*identif|n[uú]mero\s+do\s+quarto/i,
  },
  {
    id: 'alto_risco_sem_dupla',
    label: 'Alto risco sem conferência dupla',
    re: /alto\s+risco|confer[eê]ncia\s+dupla|dupla\s+checagem|dois\s+profissionais/i,
  },
  {
    id: 'massagear_insulina_sc',
    label: 'Massagear local após insulina SC',
    re: /massagear|friccionar|n[aã]o\s+massagear|10\s+segund/i,
  },
  {
    id: 'nph_regular_mistura',
    label: 'Confundir homogeneização NPH × regular cristalina',
    re: /nph|regular.*cristalina|homogeneiz|leitosa|mistura.*seringa/i,
  },
  {
    id: 'exceto_coringa',
    label: 'EXCETO com frase-coringa em todas as letras',
    re: /incorreta|exceto|afirmativa\s+falsa|mito|conduta\s+errada/i,
  },
  {
    id: 'vo_com_sf',
    label: 'Administrar VO com solução fisiológica',
    re: /solu[cç][aã]o\s+fisiol[oó]gica|\bsf\b|via\s+oral.*sf|vo.*diluente/i,
  },
  {
    id: 'documentacao_pos_admin',
    label: 'Registrar antes de administrar ou omitir prontuário',
    re: /documenta[cç][aã]o|prontu[aá]rio|registrar.*ap[oó]s|antes\s+de\s+administrar/i,
  },
  {
    id: 'aprazamento_janela',
    label: 'Confundir horário certo com janela terapêutica',
    re: /hor[aá]rio\s+certo|janela\s+terap[eê]utica|aprazamento|adiantar|atrasar/i,
  },
] as const;

const PEGADINHA_ITEM_RE =
  /pegadinha|armadilha|erro\s+reproduz|banca\s+induz|confund|troca|mito|9\s+certos|alto\s+risco|confer[eê]ncia\s+dupla|d[uú]vida|insulina|nph|massagear|solu[cç][aã]o\s+fisiol[oó]gica/i;

const GENERIC_CERTOS_ONLY_RE =
  /^(9\s+certos|nove\s+certos|administra[cç][aã]o\s+de\s+medicamento|medicamento\s+seguro|cofen)/i;

/** Estende a base unificada: CAM aceita veredito V/F solto no passo. */
const ROMAN_JUDGMENT_STEP_RE =
  /\bjulgar\s+(i|ii|iii|iv)\b|\b(i|ii|iii|iv)\s*[-–—].*→\s*(v|f)\b|\b(verdadeir|fals)[ao]?\b/i;

function matchErrorPatterns(text: string): Set<string> {
  const found = new Set<string>();
  for (const p of CAM_ERROR_PATTERNS) {
    if (p.re.test(text)) found.add(p.id);
  }
  return found;
}

/** Infere erros ROI da banca aplicáveis ao enunciado + slides. */
export function inferCamReproErrorIds(corpus: string): string[] {
  return CAM_ERROR_PATTERNS.filter((p) => p.re.test(corpus)).map((p) => p.id);
}

/** concept_map v3: erro ROI do cluster nomeado. */
export function lintCamConceptReproError(
  slides: SlideLike[],
  corpus: string,
): GoldenContentLintIssue[] {
  const applicable = inferCamReproErrorIds(corpus);
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
      .map((id) => CAM_ERROR_PATTERNS.find((p) => p.id === id)?.label ?? id)
      .join('; ');
    return [
      {
        code: 'cam_concept_repro_error',
        message: `concept_map deve nomear erro reproduzível do cluster (${labels}) — não só resumo genérico dos 9 Certos.`,
        path: 'reverse_study_slides.concept_map.items',
      },
    ];
  }

  return [];
}

/** concept_map: enquadramento da prova + item que nomeia erro reproduzível. */
export function lintCamConceptPegadinha(slides: SlideLike[]): GoldenContentLintIssue[] {
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
        code: 'cam_pegadinha_anchor',
        message:
          'concept_map deve nomear erro reproduzível (pegadinha/âncora ou núcleo com armadilha da prova) — não resumo genérico de administração segura.',
        path: 'reverse_study_slides.concept_map.items',
      },
    ];
  }

  const spoilerItems = items.filter((it) => GABARITO_CONCEPT_LABEL_RE.test(it.label));
  if (spoilerItems.length > 0) {
    return [
      {
        code: 'cam_concept_gabarito_spoiler',
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
      GENERIC_CERTOS_ONLY_RE.test(it.detail.trim()),
  );
  if (onlyGeneric && items.length >= 3) {
    return [
      {
        code: 'cam_concept_generic_certos',
        message: 'concept_map parece resumo genérico dos 9 Certos — enquadrar o caso desta prova.',
        path: 'reverse_study_slides.concept_map',
      },
    ];
  }

  return [];
}

/** danger_zone espelha o erro nomeado no concept_map. */
export function lintCamDangerMirrorsConcept(slides: SlideLike[]): GoldenContentLintIssue[] {
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

  const falsasItems = conceptItems.filter((it) => /\bFALSA\b|\(F\)/i.test(`${it.label} ${it.detail}`));

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
        code: 'cam_danger_mirror',
        message:
          'danger_zone deve espelhar o erro reproduzível do concept_map (mesmo tema/pegadinha em ≥1 item).',
        path: 'reverse_study_slides.danger_zone.items',
      },
    ];
  }

  return [];
}

/** golden_rule: decore normativo com rows (9 Certos, protocolo alto risco, preparo). */
export function lintCamGoldenNormative(slides: SlideLike[]): GoldenContentLintIssue[] {
  const golden = findSlide(slides, 'golden_rule');
  const rows = golden?.rows;
  if (!Array.isArray(rows) || rows.length < 2) {
    return [
      {
        code: 'cam_golden_rows',
        message:
          'golden_rule CAM: preferir rows[] normativos (≥2) — 9 Certos, protocolo alto risco ou checklist preparo.',
        path: 'reverse_study_slides.golden_rule.rows',
      },
    ];
  }
  return [];
}

/** logic_flow: gabarito/letra deve aparecer nos steps (único lugar permitido). */
export function lintCamLogicGabaritoPresent(slides: SlideLike[]): GoldenContentLintIssue[] {
  const logic = findSlide(slides, 'logic_flow');
  const steps = Array.isArray(logic?.steps) ? (logic!.steps as unknown[]) : [];
  const blob = steps.map((s) => String(s)).join(' ');
  if (!/\bletra\s+[A-E]\b|marcar\s+[A-E]\b|confirmar\s+letra|gabarito/i.test(blob)) {
    return [
      {
        code: 'cam_logic_gabarito',
        message: 'logic_flow deve localizar gabarito/letra nos steps (único slide com resposta).',
        path: 'reverse_study_slides.logic_flow.steps',
      },
    ];
  }
  return [];
}

function isVfCam(instruction: string, family?: string): boolean {
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
  question_data?: { instruction?: string };
  reverse_study_slides?: SlideLike[];
  study_slides?: SlideLike[];
}): string {
  const slides = slidesOf(payload);
  const slideText = slides.map((s) => JSON.stringify(s)).join(' ');
  return `${payload.question_data?.instruction ?? ''} ${slideText}`;
}

/** V/F I–III: logic_flow deve julgar cada afirmativa antes de combinar letras. */
export function lintCamVfIIIBinding(payload: {
  meta?: { family?: string };
  question_data?: { instruction?: string };
  reverse_study_slides?: SlideLike[];
  study_slides?: SlideLike[];
}): GoldenContentLintIssue[] {
  const instruction = String(payload.question_data?.instruction ?? '');
  if (!isVfCam(instruction, payload.meta?.family)) return [];
  if (!/\b(i|ii|iii)\s*[-–—]/i.test(instruction)) return [];

  const slides = slidesOf(payload);
  const logic = findSlide(slides, 'logic_flow');
  const steps = Array.isArray(logic?.steps) ? (logic!.steps as unknown[]).map(String) : [];
  if (steps.length === 0) return [];

  const romans = ['i', 'ii', 'iii'] as const;
  const judged = romans.filter((roman) =>
    steps.some(
      (s) =>
        new RegExp(`\\b${roman}\\b`, 'i').test(s) &&
        ROMAN_JUDGMENT_STEP_RE.test(s),
    ),
  );

  if (judged.length < 3) {
    return [
      {
        code: 'cam_vf_i_ii_iii_binding',
        message:
          'logic_flow V/F CAM: julgar afirmativas I, II e III separadamente (V/F) antes de combinar letras.',
        path: 'reverse_study_slides.logic_flow.steps',
      },
    ];
  }

  return [];
}

/** golden_rule v3: só decore normativo — sem julgamento V/F ou gabarito na tabela. */
export function lintCamGoldenDecoreOnly(slides: SlideLike[]): GoldenContentLintIssue[] {
  const golden = findSlide(slides, 'golden_rule');
  const rows = golden?.rows;
  if (!Array.isArray(rows)) return [];

  const issues: GoldenContentLintIssue[] = [];
  for (const row of rows as Record<string, unknown>[]) {
    const label = String(row.label ?? '');
    const value = String(row.value ?? '');
    if (GOLDEN_GABARITO_ROW_RE.test(label)) {
      issues.push({
        code: 'cam_golden_gabarito_row',
        message: `golden_rule row "${label}" antecipa gabarito — mover para logic_flow (v3 decore only).`,
        path: 'reverse_study_slides.golden_rule.rows',
      });
    }
    if (GOLDEN_VF_VERDICT_RE.test(value) || GOLDEN_VF_VERDICT_RE.test(label)) {
      issues.push({
        code: 'cam_golden_vf_judgment',
        message: `golden_rule row "${label}": decore normativo only — sem FALSA/VERDADEIRA ou → letra (julgamento fica no logic_flow).`,
        path: 'reverse_study_slides.golden_rule.rows',
      });
    }
  }
  return issues;
}

/** logic_flow v3: reveal_mode tap + eliminação por distrator (MCQ) ou julgamento I–III (VF). */
export function lintCamLogicTapElimination(
  payload: {
    meta?: { family?: string; pedagogical_branch?: string };
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
      code: 'cam_logic_reveal_tap',
      message: 'logic_flow CAM v3: reveal_mode "tap" obrigatório (eliminação passo a passo).',
      path: 'reverse_study_slides.logic_flow.reveal_mode',
    });
  }

  const steps = Array.isArray(logic.steps) ? (logic!.steps as unknown[]).map(String) : [];
  const instruction = String(payload.question_data?.instruction ?? '');
  const options = payload.question_data?.options ?? [];
  const wrongIds = options.filter((o) => !o.is_correct).map((o) => o.id);

  if (steps.length === 0) return issues;

  if (isVfCam(instruction, payload.meta?.family)) {
    const romanSteps = steps.filter(
      (s) =>
        ROMAN_JUDGMENT_STEP_RE.test(s) || /^\s*(i|ii|iii|iv)\s*[-–—]/i.test(s.trim()),
    ).length;
    const resolvesLetter = steps.some((s) =>
      /marcar\s+[a-e]|→\s*letra\s+[a-e]|confirmar\s+letra|combinar.*letra/i.test(s),
    );
    if (romanSteps < 2 || !resolvesLetter) {
      issues.push({
        code: 'cam_logic_elimination',
        message:
          'logic_flow V/F v3: julgar afirmativas I–III e fechar com letra/combinação — não só narrativa.',
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
        code: 'cam_logic_elimination',
        message: `logic_flow v3: eliminar distratores por letra (${covered}/${wrongIds.length} com passo de eliminação — mín. ${minCovered}).`,
        path: 'reverse_study_slides.logic_flow.steps',
      });
    }
  }

  return issues;
}

/** danger_zone v3: items[].correct ligados à letra A–E quando há compare. */
export function lintCamDangerLetterBinding(
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
        code: 'cam_danger_letter_binding',
        message: `danger_zone: falta item com label ligado à letra ${opt} (compare semântico por alternativa).`,
        path: 'reverse_study_slides.danger_zone.items',
      });
      break;
    }
  }

  return issues;
}

/** Ramo alto risco: concept_map ou golden_rule deve citar conferência dupla. */
export function lintCamAltoRiscoDuplaChecagem(
  payload: {
    meta?: { pedagogical_branch?: string };
    question_data?: { instruction?: string };
    reverse_study_slides?: SlideLike[];
    study_slides?: SlideLike[];
  },
): GoldenContentLintIssue[] {
  const branch = payload.meta?.pedagogical_branch ?? '';
  const instruction = String(payload.question_data?.instruction ?? '');
  const isAltoRisco =
    branch === 'cam_alto_risco' ||
    /insulina|heparina|alto\s+risco|confer[eê]ncia\s+dupla/i.test(instruction);
  if (!isAltoRisco) return [];

  const slides = slidesOf(payload);
  const concept = findSlide(slides, 'concept_map');
  const golden = findSlide(slides, 'golden_rule');
  const blob = `${JSON.stringify(concept)} ${JSON.stringify(golden)}`;

  if (!/confer[eê]ncia\s+dupla|dupla\s+checagem|dois\s+profissionais/i.test(blob)) {
    return [
      {
        code: 'cam_alto_risco_dupla_checagem',
        message:
          'Alto risco/insulina: concept_map ou golden_rule deve citar conferência dupla (dois profissionais habilitados).',
        path: 'reverse_study_slides.concept_map',
      },
    ];
  }

  return [];
}

/** Questão de insulina: slides devem ancorar técnica SC (NPH, massagear, 10 s). */
export function lintCamInsulinaTecnicaClaim(
  payload: {
    question_data?: { instruction?: string };
    reverse_study_slides?: SlideLike[];
    study_slides?: SlideLike[];
  },
): GoldenContentLintIssue[] {
  const instruction = String(payload.question_data?.instruction ?? '');
  if (!/insulina/i.test(instruction)) return [];

  const slides = slidesOf(payload);
  const blob = slides.map((s) => JSON.stringify(s)).join(' ');
  const techniqueHits = [
    /massagear|n[aã]o\s+massagear/i.test(blob),
    /10\s+segund/i.test(blob),
    /nph|homogeneiz|cristalina|regular/i.test(blob),
    /mistura.*seringa|seringa.*separad/i.test(blob),
  ].filter(Boolean).length;

  if (techniqueHits < 2) {
    return [
      {
        code: 'cam_insulina_tecnica_claim',
        message:
          'Insulina: slides devem ancorar ≥2 claims técnicos (NPH×regular, massagear, 10 s, mistura na seringa).',
        path: 'reverse_study_slides',
      },
    ];
  }

  return [];
}

/** content_review v3: guideline_snapshot COFEN/ANVISA + exam_vs_current. */
export function lintCamContentReview(
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
      code: 'cam_guideline_snapshot',
      message:
        'meta.content_review.guideline_snapshot obrigatório (ex.: "9 Certos · COFEN segurança do paciente").',
      path: 'meta.content_review.guideline_snapshot',
    });
  } else if (
    !/cofen|anvisa|9\s+certos|minist[eé]rio|ms\/|seguran[cç]a.*medicamento|seguran[cç]a\s+do\s+paciente|insulina/i.test(
      review.guideline_snapshot,
    )
  ) {
    issues.push({
      code: 'cam_guideline_snapshot',
      message: 'guideline_snapshot deve citar fonte tier A (COFEN/ANVISA/9 Certos) e recência.',
      path: 'meta.content_review.guideline_snapshot',
    });
  }

  if (review?.exam_vs_current === undefined || review.exam_vs_current === null) {
    issues.push({
      code: 'cam_exam_vs_current',
      message:
        'meta.content_review.exam_vs_current ausente — use "none" ou texto curto se prova diverge do guideline atual.',
      path: 'meta.content_review.exam_vs_current',
    });
  }

  return issues;
}

const DISTRACTOR_CORRECT_RE =
  /afirmativa correta|conduta correta|verdadeir|orienta[cç][aã]o correta|eliminar|n[aã]o [ée] o (exceto|gabarito)|n[aã]o [ée] o incorret|correta —/i;

const GABARITO_EXCEPTION_RE =
  /incorret[oa]|fals[oa]|mito|exce[cç][aã]o|n[aã]o (adiai|suspende|exige)|pegadinha|exceto|única\s+falsa/i;

function isExcetoIncCommand(instruction: string): boolean {
  return EXCETO_COMMAND_RE.test(instruction);
}

/** EXCETO/INCORRETA: distratores explicam conduta correta; só gabarito aponta exceção. */
export function lintCamExcetoSemantic(
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
        code: 'cam_exceto_semantic',
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
          code: 'cam_exceto_semantic',
          message: `Letra ${opt.id} (gabarito): items[].correct deve apontar mito/exceção/falsidade — não conduta correta.`,
          path: 'reverse_study_slides.danger_zone.items',
        });
      }
    } else {
      distractorCorrectTexts.push(correctText);
      if (!DISTRACTOR_CORRECT_RE.test(correctText)) {
        issues.push({
          code: 'cam_exceto_semantic',
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
        code: 'cam_exceto_coringa',
        message:
          'EXCETO/INCORRETA: distratores repetem a mesma justificativa — cada letra errada precisa explicar por que É correta.',
        path: 'reverse_study_slides.danger_zone.items',
      });
    }
  }

  return issues;
}

export function lintCamPedagogy(
  payload: {
    meta?: {
      subtopico?: string;
      content_standard?: string;
      family?: string;
      pedagogical_branch?: string;
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
  if (payload.meta?.subtopico?.trim() !== CAM_SUBTOPICO) return [];
  if (payload.meta?.content_standard !== 'golden-v1') return [];

  const strictV3 = options.strictV3 === true;
  const strictV2 = strictV3 || options.strictV2 === true;
  const corpus = collectCorpus(payload);
  const slides = slidesOf(payload);

  const issues: GoldenContentLintIssue[] = [
    ...lintCamConceptPegadinha(slides),
    ...lintCamDangerMirrorsConcept(slides),
    ...lintCamExcetoSemantic(payload),
  ];

  if (strictV2) {
    issues.push(
      ...lintCamGoldenNormative(slides),
      ...lintCamLogicGabaritoPresent(slides),
      ...lintCamVfIIIBinding(payload),
      ...lintCamAltoRiscoDuplaChecagem(payload),
      ...lintCamInsulinaTecnicaClaim(payload),
    );
  }

  if (strictV3) {
    issues.push(
      ...lintCamConceptReproError(slides, corpus),
      ...lintCamGoldenDecoreOnly(slides),
      ...lintCamLogicTapElimination(payload),
      ...lintCamDangerLetterBinding(payload),
      ...lintCamContentReview(payload),
    );
  }

  if (!strictV2) {
    return issues.filter((i) => isCamAlwaysErrorCode(i.code));
  }

  return issues;
}

export function camPedagogyHasErrors(issues: GoldenContentLintIssue[]): boolean {
  return issues.length > 0;
}
