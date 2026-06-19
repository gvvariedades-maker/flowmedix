import type { SimuladoSessionKind } from '@/lib/simulado/sessionKind';
import { cn } from '@/lib/utils';

const CHIP_LABEL: Record<Exclude<SimuladoSessionKind, 'livre'>, string> = {
  weekly: 'Avaliação semanal',
  diagnostico: 'Diagnóstico inicial',
};

type AdaptiveSimuladoSessionChipProps = {
  sessionKind: SimuladoSessionKind;
  className?: string;
};

export function AdaptiveSimuladoSessionChip({
  sessionKind,
  className,
}: AdaptiveSimuladoSessionChipProps) {
  if (sessionKind === 'livre') return null;

  const label = CHIP_LABEL[sessionKind];
  const isWeekly = sessionKind === 'weekly';

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide',
        isWeekly
          ? 'border-cyan-500/30 bg-cyan-500/10 text-cyan-700'
          : 'border-violet-500/30 bg-violet-500/10 text-violet-700',
        className,
      )}
    >
      {label}
    </span>
  );
}

export function adaptiveSessionKindLabel(sessionKind: SimuladoSessionKind): string | null {
  if (sessionKind === 'livre') return null;
  return CHIP_LABEL[sessionKind];
}

export function adaptiveContinueCtaLabel(sessionKind: SimuladoSessionKind): string {
  return sessionKind === 'weekly' ? 'Continuar missão' : 'Continuar simulado';
}
