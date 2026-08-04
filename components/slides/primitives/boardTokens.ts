/**
 * Tokens de polaridade do board kit (NeuroSlides glanceable).
 * Superfície editorial light — sem neon Cyber nos cards de conteúdo.
 * Barra G2 (2026-08-04): massa + cor = decisão — docs/NEUROSLIDES_VISUAL_BAR.md
 */

export type BoardTone =
  | 'ok'
  | 'keep'
  | 'barrier'
  | 'exception'
  | 'command'
  | 'transfer'
  | 'rights'
  | 'info'
  | 'warn'
  | 'neutral'
  | 'accent'
  | 'teal'
  /** PNI / Imunização — lime (template do pacote). */
  | 'lime';

export type BoardToneClasses = {
  /** Painel completo (borda + fundo + texto base). */
  panel: string;
  /** Só borda. */
  border: string;
  /** Fundo. */
  bg: string;
  /** Texto do corpo. */
  text: string;
  /** Chip / badge fundo. */
  badge: string;
  /** Chip / badge texto. */
  badgeText: string;
  /** Dot / accent bar. */
  accent: string;
  /** Faixa CategoryStrip. */
  strip: string;
  /** Rótulo de coluna (mono uppercase). */
  columnLabel: string;
  /** Ring/glow quando o painel é herói (emphasized). */
  heroRing: string;
};

const TONE_MAP: Record<BoardTone, BoardToneClasses> = {
  ok: {
    panel: 'border-emerald-400 bg-gradient-to-br from-emerald-50 to-emerald-100/90 text-emerald-950',
    border: 'border-emerald-400',
    bg: 'bg-emerald-50',
    text: 'text-emerald-950',
    badge: 'bg-emerald-600',
    badgeText: 'text-white',
    accent: 'bg-emerald-500',
    strip: 'border-emerald-300 bg-emerald-50 text-emerald-900',
    columnLabel: 'text-emerald-800',
    heroRing: 'ring-2 ring-emerald-300/80 ring-offset-2 ring-offset-white shadow-lg shadow-emerald-500/20',
  },
  keep: {
    panel: 'border-emerald-400 bg-gradient-to-br from-emerald-50 to-emerald-100/90 text-emerald-950',
    border: 'border-emerald-400',
    bg: 'bg-emerald-50',
    text: 'text-emerald-950',
    badge: 'bg-emerald-700',
    badgeText: 'text-white',
    accent: 'bg-emerald-500',
    strip: 'border-emerald-300 bg-emerald-50 text-emerald-900',
    columnLabel: 'text-emerald-800',
    heroRing: 'ring-2 ring-emerald-300/80 ring-offset-2 ring-offset-white shadow-lg shadow-emerald-500/20',
  },
  barrier: {
    panel: 'border-rose-400 bg-gradient-to-br from-rose-50 to-rose-100/90 text-rose-950',
    border: 'border-rose-400',
    bg: 'bg-rose-50',
    text: 'text-rose-950',
    badge: 'bg-rose-600',
    badgeText: 'text-white',
    accent: 'bg-rose-500',
    strip: 'border-rose-300 bg-rose-50 text-rose-900',
    columnLabel: 'text-rose-800',
    heroRing: 'ring-2 ring-rose-300/90 ring-offset-2 ring-offset-white shadow-lg shadow-rose-500/25',
  },
  exception: {
    panel: 'border-rose-500 bg-gradient-to-br from-rose-50 via-rose-100/95 to-rose-200/70 text-rose-950',
    border: 'border-rose-500',
    bg: 'bg-rose-50',
    text: 'text-rose-950',
    badge: 'bg-rose-600',
    badgeText: 'text-white',
    accent: 'bg-rose-500',
    strip: 'border-rose-300 bg-rose-50 text-rose-900',
    columnLabel: 'text-rose-800',
    heroRing:
      'z-[1] scale-[1.02] ring-2 ring-rose-400/90 ring-offset-2 ring-offset-white shadow-xl shadow-rose-500/30',
  },
  command: {
    panel: 'border-sky-400 bg-gradient-to-br from-sky-50 to-sky-100/90 text-sky-950',
    border: 'border-sky-400',
    bg: 'bg-sky-50',
    text: 'text-sky-950',
    badge: 'bg-sky-600',
    badgeText: 'text-white',
    accent: 'bg-sky-500',
    strip: 'border-sky-300 bg-sky-50 text-sky-900',
    columnLabel: 'text-sky-800',
    heroRing: 'ring-2 ring-sky-300/80 ring-offset-2 ring-offset-white shadow-lg shadow-sky-500/20',
  },
  transfer: {
    panel: 'border-amber-400 bg-gradient-to-br from-amber-50 to-amber-100/90 text-amber-950',
    border: 'border-amber-400',
    bg: 'bg-amber-50',
    text: 'text-amber-950',
    badge: 'bg-amber-600',
    badgeText: 'text-white',
    accent: 'bg-amber-500',
    strip: 'border-amber-300 bg-amber-50 text-amber-900',
    columnLabel: 'text-amber-800',
    heroRing: 'ring-2 ring-amber-300/80 ring-offset-2 ring-offset-white shadow-lg shadow-amber-500/25',
  },
  rights: {
    panel: 'border-indigo-400 bg-gradient-to-br from-indigo-50 to-indigo-100/90 text-indigo-950',
    border: 'border-indigo-400',
    bg: 'bg-indigo-50',
    text: 'text-indigo-950',
    badge: 'bg-indigo-600',
    badgeText: 'text-white',
    accent: 'bg-indigo-500',
    strip: 'border-indigo-300 bg-indigo-50 text-indigo-900',
    columnLabel: 'text-indigo-800',
    heroRing: 'ring-2 ring-indigo-300/80 ring-offset-2 ring-offset-white shadow-lg shadow-indigo-500/20',
  },
  info: {
    panel: 'border-sky-300 bg-sky-50/95 text-sky-950',
    border: 'border-sky-300',
    bg: 'bg-sky-50/95',
    text: 'text-sky-950',
    badge: 'bg-sky-600',
    badgeText: 'text-white',
    accent: 'bg-sky-400',
    strip: 'border-sky-200 bg-sky-50 text-sky-800',
    columnLabel: 'text-sky-700',
    heroRing: 'ring-2 ring-sky-200/80 ring-offset-2 ring-offset-white shadow-md',
  },
  warn: {
    panel: 'border-amber-400 bg-gradient-to-br from-amber-50 to-amber-100 text-amber-950',
    border: 'border-amber-400',
    bg: 'bg-amber-50',
    text: 'text-amber-950',
    badge: 'bg-amber-600',
    badgeText: 'text-white',
    accent: 'bg-amber-500',
    strip: 'border-amber-300 bg-amber-50 text-amber-900',
    columnLabel: 'text-amber-800',
    heroRing: 'ring-2 ring-amber-300/80 ring-offset-2 ring-offset-white shadow-lg shadow-amber-500/25',
  },
  neutral: {
    panel: 'border-slate-300 bg-white text-slate-900',
    border: 'border-slate-300',
    bg: 'bg-white',
    text: 'text-slate-900',
    badge: 'bg-slate-700',
    badgeText: 'text-white',
    accent: 'bg-slate-500',
    strip: 'border-slate-200 bg-slate-50 text-slate-800',
    columnLabel: 'text-slate-600',
    heroRing: 'ring-2 ring-slate-200 ring-offset-2 ring-offset-white shadow-md',
  },
  accent: {
    panel: 'border-sky-400 bg-gradient-to-br from-white to-sky-50 text-slate-900',
    border: 'border-sky-400',
    bg: 'bg-sky-50/80',
    text: 'text-slate-900',
    badge: 'bg-sky-600',
    badgeText: 'text-white',
    accent: 'bg-sky-500',
    strip: 'border-sky-200 bg-sky-50 text-sky-800',
    columnLabel: 'text-sky-700',
    heroRing: 'ring-2 ring-sky-300/80 ring-offset-2 ring-offset-white shadow-lg shadow-sky-500/15',
  },
  teal: {
    panel: 'border-teal-400 bg-gradient-to-br from-teal-50 to-teal-100/90 text-teal-950',
    border: 'border-teal-400',
    bg: 'bg-teal-50',
    text: 'text-teal-950',
    badge: 'bg-teal-700',
    badgeText: 'text-white',
    accent: 'bg-teal-500',
    strip: 'border-teal-300 bg-teal-50 text-teal-900',
    columnLabel: 'text-teal-800',
    heroRing: 'ring-2 ring-teal-300/80 ring-offset-2 ring-offset-white shadow-lg shadow-teal-500/20',
  },
  lime: {
    panel: 'border-lime-400 bg-gradient-to-br from-lime-50 to-lime-100/90 text-lime-950',
    border: 'border-lime-400',
    bg: 'bg-lime-50',
    text: 'text-lime-950',
    badge: 'bg-lime-700',
    badgeText: 'text-white',
    accent: 'bg-lime-500',
    strip: 'border-lime-300 bg-lime-50 text-lime-900',
    columnLabel: 'text-lime-800',
    heroRing: 'ring-2 ring-lime-300/80 ring-offset-2 ring-offset-white shadow-lg shadow-lime-500/20',
  },
};

