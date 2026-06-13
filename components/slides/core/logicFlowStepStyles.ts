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
    'relative min-w-0 rounded-2xl border transition-all duration-300',
  ];
  if (visual.isFuture) {
    parts.push('min-h-11 border-slate-200 bg-slate-100/70 p-3 md:p-4 opacity-70 shadow-sm');
  } else if (visual.isPast) {
    parts.push('min-h-9 border-emerald-100 bg-emerald-50/75 p-2.5 md:p-3 shadow-sm');
  } else if (visual.isCurrent) {
    parts.push(
      `min-h-11 border-2 ${theme.borderColor} bg-gradient-to-br ${theme.bgGradient} p-3 md:p-4 shadow-lg ring-2 ring-emerald-200/30`,
    );
  } else {
    parts.push(`min-h-11 ${theme.borderColor} bg-white p-3 md:p-5 shadow-md`);
  }
  if (canTap) parts.push('cursor-pointer hover:shadow-lg');
  return parts.join(' ');
}

export function logicFlowStepIconClass(visual: LogicFlowStepVisual): string {
  if (visual.isCurrent) {
    return 'btn-editorial-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-xl p-0 font-bold text-[#1a2e05] md:h-12 md:w-12';
  }
  if (visual.isPast) {
    return 'flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm md:h-8 md:w-8';
  }
  return 'flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-blue-600 bg-white text-blue-700 md:h-12 md:w-12';
}

export function logicFlowCardsGridClass(stepCount: number, steps: string[]): string {
  const hasLongStep = steps.some((s) => s.trim().length > 85);
  if (stepCount > 3 || hasLongStep) {
    return 'grid w-full max-w-3xl grid-cols-1 gap-3 py-5 sm:grid-cols-2';
  }
  return 'grid w-full max-w-5xl grid-cols-1 gap-3 py-5 sm:grid-cols-2 lg:grid-cols-4';
}
