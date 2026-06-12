/**
 * Acento por subtópico em fundo claro (Opção B) — borda/chip/ícone, não fundo saturado.
 */

export interface EditorialAccent {
  name: string;
  hex: string;
  chipBg: string;
  chipText: string;
  chipRing: string;
  border: string;
  iconBg: string;
  iconText: string;
  /** Glow sutil no fundo da superfície */
  glow: string;
}

/** Sinais vitais / processo de enfermagem — rose em modo editorial */
export const PREVIEW_EDITORIAL_ACCENT: EditorialAccent = {
  name: 'rose',
  hex: '#e11d48',
  chipBg: 'bg-rose-50',
  chipText: 'text-rose-700',
  chipRing: 'ring-rose-200',
  border: 'border-rose-200',
  iconBg: 'bg-rose-50',
  iconText: 'text-rose-600',
  glow: 'rgba(225, 29, 72, 0.06)',
};