/** Classes canônicas por tone. */
export function boardTone(tone: BoardTone = 'neutral'): BoardToneClasses {
  return TONE_MAP[tone] ?? TONE_MAP.neutral;
}

/** Eyebrow mono (rótulo de board). */
export const BOARD_EYEBROW =
  'text-center font-mono text-[10px] font-bold uppercase tracking-widest text-sky-700';

/** Título de coluna (TwoColumnBoard). */
export const BOARD_COLUMN_EYEBROW =
  'font-mono text-[9px] font-bold uppercase tracking-widest';

/**
 * Footer de transferência / fixação — slogan de prova (barra G2).
 * Escuro + cyan; contraste alto no player.
 */
export const BOARD_FOOTER =
  'rounded-2xl border border-cyan-400/40 border-t-[3px] border-t-cyan-400 bg-slate-950 px-4 py-3.5 text-center font-body text-sm font-semibold leading-snug text-slate-100 shadow-lg shadow-slate-950/20 [&_strong]:font-bold [&_strong]:text-cyan-300';

/** Label opcional acima do footer (FIXAÇÃO / TRANSFERÊNCIA). */
export const BOARD_FOOTER_LABEL =
  'mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-cyan-300';

/**
 * Hints de authoring (placeholders “marque a row…”) — só em development.
 * Em produção o aluno nunca vê copy de handoff JSON.
 */
export function showBoardAuthoringHints(): boolean {
  return process.env.NODE_ENV === 'development';
}

/** Placeholder dashed quando a coluna está vazia. */
export function boardEmptyPlaceholder(tone: BoardTone = 'neutral'): string {
  const t = boardTone(tone);
  return `rounded-xl border border-dashed ${t.border} ${t.bg} px-3 py-2 font-body text-xs ${t.columnLabel} opacity-80`;
}
