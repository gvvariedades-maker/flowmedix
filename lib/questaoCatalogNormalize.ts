import {
  QuestaoCompletaSchema,
  payloadContainsTecconcursosReference,
} from '@/lib/validations';
import { normalizeQuestaoSlideArrays } from '@/lib/reverseStudySlidesNormalize';
import {
  DEFAULT_CARGO_HEADER,
  stripLeadingQuestionEnumeration,
  stripOuterParens,
} from '@/lib/questionHeader';

const PLACEHOLDER_RE = /^(n[aã]o\s+informado|nao\s+informado|n\/a|—|-|\.)$/i;
const CARGO_HEADER = DEFAULT_CARGO_HEADER;
const PROVA_PADRAO = DEFAULT_CARGO_HEADER;

export type CatalogNormalizeChangeCode =
  | 'meta_cargo_header'
  | 'meta_prova'
  | 'meta_topico'
  | 'meta_banca'
  | 'meta_orgao'
  | 'meta_ano'
  | 'meta_subtopico'
  | 'meta_header_line_removed'
  | 'instruction_cleaned'
  | 'text_fragment_cleaned'
  | 'slides_normalized'
  | 'slides_legacy_fixed';

export type CatalogNormalizeResult = {
  changed: boolean;
  changes: CatalogNormalizeChangeCode[];
  payload: unknown;
  zodValid: boolean;
  zodMessage?: string;
  tecconcursos: boolean;
  exception?: string;
};

export type ExtractedExamHeader = {
  banca: string;
  orgao: string;
  ano: string;
  subjectLine?: string;
};

function isPlaceholder(value: string | undefined | null): boolean {
  if (!value?.trim()) return true;
  return PLACEHOLDER_RE.test(value.trim());
}

function clonePayload(payload: unknown): Record<string, unknown> {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return {};
  }
  return JSON.parse(JSON.stringify(payload)) as Record<string, unknown>;
}

/** Linha de prova copiada do PDF: `QUADRIX - Tec (FUABC)/FUABC/Enfermagem/2025` */
export function extractExamHeaderFromText(text: string): ExtractedExamHeader | null {
  const line = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .find((l) => /\s-\s*(?:Tec|TEnf)\s*\(/i.test(l));
  if (!line) return null;

  const match = line.match(
    /^([A-Z0-9&][A-Z0-9&\s.-]{0,40}?)\s*-\s*(?:Tec|TEnf)\s*\(([^)]+)\)\/(.+?)\/(\d{4})\s*$/i,
  );
  if (!match) {
    const loose = line.match(
      /^([A-Z0-9&][A-Z0-9&\s.-]{0,40}?)\s*-\s*(?:Tec|TEnf)\s*\(([^)]+)\)\/(.+)\/(\d{4})\s*$/i,
    );
    if (!loose) return null;
    const [, banca, orgao, , ano] = loose;
    return {
      banca: banca.trim(),
      orgao: orgao.trim(),
      ano: ano.trim(),
    };
  }

  const [, banca, orgao, , ano] = match;
  return {
    banca: banca.trim(),
    orgao: orgao.trim(),
    ano: ano.trim(),
  };
}

/** `Enfermagem - Imunização` dentro do instruction. */
export function extractSubjectLineFromText(text: string): string | null {
  const line = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .find((l) => /^Enfermagem\s*-\s*.+/i.test(l));
  if (!line) return null;
  const m = line.match(/^Enfermagem\s*-\s*(.+)$/i);
  return m?.[1]?.trim() ?? null;
}

const CADERNO_NOISE_LINES = [
  /^QUESTÕES\s+DE\s+TEC\s+DE\s+ENFERMAGEM\s*$/i,
  /^Ordenação:\s*Por\s+Matéria\s+e\s+Assunto\s*$/i,
];

