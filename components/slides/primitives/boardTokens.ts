/**
 * Tokens de polaridade do board kit (NeuroSlides glanceable).
 * Superfície editorial light — sem neon Cyber nos cards de conteúdo.
 * Alinhado ao piloto Ética Adolescente v2 (emerald keep / rose exception / sky command / …).
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
};

const TONE_MAP: Record<BoardTone, BoardToneClasses> = {
  ok: {
    panel: 'border-emerald-300 bg-emerald-50/95 text-emerald-950',
    border: 'border-emerald-300',
    bg: 'bg-emerald-50/95',
    text: 'text-emerald-950',
    badge: 'bg-emerald-100',
    badgeText: 'text-emerald-900',
    accent: 'bg-emerald-500',
    strip: 'border-emerald-200 bg-emerald-50/90 text-emerald-900',
    columnLabel: 'text-emerald-800',
  },
  keep: {
    panel: 'border-emerald-300 bg-emerald-50 text-emerald-950',
    border: 'border-emerald-300',
    bg: 'bg-emerald-50',
    text: 'text-emerald-950',
    badge: 'bg-emerald-100',
    badgeText: 'text-emerald-900',
    accent: 'bg-emerald-500',
    strip: 'border-emerald-200 bg-emerald-50/90 text-emerald-900',
    columnLabel: 'text-emerald-800',
  },
  barrier: {
    panel: 'border-rose-300 bg-rose-50/95 text-rose-950',
    border: 'border-rose-300',
    bg: 'bg-rose-50/95',
    text: 'text-rose-950',
    badge: 'bg-rose-100',
    badgeText: 'text-rose-900',
    accent: 'bg-rose-500',
    strip: 'border-rose-200 bg-rose-50/90 text-rose-900',
    columnLabel: 'text-rose-800',
  },
  exception: {
    panel: 'border-rose-400 bg-rose-50/95 text-rose-950',
    border: 'border-rose-400',
    bg: 'bg-rose-50/95',
    text: 'text-rose-950',
    badge: 'bg-rose-100',
    badgeText: 'text-rose-900',
    accent: 'bg-rose-500',
    strip: 'border-rose-200 bg-rose-50/90 text-rose-900',
    columnLabel: 'text-rose-800',
  },
  command: {
    panel: 'border-sky-300 bg-sky-50 text-sky-950',
    border: 'border-sky-300',
    bg: 'bg-sky-50',
    text: 'text-sky-950',
    badge: 'bg-sky-100',
    badgeText: 'text-sky-900',
    accent: 'bg-sky-500',
    strip: 'border-sky-200 bg-sky-50/90 text-sky-900',
    columnLabel: 'text-sky-800',
  },
  transfer: {
    panel: 'border-amber-300 bg-amber-50 text-amber-950',
    border: 'border-amber-300',
    bg: 'bg-amber-50/90',
    text: 'text-amber-950',
    badge: 'bg-amber-100',
    badgeText: 'text-amber-900',
    accent: 'bg-amber-500',
    strip: 'border-amber-200 bg-amber-50/90 text-amber-900',
    columnLabel: 'text-amber-800',
  },
  rights: {
    panel: 'border-indigo-300 bg-indigo-50/95 text-indigo-950',
    border: 'border-indigo-300',
    bg: 'bg-indigo-50/95',
    text: 'text-indigo-950',
    badge: 'bg-indigo-100',
    badgeText: 'text-indigo-900',
    accent: 'bg-indigo-500',
    strip: 'border-indigo-200 bg-indigo-50/90 text-indigo-900',
    columnLabel: 'text-indigo-800',
  },
  info: {
    panel: 'border-sky-200/70 bg-sky-50/80 text-sky-900/85',
    border: 'border-sky-200/70',
    bg: 'bg-sky-50/80',
    text: 'text-sky-900/85',
    badge: 'bg-sky-100',
    badgeText: 'text-sky-800',
    accent: 'bg-sky-400',
    strip: 'border-sky-200 bg-sky-50/80 text-sky-800',
    columnLabel: 'text-sky-700/90',
  },
  warn: {
    panel: 'border-amber-200/80 bg-amber-50/90 text-amber-950',
    border: 'border-amber-200/80',
    bg: 'bg-amber-50/90',
    text: 'text-amber-950',
    badge: 'bg-amber-100',
    badgeText: 'text-amber-900',
    accent: 'bg-amber-500',
    strip: 'border-amber-200 bg-amber-50/90 text-amber-900',
    columnLabel: 'text-amber-800',
  },
  neutral: {
    panel: 'border-slate-200 bg-white text-slate-900',
    border: 'border-slate-200',
    bg: 'bg-white',
    text: 'text-slate-900',
    badge: 'bg-slate-100',
    badgeText: 'text-slate-800',
    accent: 'bg-slate-500',
    strip: 'border-slate-200 bg-slate-50 text-slate-800',
    columnLabel: 'text-slate-600',
  },
  accent: {
    panel: 'border-sky-300/90 bg-white/95 text-slate-900',
    border: 'border-sky-300/90',
    bg: 'bg-white/95',
    text: 'text-slate-900',
    badge: 'bg-sky-100',
    badgeText: 'text-sky-900',
    accent: 'bg-sky-500',
    strip: 'border-sky-200 bg-sky-50/80 text-sky-800',
    columnLabel: 'text-sky-700/90',
  },
  teal: {
    panel: 'border-teal-300/90 bg-white/95 text-slate-900',
    border: 'border-teal-300/90',
    bg: 'bg-white/95',
    text: 'text-slate-900',
    badge: 'bg-teal-100',
    badgeText: 'text-teal-900',
    accent: 'bg-teal-500',
    strip: 'border-teal-200 bg-teal-50/90 text-teal-900',
    columnLabel: 'text-teal-800',
  },
  lime: {
    panel: 'border-lime-300 bg-lime-50/95 text-lime-950',
    border: 'border-lime-300',
    bg: 'bg-lime-50/95',
    text: 'text-lime-950',
    badge: 'bg-lime-100',
    badgeText: 'text-lime-900',
    accent: 'bg-lime-500',
    strip: 'border-lime-200 bg-lime-50/90 text-lime-900',
    columnLabel: 'text-lime-800',
  },
};

/** Classes canônicas por tone. */
export function boardTone(tone: BoardTone = 'neutral'): BoardToneClasses {
  return TONE_MAP[tone] ?? TONE_MAP.neutral;
}

/** Eyebrow mono (rótulo de board). */
export const BOARD_EYEBROW =
  'text-center font-mono text-[10px] font-bold uppercase tracking-widest text-sky-700/90';

/** Título de coluna (TwoColumnBoard). */
export const BOARD_COLUMN_EYEBROW =
  'font-mono text-[9px] font-bold uppercase tracking-widest';

/** Footer rule padrão (transferência). */
export const BOARD_FOOTER =
  'rounded-xl border border-sky-200/70 bg-sky-50/80 px-3 py-2.5 text-center font-body text-sm italic text-sky-900/85';

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
