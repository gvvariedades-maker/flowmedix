import type { ThemeColors } from './themeGenerator';

export interface LogicFlowStepVisual {
  isCurrent: boolean;
  isPast: boolean;
  isFuture: boolean;
}

export function getLogicFlowStepVisual(
  revealed: boolean,
  isTapMode: boolean,
  active: boolean,
  isActiveHighlight: boolean,
): LogicFlowStepVisual {
  const isCurrent = revealed && (isTapMode ? active : isActiveHighlight);
  const isPast = revealed && !isCurrent;
  const isFuture = !revealed;
  return { isCurrent, isPast, isFuture };
}

export function logicFlowStepCardClass(
  visual: LogicFlowStepVisual,
  theme: ThemeColors,
  canTap: boolean,
): string {
  const parts = [
    'relative min-h-11 min-w-0 rounded-2xl border-2 bg-white p-3 shadow-sm transition-all duration-300 md:p-5',
    theme.borderColor,
  ];
  if (visual.isFuture) parts.push('opacity-40');
  else if (visual.isPast) parts.push('opacity-80 border-slate-200');
  else parts.push('opacity-100 shadow-md');
  if (visual.isCurrent) {
    parts.push('ring-2 ring-offset-2 ring-offset-white ring-violet-300/60');
  }
  if (canTap) parts.push('cursor-pointer hover:border-violet-300');
  return parts.join(' ');
}

export function logicFlowStepIconClass(visual: LogicFlowStepVisual): string {
  if (visual.isCurrent) {
    return 'btn-editorial-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-xl p-0 font-bold text-[#1a2e05] md:h-12 md:w-12';
  }
  if (visual.isPast) {
    return 'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200 md:h-12 md:w-12';
  }
  return 'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-400 ring-1 ring-slate-200 md:h-12 md:w-12';
}

export function logicFlowCardsGridClass(stepCount: number, steps: string[]): string {
  const hasLongStep = steps.some((s) => s.trim().length > 85);
  if (stepCount > 3 || hasLongStep) {
    return 'grid w-full max-w-3xl grid-cols-1 gap-3 py-5 sm:grid-cols-2';
  }
  return 'grid w-full max-w-5xl grid-cols-1 gap-3 py-5 sm:grid-cols-2 lg:grid-cols-4';
}