function shouldDropInstructionLine(line: string, meta: Record<string, unknown>): boolean {
  const trimmed = line.trim();
  if (!trimmed) return true;

  if (CADERNO_NOISE_LINES.some((re) => re.test(trimmed))) return true;

  if (/\s-\s*(?:Tec|TEnf)\s*\(/i.test(trimmed) && /\d{4}\s*$/.test(trimmed)) {
    return true;
  }

  const sub = typeof meta.subtopico === 'string' ? meta.subtopico.trim() : '';
  if (/^Enfermagem\s*-\s*/i.test(trimmed)) {
    if (!sub) return true;
    const subjectInLine = trimmed.replace(/^Enfermagem\s*-\s*/i, '').trim();
    if (subjectInLine === sub || subjectInLine.toLowerCase() === sub.toLowerCase()) {
      return true;
    }
    return true;
  }

  if (/^Enfermagem$/i.test(trimmed)) return true;

  if (/^Não informado(\/Não informado\/\d{4})?$/i.test(trimmed)) return true;

  return false;
}

export function cleanInstructionText(
  instruction: string,
  meta: Record<string, unknown> = {},
): string {
  if (!instruction?.trim()) return instruction ?? '';

  let lines = instruction.replace(/\r\n/g, '\n').split('\n');
  lines = lines.filter((line) => !shouldDropInstructionLine(line, meta));

  let joined = lines.join('\n').trim();

  joined = joined.replace(/^\s*Enfermagem\s*\n\s*/i, '');

  let prev = '';
  while (prev !== joined) {
    prev = joined;
    joined = stripLeadingQuestionEnumeration(joined);
    joined = joined.replace(/^\s*Enfermagem\s*\n\s*\d{1,4}\)\s*/i, '');
    joined = joined.replace(/^\s*\d{1,4}\)\s*/, '');
  }

  return joined.trim();
}

function asMetaRecord(payload: Record<string, unknown>): Record<string, unknown> {
  const meta = payload.meta;
  if (!meta || typeof meta !== 'object' || Array.isArray(meta)) {
    payload.meta = {};
  }
  return payload.meta as Record<string, unknown>;
}

function asQuestionData(payload: Record<string, unknown>): Record<string, unknown> {
  const qd = payload.question_data;
  if (!qd || typeof qd !== 'object' || Array.isArray(qd)) {
    payload.question_data = { instruction: '', options: [] };
  }
  return payload.question_data as Record<string, unknown>;
}

function pushChange(changes: CatalogNormalizeChangeCode[], code: CatalogNormalizeChangeCode) {
  if (!changes.includes(code)) changes.push(code);
}

export function normalizeQuestaoCatalogPayload(payload: unknown): CatalogNormalizeResult {
  const changes: CatalogNormalizeChangeCode[] = [];
  const base = clonePayload(payload);
  const rawInstruction =
    typeof (base.question_data as Record<string, unknown> | undefined)?.instruction === 'string'
      ? ((base.question_data as Record<string, unknown>).instruction as string)
      : '';

  const extracted = extractExamHeaderFromText(rawInstruction);
  const extractedSubject = extractSubjectLineFromText(rawInstruction);

  const beforeSlides = JSON.stringify({
    reverse_study_slides: (base as Record<string, unknown>).reverse_study_slides,
    study_slides: (base as Record<string, unknown>).study_slides,
  });
  let working = normalizeQuestaoSlideArrays(base) as Record<string, unknown>;
  const afterSlides = JSON.stringify({
    reverse_study_slides: working.reverse_study_slides,
    study_slides: working.study_slides,
  });
  if (beforeSlides !== afterSlides) {
    pushChange(changes, 'slides_normalized');
  }

  const meta = asMetaRecord(working);
  const questionData = asQuestionData(working);

  if ('header_line' in meta) {
    delete meta.header_line;
    pushChange(changes, 'meta_header_line_removed');
  }

  if (meta.cargo_header !== CARGO_HEADER) {
    meta.cargo_header = CARGO_HEADER;
    pushChange(changes, 'meta_cargo_header');
  }

  if (isPlaceholder(meta.prova as string | undefined)) {
    meta.prova = PROVA_PADRAO;
    pushChange(changes, 'meta_prova');
  }

  if (meta.topico === 'Geral') {
    meta.topico = 'Enfermagem';
    pushChange(changes, 'meta_topico');
  }

  if (isPlaceholder(meta.banca as string | undefined) && extracted?.banca) {
    meta.banca = extracted.banca;
    pushChange(changes, 'meta_banca');
  }

  if (isPlaceholder(meta.orgao as string | undefined) && extracted?.orgao) {
    meta.orgao = extracted.orgao;
    pushChange(changes, 'meta_orgao');
  } else if (typeof meta.orgao === 'string' && meta.orgao.trim()) {
    const stripped = stripOuterParens(meta.orgao.trim());
    if (stripped !== meta.orgao) {
      meta.orgao = stripped;
      pushChange(changes, 'meta_orgao');
    }
  }

  if (isPlaceholder(meta.ano as string | undefined) && extracted?.ano) {
    meta.ano = extracted.ano;
    pushChange(changes, 'meta_ano');
  }

  if (
    (!meta.subtopico || isPlaceholder(meta.subtopico as string)) &&
    extractedSubject
  ) {
    meta.subtopico = extractedSubject;
    pushChange(changes, 'meta_subtopico');
  }

  const instructionBefore =
    typeof questionData.instruction === 'string' ? questionData.instruction : '';
  const instructionAfter = cleanInstructionText(instructionBefore, meta);
  if (instructionAfter !== instructionBefore) {
    questionData.instruction = instructionAfter;
    pushChange(changes, 'instruction_cleaned');
  }

  if (typeof questionData.text_fragment === 'string' && questionData.text_fragment.trim()) {
    const fragmentBefore = questionData.text_fragment;
    const fragmentAfter = cleanInstructionText(fragmentBefore, meta);
    if (fragmentAfter !== fragmentBefore) {
      questionData.text_fragment = fragmentAfter;
      pushChange(changes, 'text_fragment_cleaned');
    }
  }

  if (fixLegacySlidesInPayload(working)) {
    pushChange(changes, 'slides_legacy_fixed');
  }

  const tecconcursos = payloadContainsTecconcursosReference(working);
  const parsed = QuestaoCompletaSchema.safeParse(working);

  let exception: string | undefined;
  if (isPlaceholder(meta.orgao as string | undefined)) {
    exception = 'orgao_not_inferable';
  }

  const changed = !payloadsEqual(payload, working);

  return {
    changed,
    changes,
    payload: working,
    zodValid: parsed.success,
    zodMessage: parsed.success ? undefined : parsed.error.issues[0]?.message,
    tecconcursos,
    exception,
  };
}

