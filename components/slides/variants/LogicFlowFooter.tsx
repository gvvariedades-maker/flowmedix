'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Hand } from 'lucide-react';

interface LogicFlowFooterProps {
  isTapMode: boolean;
  isComplete: boolean;
  currentPasso: number;
  total: number;
  revealedCount: number;
  onAdvance: () => void;
  /** Exibe instrução de toque até o primeiro avanço no slide. */
  showTapHint?: boolean;
}

export function LogicFlowFooter({
  isTapMode,
  isComplete,
  currentPasso,
  total,
  revealedCount,
  onAdvance,
  showTapHint = false,
}: LogicFlowFooterProps) {
  if (isTapMode) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mt-6 flex flex-col items-center gap-3"
      >
        {showTapHint && !isComplete ? (
          <motion.p
            role="status"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-body flex max-w-md items-center justify-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-center text-sm font-semibold leading-snug text-green-900"
          >
            <Hand className="h-4 w-4 shrink-0 text-green-700" aria-hidden />
            <span>
              Toque no passo em destaque acima para revelar o próximo
            </span>
          </motion.p>
        ) : null}
        <motion.div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm">
          <span className="font-mono tabular-nums text-sm text-slate-600 md:text-xs">
            Passo {Math.min(currentPasso, total)} de {total}
          </span>
        </motion.div>
        {!isComplete && (
          <button
            type="button"
            onClick={onAdvance}
            className="inline-flex min-h-11 min-w-[11rem] items-center justify-center gap-2 rounded-xl border border-green-200 bg-green-50 px-5 py-3 text-sm font-semibold text-green-800 transition-colors hover:bg-green-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500"
          >
            Próximo passo
            <ChevronRight className="h-4 w-4" aria-hidden />
          </button>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: total * 0.1 + 0.5 }}
      className="mt-8 text-center"
    >
      <motion.div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm">
        <span className="font-mono tabular-nums text-sm text-slate-500 md:text-xs">
          {revealedCount} de {total} passos concluídos
        </span>
      </motion.div>
    </motion.div>
  );
}
