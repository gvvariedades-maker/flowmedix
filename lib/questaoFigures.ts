/**
 * Contrato de figuras no enunciado — URL allowlist e helpers compartilhados.
 * @see docs/DECISAO_QUESTAO_FIGURES.md
 */

export const QUESTAO_FIGURE_KINDS = ['scan', 'crop', 'redraw'] as const;
export type QuestaoFigureKind = (typeof QUESTAO_FIGURE_KINDS)[number];

export const QUESTAO_FIGURE_POLICIES = ['required', 'transcribed'] as const;
export type QuestaoFigurePolicy = (typeof QUESTAO_FIGURE_POLICIES)[number];

export type QuestaoFigure = {
  id: string;
  url: string;
  alt: string;
  caption?: string;
  kind?: QuestaoFigureKind;
  source_page?: number;
};

const LOCALHOST_HOSTS = new Set(['localhost', '127.0.0.1']);

/** Host Supabase Storage derivado de NEXT_PUBLIC_SUPABASE_URL (sem env nova). */
export function getSupabaseStorageHost(): string | null {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!raw) return null;
  try {
    return new URL(raw).hostname;
  } catch {
    return null;
  }
}

/** Hosts permitidos para `question_data.figures[].url`. */
export function getAllowedQuestaoFigureHosts(): string[] {
  const hosts: string[] = [...LOCALHOST_HOSTS];
  const supabaseHost = getSupabaseStorageHost();
  if (supabaseHost) hosts.push(supabaseHost);
  return hosts;
}

export function isAllowedQuestaoFigureUrl(url: string): boolean {
  if (!url?.trim()) return false;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return false;
    if (parsed.protocol === 'http:' && !LOCALHOST_HOSTS.has(parsed.hostname)) return false;
    return getAllowedQuestaoFigureHosts().includes(parsed.hostname);
  } catch {
    return false;
  }
}

/** Texto útil em `text_fragment` para política `transcribed` (HTML sanitizado). */
export function hasUsefulFigureTranscription(textFragment?: string | null): boolean {
  if (!textFragment?.trim()) return false;
  const plain = textFragment
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return plain.length >= 20;
}

export function hasValidQuestaoFigures(figures?: QuestaoFigure[] | null): boolean {
  if (!Array.isArray(figures) || figures.length === 0) return false;
  return figures.every(
    (f) =>
      Boolean(f?.id?.trim()) &&
      Boolean(f?.alt?.trim()) &&
      Boolean(f?.url?.trim()) &&
      isAllowedQuestaoFigureUrl(f.url),
  );
}
