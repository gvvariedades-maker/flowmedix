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

/**
 * Infere rótulo de cargo para a linha de prova (ex.: PDF "Tec Enf" → TÉCNICO).
 * Use `meta.cargo_header` quando quiser forçar outro texto (ex.: ENFERMEIRO).
 */
export function inferCargoHeaderFromProva(prova?: string): string {
  if (!prova?.trim()) return '';
  const n = prova
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase();
  if (/\btec(\.|nico)?\s*enf\b/.test(n)) return 'TÉCNICO';
  if (/tecnico\s+de\s+enfermagem/.test(n)) return 'TÉCNICO';
  if (/\bt[eé]cnico\b/.test(n) && /\benf\b/.test(n)) return 'TÉCNICO';
  return '';
}

const EN_DASH = '\u2013';

/**
 * Linha 1 — formato AVANT (estilo CPCON / concurso técnico):
 * `BANCA – TÉCNICO (Órgão) ANO`
 *
 * Não inclui tópico/subtópico (ficam na linha 2 via buildQuestionSubjectLine).
 * Se não houver dados para esse formato, usa o legado `Banca - Prova/Órgão/Ano`.
 */
export function buildDerivedQuestionHeaderLine(meta: LessonMeta): string {
  const banca = meta.banca?.trim() || '';
  const orgaoInner = stripOuterParens(meta.orgao?.trim() || '');
  const ano = meta.ano?.trim() || '';
  const cargo =
    meta.cargo_header?.trim() ||
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

/** Linha de matéria: `Tópico - Subtópico` quando ambos existem. */
export function buildQuestionSubjectLine(meta: LessonMeta): string | null {
  const topico = meta.topico?.trim();
  const sub = meta.subtopico?.trim();
  if (!topico) return null;
  if (sub && sub !== topico) return `${topico} - ${sub}`;
  return topico;
}
