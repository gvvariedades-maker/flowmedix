/**
 * Acento por subtópico (Opção A) — uma cor de destaque sobre superfície neutra.
 * Preview e futura migração do themeGenerator.
 */

export type FocusAccentName =
  | 'rose'
  | 'violet'
  | 'indigo'
  | 'cyan'
  | 'emerald'
  | 'amber'
  | 'orange'
  | 'fuchsia'
  | 'sky'
  | 'lime'
  | 'teal'
  | 'blue'
  | 'purple'
  | 'pink';

export interface FocusAccent {
  name: FocusAccentName;
  /** Cor sólida para glow/borda inline */
  hex: string;
  chipBg: string;
  chipText: string;
  chipRing: string;
  border: string;
  iconBg: string;
  iconText: string;
  titleText: string;
  glow: string;
}

export const FOCUS_ACCENT_PALETTE: Record<FocusAccentName, FocusAccent> = {
  rose: {
    name: 'rose',
    hex: '#f43f5e',
    chipBg: 'bg-rose-500/12',
    chipText: 'text-rose-200',
    chipRing: 'ring-rose-500/25',
    border: 'border-rose-500/30',
    iconBg: 'bg-rose-500/15',
    iconText: 'text-rose-300',
    titleText: 'text-rose-100',
    glow: 'rgba(244, 63, 94, 0.14)',
  },
  violet: {
    name: 'violet',
    hex: '#8b5cf6',
    chipBg: 'bg-violet-500/12',
    chipText: 'text-violet-200',
    chipRing: 'ring-violet-500/25',
    border: 'border-violet-500/30',
    iconBg: 'bg-violet-500/15',
    iconText: 'text-violet-300',
    titleText: 'text-violet-100',
    glow: 'rgba(139, 92, 246, 0.14)',
  },
  indigo: {
    name: 'indigo',
    hex: '#6366f1',
    chipBg: 'bg-indigo-500/12',
    chipText: 'text-indigo-200',
    chipRing: 'ring-indigo-500/25',
    border: 'border-indigo-500/30',
    iconBg: 'bg-indigo-500/15',
    iconText: 'text-indigo-300',
    titleText: 'text-indigo-100',
    glow: 'rgba(99, 102, 241, 0.14)',
  },
  cyan: {
    name: 'cyan',
    hex: '#06b6d4',
    chipBg: 'bg-cyan-500/12',
    chipText: 'text-cyan-200',
    chipRing: 'ring-cyan-500/25',
    border: 'border-cyan-500/30',
    iconBg: 'bg-cyan-500/15',
    iconText: 'text-cyan-300',
    titleText: 'text-cyan-100',
    glow: 'rgba(6, 182, 212, 0.14)',
  },
  emerald: {
    name: 'emerald',
    hex: '#10b981',
    chipBg: 'bg-emerald-500/12',
    chipText: 'text-emerald-200',
    chipRing: 'ring-emerald-500/25',
    border: 'border-emerald-500/30',
    iconBg: 'bg-emerald-500/15',
    iconText: 'text-emerald-300',
    titleText: 'text-emerald-100',
    glow: 'rgba(16, 185, 129, 0.14)',
  },
  amber: {
    name: 'amber',
    hex: '#f59e0b',
    chipBg: 'bg-amber-500/12',
    chipText: 'text-amber-200',
    chipRing: 'ring-amber-500/25',
    border: 'border-amber-500/30',
    iconBg: 'bg-amber-500/15',
    iconText: 'text-amber-300',
    titleText: 'text-amber-100',
    glow: 'rgba(245, 158, 11, 0.14)',
  },
  orange: {
    name: 'orange',
    hex: '#f97316',
    chipBg: 'bg-orange-500/12',
    chipText: 'text-orange-200',
    chipRing: 'ring-orange-500/25',
    border: 'border-orange-500/30',
    iconBg: 'bg-orange-500/15',
    iconText: 'text-orange-300',
    titleText: 'text-orange-100',
    glow: 'rgba(249, 115, 22, 0.14)',
  },
  fuchsia: {
    name: 'fuchsia',
    hex: '#d946ef',
    chipBg: 'bg-fuchsia-500/12',
    chipText: 'text-fuchsia-200',
    chipRing: 'ring-fuchsia-500/25',
    border: 'border-fuchsia-500/30',
    iconBg: 'bg-fuchsia-500/15',
    iconText: 'text-fuchsia-300',
    titleText: 'text-fuchsia-100',
    glow: 'rgba(217, 70, 239, 0.14)',
  },
  sky: {
    name: 'sky',
    hex: '#0ea5e9',
    chipBg: 'bg-sky-500/12',
    chipText: 'text-sky-200',
    chipRing: 'ring-sky-500/25',
    border: 'border-sky-500/30',
    iconBg: 'bg-sky-500/15',
    iconText: 'text-sky-300',
    titleText: 'text-sky-100',
    glow: 'rgba(14, 165, 233, 0.14)',
  },
  lime: {
    name: 'lime',
    hex: '#84cc16',
    chipBg: 'bg-lime-500/12',
    chipText: 'text-lime-200',
    chipRing: 'ring-lime-500/25',
    border: 'border-lime-500/30',
    iconBg: 'bg-lime-500/15',
    iconText: 'text-lime-300',
    titleText: 'text-lime-100',
    glow: 'rgba(132, 204, 22, 0.14)',
  },
  teal: {
    name: 'teal',
    hex: '#14b8a6',
    chipBg: 'bg-teal-500/12',
    chipText: 'text-teal-200',
    chipRing: 'ring-teal-500/25',
    border: 'border-teal-500/30',
    iconBg: 'bg-teal-500/15',
    iconText: 'text-teal-300',
    titleText: 'text-teal-100',
    glow: 'rgba(20, 184, 166, 0.14)',
  },
  blue: {
    name: 'blue',
    hex: '#3b82f6',
    chipBg: 'bg-blue-500/12',
    chipText: 'text-blue-200',
    chipRing: 'ring-blue-500/25',
    border: 'border-blue-500/30',
    iconBg: 'bg-blue-500/15',
    iconText: 'text-blue-300',
    titleText: 'text-blue-100',
    glow: 'rgba(59, 130, 246, 0.14)',
  },
  purple: {
    name: 'purple',
    hex: '#a855f7',
    chipBg: 'bg-purple-500/12',
    chipText: 'text-purple-200',
    chipRing: 'ring-purple-500/25',
    border: 'border-purple-500/30',
    iconBg: 'bg-purple-500/15',
    iconText: 'text-purple-300',
    titleText: 'text-purple-100',
    glow: 'rgba(168, 85, 247, 0.14)',
  },
  pink: {
    name: 'pink',
    hex: '#ec4899',
    chipBg: 'bg-pink-500/12',
    chipText: 'text-pink-200',
    chipRing: 'ring-pink-500/25',
    border: 'border-pink-500/30',
    iconBg: 'bg-pink-500/15',
    iconText: 'text-pink-300',
    titleText: 'text-pink-100',
    glow: 'rgba(236, 72, 153, 0.14)',
  },
};

/** Sinais vitais / processo de enfermagem no mapa de subtópicos → rose */
export const PREVIEW_FOCUS_ACCENT = FOCUS_ACCENT_PALETTE.rose;
