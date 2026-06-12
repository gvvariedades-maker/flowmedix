import type { LessonMeta } from '@/types/lesson';

/**
 * Remove a enumeração global do caderno no início do enunciado (ex.: `1) `, `12) `).
 * PDF costuma trazer "1) De acordo..."; no AVANT exibe-se sem esse prefixo.
 * Também trata `<p>1) ` ou `<div>1) ` após tag de abertura.
 */
export function stripLeadingQuestionEnumeration(text: string): string {
  if (!text) return text;
  let s = text;
  s = s.replace(/^\s*\d{1,4}\)\s*/, '');
  s = s.replace(/^(<p\b[^>]*>)\s*\d{1,4}\)\s*/i, '$1');
  s = s.replace(/^(<div\b[^>]*>)\s*\d{1,4}\)\s*/i, '$1');
  return s;
}

/** Remove parênteses externos se o órgão vier assim no JSON. */
export function stripOuterParens(s: string): string {
  const t = s.trim();
  if (t.startsWith('(') && t.endsWith(')')) return t.slice(1, -1).trim();
  return t;
}

const EN_DASH = '\u2013';

/** Rótulo padrão na linha 1 para provas de Técnico em Enfermagem. */
export const DEFAULT_CARGO_HEADER = 'Técnico de Enfermagem';

const LEGACY_CARGO_ALIASES = new Set(['tecnico', 'técnico']);

/** Normaliza cargo legado abreviado (`TÉCNICO`) para o rótulo completo. */
export function normalizeCargoHeader(cargo?: string): string {
  const trimmed = cargo?.trim() || '';
  if (!trimmed) return '';
  const key = trimmed
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase();
  if (LEGACY_CARGO_ALIASES.has(key)) return DEFAULT_CARGO_HEADER;
  return trimmed;
}

/**
 * Infere rótulo de cargo para a linha de prova (ex.: PDF "Tec Enf" → Técnico de Enfermagem).
 * Use `meta.cargo_header` quando quiser forçar outro texto (ex.: ENFERMEIRO).
 */
export function inferCargoHeaderFromProva(prova?: string): string {
  if (!prova?.trim()) return '';
  const n = prova
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase();
  if (/\btec(\.|nico)?\s*enf\b/.test(n)) return DEFAULT_CARGO_HEADER;
  if (/tecnico\s+de\s+enfermagem/.test(n)) return DEFAULT_CARGO_HEADER;
  if (/\bt[eé]cnico\b/.test(n) && /\benf\b/.test(n)) return DEFAULT_CARGO_HEADER;
  return '';
}

/**
 * Linha 1 — formato AVANT (concurso técnico enfermagem):
 * `BANCA – Técnico de Enfermagem (Órgão) ANO`
 *
 * Não inclui tópico/subtópico (ficam na linha 2 via buildQuestionSubjectLine).
 * Se não houver dados para esse formato, usa o legado `Banca - Prova/Órgão/Ano`.
 */
export function buildDerivedQuestionHeaderLine(meta: LessonMeta): string {
  const banca = meta.banca?.trim() || '';
  const orgaoInner = stripOuterParens(meta.orgao?.trim() || '');
  const ano = meta.ano?.trim() || '';
  const cargo =
    normalizeCargoHeader(meta.cargo_header) ||
    inferCargoHeaderFromProva(meta.prova);

  if (banca && cargo && orgaoInner) {
    const anoPart = ano ? ` ${ano}` : '';
    return `${banca} ${EN_DASH} ${cargo} (${orgaoInner})${anoPart}`.replace(/\s+/g, ' ').trim();
  }

  const tail = [meta.prova, meta.orgao, meta.ano]
    .map((s) => (typeof s === 'string' ? s.trim() : ''))
    .filter(Boolean);
  if (tail.length === 0) return banca;
  return `${banca} - ${tail.join('/')}`;
}

export type QuestionHeaderChipTone = 'banca' | 'ano';

export interface QuestionHeaderChip {
  id: string;
  label: string;
  tone: QuestionHeaderChipTone;
}

/** Chips de escaneamento rápido (banca + ano) — estilo vitrine de questões. */
export function buildQuestionHeaderChips(meta: LessonMeta): QuestionHeaderChip[] {
  const chips: QuestionHeaderChip[] = [];
  const banca = meta.banca?.trim();
  const ano = meta.ano?.trim();
  if (banca) chips.push({ id: 'banca', label: banca, tone: 'banca' });
  if (ano) chips.push({ id: 'ano', label: ano, tone: 'ano' });
  return chips;
}

/** Cargo, órgão ou prova — complemento textual aos chips (não repetir banca/ano). */
export function buildQuestionExamDetailLine(meta: LessonMeta): string | null {
  const cargo =
    normalizeCargoHeader(meta.cargo_header) ||
    inferCargoHeaderFromProva(meta.prova);
  const orgao = stripOuterParens(meta.orgao?.trim() || '');
  const prova = meta.prova?.trim();

  if (cargo && orgao) return `${cargo} (${orgao})`;
  if (cargo) return cargo;
  if (orgao) return orgao;
  if (prova) return prova;
  return null;
}

/** Linha de matéria: `Tópico - Subtópico` quando ambos existem. Tópico genérico "Enfermagem" → só subtópico. */
export function buildQuestionSubjectLine(meta: LessonMeta): string | null {
  const topico = meta.topico?.trim();
  const sub = meta.subtopico?.trim();
  if (!topico) return null;
  if (sub && sub !== topico) {
    if (topico.toLowerCase() === 'enfermagem') return sub;
    return `${topico} - ${sub}`;
  }
  return topico;
}
