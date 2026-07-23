'use client';

import { BadgeCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { useReverseStudyCompletionGate } from '@/components/lesson/ReverseStudyCompletionGate';

type MarcarEstudoConcluidoButtonProps = {
  onClick: () => void;
  disabled: boolean;
  loading: boolean;
  error: string | null;
};

/**
 * CTA final do estudo reverso — desabilitado até o gate (fluxo + pegadinhas + transferência).
 */
export function MarcarEstudoConcluidoButton({
  onClick,
  disabled,
  loading,
  error,
}: MarcarEstudoConcluidoButtonProps) {
  const { canComplete, gateActive, pendingLabels } = useReverseStudyCompletionGate();
  const blockedByGate = gateActive && !canComplete;
  const isDisabled = disabled || loading || blockedByGate;

  return (
    <motion.div
      layout
      className="flex flex-col items-end gap-2 order-2 sm:order-none max-w-[min(100%,280px)] sm:max-w-none"
    >
      {blockedByGate ? (
        <p className="max-w-[280px] text-right text-[10px] leading-snug text-amber-800 sm:text-xs">
          {pendingLabels[0] ?? 'Complete o estudo reverso antes de marcar'}
        </p>
      ) : null}
      <button
        type="button"
        onClick={onClick}
        disabled={isDisabled}
        title={blockedByGate ? pendingLabels.join(' · ') : undefined}
        className="btn-editorial-primary group flex min-h-[44px] w-full max-w-[min(100%,280px)] items-center gap-2 rounded-full px-3 py-2.5 text-[9px] font-black uppercase tracking-wide transition-all disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:max-w-none sm:px-6 sm:py-3 sm:text-xs sm:tracking-widest"
      >
        <BadgeCheck size={16} className="shrink-0" />
        <span className="text-left leading-tight">
          {loading ? (
            'Salvando...'
          ) : (
            <>
              <span className="sm:hidden">Marcar estudado</span>
              <span className="hidden sm:inline">Marcar como Estudado</span>
            </>
          )}
        </span>
      </button>
      {error ? (
        <p role="alert" className="max-w-[280px] text-right text-[10px] leading-snug text-rose-600 sm:text-xs">
          {error}
        </p>
      ) : null}
    </motion.div>
  );
}
