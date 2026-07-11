'use client';

import { resolveLucideIcon } from './lucideIcon';

type SlideLucideIconProps = {
  name: string | undefined;
  size?: number;
  className?: string;
};

/** Ícone Lucide dinâmico para moldes NeuroSlides (encapsula resolveLucideIcon). */
export function SlideLucideIcon({ name, size, className }: SlideLucideIconProps) {
  const Icon = resolveLucideIcon(name);
  return <Icon size={size} className={className} aria-hidden />;
}