function truncateLabel(text: string, max = 120): string {
  const t = text.trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max - 1).trimEnd();
  return `${cut}…`;
}

/** Converte itens legados (`text`, `title`/`description`) para `label` + `detail`. */
function fixDangerZoneItem(item: unknown, index: number): Record<string, unknown> {
  if (!item || typeof item !== 'object' || Array.isArray(item)) {
    return { label: `Pegadinha ${index + 1}` };
  }
  const o = { ...(item as Record<string, unknown>) };
  const existingLabel = typeof o.label === 'string' ? o.label.trim() : '';
  if (existingLabel) {
    if (!o.detail && typeof o.description === 'string') o.detail = o.description;
    if (!o.detail && typeof o.text === 'string') o.detail = o.text;
    delete o.text;
    delete o.title;
    delete o.description;
    return o;
  }
  if (typeof o.title === 'string' && o.title.trim()) {
    o.label = o.title.trim();
    if (!o.detail && typeof o.description === 'string') o.detail = o.description;
    delete o.title;
    delete o.description;
    delete o.text;
    return o;
  }
  if (typeof o.text === 'string' && o.text.trim()) {
    const text = o.text.trim();
    const colon = text.indexOf(':');
    if (colon > 0 && colon < 80) {
      o.label = truncateLabel(text.slice(0, colon));
      o.detail = text.slice(colon + 1).trim() || text;
    } else {
      o.label = `Pegadinha ${index + 1}`;
      o.detail = text;
    }
    delete o.text;
    return o;
  }
  o.label = `Pegadinha ${index + 1}`;
  return o;
}

/** Corrige `danger_zone` legado: exige `content` e itens com `label`. */
export function fixLegacyDangerZoneSlide(slide: Record<string, unknown>): boolean {
  let fixed = false;
  const content = typeof slide.content === 'string' ? slide.content.trim() : '';
  if (!content) {
    const fallback =
      (typeof slide.title === 'string' && slide.title.trim()) ||
      (typeof slide.description === 'string' && slide.description.trim()) ||
      'CUIDADO: Erros comuns neste tema';
    slide.content = fallback;
    fixed = true;
  }
  if ('title' in slide) {
    delete slide.title;
    fixed = true;
  }
  if ('description' in slide) {
    delete slide.description;
    fixed = true;
  }
  if (Array.isArray(slide.items)) {
    const before = JSON.stringify(slide.items);
    slide.items = slide.items.map((item, i) => fixDangerZoneItem(item, i));
    if (JSON.stringify(slide.items) !== before) fixed = true;
  }
  return fixed;
}

function fixLegacySlidesInPayload(payload: Record<string, unknown>): boolean {
  const keys = ['reverse_study_slides', 'study_slides'] as const;
  let anyFixed = false;
  for (const key of keys) {
    const slides = payload[key];
    if (!Array.isArray(slides)) continue;
    for (const slide of slides) {
      if (!slide || typeof slide !== 'object' || Array.isArray(slide)) continue;
      const s = slide as Record<string, unknown>;
      if (s.type === 'danger_zone' && fixLegacyDangerZoneSlide(s)) {
        anyFixed = true;
      }
    }
  }
  return anyFixed;
}

export function payloadsEqual(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}
