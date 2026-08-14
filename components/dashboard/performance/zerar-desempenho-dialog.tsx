'use client';

import { useCallback, useEffect, useId, useRef } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Props = {
  open: boolean;
  zerando: boolean;
  erro: string | null;
  onClose: () => void;
  onConfirm: () => void;
};

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Confirmação de ação destrutiva.
 *
 * O projeto não tem `@radix-ui/react-dialog` nas dependências, então a
 * acessibilidade é implementada aqui: `aria-modal`, foco inicial no botão
 * seguro (Cancelar), foco preso no diálogo, ESC e clique no overlay fecham,
 * e o foco volta para o elemento que abriu.
 */
export function ZerarDesempenhoDialog({ open, zerando, erro, onClose, onConfirm }: Props) {
  const painelRef = useRef<HTMLDivElement>(null);
  const cancelarRef = useRef<HTMLButtonElement>(null);
  const gatilhoAnteriorRef = useRef<HTMLElement | null>(null);
  const reduzirMovimento = useReducedMotion();
  const tituloId = useId();
  const descricaoId = useId();

  const fechar = useCallback(() => {
    if (zerando) return;
    onClose();
  }, [onClose, zerando]);

  useEffect(() => {
    if (!open) return;

    gatilhoAnteriorRef.current = document.activeElement as HTMLElement | null;
    cancelarRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        fechar();
        return;
      }

      if (event.key !== 'Tab') return;
      const alvos = painelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE);
      if (!alvos || alvos.length === 0) return;
      const primeiro = alvos[0]!;
      const ultimo = alvos[alvos.length - 1]!;
      const ativo = document.activeElement;

      if (event.shiftKey && (ativo === primeiro || !painelRef.current?.contains(ativo))) {
        event.preventDefault();
        ultimo.focus();
      } else if (!event.shiftKey && ativo === ultimo) {
        event.preventDefault();
        primeiro.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      gatilhoAnteriorRef.current?.focus?.();
    };
  }, [open, fechar]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={reduzirMovimento ? false : { opacity: 0 }}
          animate={reduzirMovimento ? undefined : { opacity: 1 }}
          exit={reduzirMovimento ? undefined : { opacity: 0 }}
          transition={{ duration: reduzirMovimento ? 0 : 0.15 }}
          onClick={(event) => {
            if (event.target === event.currentTarget) fechar();
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 p-4 backdrop-blur-sm"
        >
          <motion.div
            ref={painelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={tituloId}
            aria-describedby={descricaoId}
            initial={reduzirMovimento ? false : { opacity: 0, scale: 0.98, y: 6 }}
            animate={reduzirMovimento ? undefined : { opacity: 1, scale: 1, y: 0 }}
            exit={reduzirMovimento ? undefined : { opacity: 0, scale: 0.98, y: 6 }}
            transition={{ duration: reduzirMovimento ? 0 : 0.18, ease: 'easeOut' }}
            className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-lg"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-destructive/10">
                <RotateCcw size={20} className="text-destructive" aria-hidden />
              </div>
              <div>
                <h2
                  id={tituloId}
                  className="text-lg font-semibold tracking-tight text-foreground"
                >
                  Zerar desempenho de estudo?
                </h2>
                <div id={descricaoId}>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    Apaga o histórico de questões da área <strong>Estudo</strong>: meta do dia,
                    sequência, heatmap e mapa por assunto voltam ao zero. Esta ação não pode ser
                    desfeita.
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    Seus <strong>simulados</strong> e os resultados deles permanecem.
                  </p>
                </div>
              </div>
            </div>
            {erro && (
              <p
                role="alert"
                className="mt-3 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
              >
                {erro}
              </p>
            )}
            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                ref={cancelarRef}
                type="button"
                variant="outline"
                className="min-h-11"
                disabled={zerando}
                onClick={fechar}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variant="destructive"
                className="min-h-11"
                disabled={zerando}
                onClick={() => void onConfirm()}
              >
                {zerando ? 'Zerando…' : 'Zerar desempenho de estudo'}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
