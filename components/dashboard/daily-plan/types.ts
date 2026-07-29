import type { LucideIcon } from 'lucide-react';
import type { ReviewItem } from '@/lib/spaced-repetition';

/** Payload do Plano Diário (Server → Client). */
export interface PlanoDiarioProps {
  revisoes: ReviewItem[];
  totalPendentes: number;
  limite: number;
  /** Flag FSRS on + e-mail na allowlist — CTA para `/revisoes-hoje`. */
  showFsrsRevisoesCta?: boolean;
}

export type { ReviewItem } from '@/lib/spaced-repetition';

export interface TópicoUrgência {
  label: string;
  chipClass: string;
}

export interface TópicoCategoria {
  /** Classes Tailwind para o círculo do ícone. */
  circleClass: string;
  Icon: LucideIcon;
}
