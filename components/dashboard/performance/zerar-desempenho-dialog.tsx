'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Props = {
  open: boolean;
  zerando: boolean;
  erro: string | null;
  onClose: () => void;
  onConfirm: () => void;
};

export function ZerarDesempenhoDialog({ open, zerando, erro, onClose, onConfirm }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/70 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="zerar-desempenho-title"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 6 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-lg"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-destructive/10">
                <RotateCcw size={20} className="text-destructive" aria-hidden />
              </div>
              <div>
                <h2 id="zerar-desempenho-title" className="text-lg font-semibold tracking-tight text-foreground">
                  Zerar todo o desempenho?
                </h2>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  Todas as questões registradas no seu histórico serão apagadas: metas, sequência de dias, gráficos e
                  totais voltam ao zero. Esta ação não pode ser desfeita.
                </p>
              </div>
            </div>
            {erro && (
              <p className="mt-3 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                {erro}
              </p>
            )}
            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" disabled={zerando} onClick={onClose}>
                Cancelar
              </Button>
              <Button type="button" variant="destructive" disabled={zerando} onClick={() => void onConfirm()}>
                {zerando ? 'Zerando…' : 'Sim, zerar'}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
