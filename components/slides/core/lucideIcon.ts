import { HelpCircle } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import type { ComponentType } from 'react';

type LucideIconProps = { size?: number; className?: string };

/** Resolve ícone Lucide (function ou forwardRef object) — alinhado a `LUCIDE_ICONS` em validations. */
export function resolveLucideIcon(
  iconName: string | undefined,
  fallback: ComponentType<LucideIconProps> = HelpCircle,
): ComponentType<LucideIconProps> {
  if (!iconName?.trim()) return fallback;
  const key = iconName.trim() as keyof typeof LucideIcons;
  const candidate = LucideIcons[key];
  if (
    candidate &&
    (typeof candidate === 'function' ||
      (typeof candidate === 'object' && candidate !== null))
  ) {
    return candidate as ComponentType<LucideIconProps>;
  }
  return fallback;
}
