'use client';

import { createElement, useCallback, useEffect, useRef, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useClientMounted } from '@/lib/hooks/useClientMounted';
import { useBodyScrollLock } from '@/lib/layout/useBodyScrollLock';
import { useMobileSheetKeyboardInset } from '@/lib/layout/useMobileSheetKeyboardInset';
import type { VitrineGrupoSubtopico } from '@/lib/vitrine/types';
import { vitrineBrand } from '@/lib/vitrine/vitrineBrand';
import { getTopicIcon } from '@/lib/vitrine/vitrineTopicIcon';
import { getTopicAccent } from '@/lib/vitrine/vitrineTopicAccent';
import { cn } from '@/lib/utils';
import { VitrineAssuntoDesempenho } from '@/components/vitrine/VitrineAssuntoDesempenho';
import { VitrineQuestaoList } from '@/components/vitrine/VitrineQuestaoList';
import { VitrineQuestaoLink } from '@/components/vitrine/VitrineQuestaoLink';

export type VitrineSubjectSheetProps = {
  open: boolean;
  onClose: () => void;
  grupo: VitrineGrupoSubtopico;
  estudarQuery: string;
};

function useDialogFocusTrap(
  containerRef: RefObject<HTMLElement | null>,
  active: boolean,
) {
  useEffect(() => {
    if (!active || !containerRef.current) return;

    const container = containerRef.current;
    const getFocusables = () =>
      Array.from(
        container.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((el) => !el.hasAttribute('disabled') && el.tabIndex !== -1);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;
      const focusables = getFocusables();
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    container.addEventListener('keydown', onKeyDown);
    return () => container.removeEventListener('keydown', onKeyDown);
  }, [active, containerRef]);
}

export function VitrineSubjectSheet({
  open,
  onClose,
  grupo,
  estudarQuery,
}: VitrineSubjectSheetProps) {
  const portalReady = useClientMounted();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const {
    titulo_aula,
    modulo_nome,
    totalQuestoes,
    totalResolvidas,
    trabalhadas,
    acertos,
    erros,
    percentual,
    questoes,
    firstSlug,
  } = grupo;

  const todas = trabalhadas === totalQuestoes && totalQuestoes > 0;
  const hasQuestions = totalQuestoes > 0;
  const topicIcon = getTopicIcon(titulo_aula, modulo_nome);
  const topicAccent = getTopicAccent(titulo_aula, modulo_nome);

  const closeSheet = useCallback(() => {
    onClose();
  }, [onClose]);

  useBodyScrollLock(open);
  useDialogFocusTrap(panelRef, open);
  const keyboardInsetPx = useMobileSheetKeyboardInset(open);

  useEffect(() => {
    if (!open) return;

    const frame = requestAnimationFrame(() => {
      closeButtonRef.current?.focus();
    });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      closeSheet();
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, closeSheet]);

  if (!portalReady || typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          key="vitrine-subject-sheet-root"
          className="fixed inset-0 z-[200] md:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <button
            type="button"
            tabIndex={-1}
            aria-label="Fechar detalhes do assunto"
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
            onClick={closeSheet}
          />
          <motion.div
            ref={panelRef}
            data-testid="vitrine-subject-sheet"
            role="dialog"
            aria-modal="true"
            aria-label={titulo_aula}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 34 }}
            className="absolute inset-x-0 bottom-0 z-[201] flex max-h-[min(90dvh,36rem)] flex-col rounded-t-3xl border border-slate-200 bg-white pb-safe shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start gap-3 border-b border-slate-200 px-4 py-3">
              <span
                className={cn(
                  'mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl border',
                  topicAccent.chip,
                )}
                aria-hidden
              >
                {createElement(topicIcon, {
                  size: 20,
                  strokeWidth: 2,
                  className: topicAccent.icon,
                })}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-base font-semibold leading-snug text-slate-900">{titulo_aula}</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  {totalResolvidas.toLocaleString('pt-BR')} de{' '}
                  {totalQuestoes.toLocaleString('pt-BR')} respondidas
                  {todas ? ' · Concluído' : totalResolvidas > 0 ? ' · Em progresso' : ''}
                </p>
              </div>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={closeSheet}
                aria-label="Fechar"
                className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700"
              >
                <X size={18} aria-hidden />
              </button>
            </div>

            <div
              className="custom-scrollbar min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-y-contain px-4 py-4"
              style={
                keyboardInsetPx > 0
                  ? { paddingBottom: keyboardInsetPx + 16 }
                  : undefined
              }
            >
              {hasQuestions ? (
                <>
                  <VitrineAssuntoDesempenho
                    acertos={acertos}
                    erros={erros}
                    respondidas={totalResolvidas}
                    totalQuestoes={totalQuestoes}
                    percentual={percentual}
                  />

                  <VitrineQuestaoList
                    tituloAula={titulo_aula}
                    firstSlug={firstSlug}
                    totalQuestoes={totalQuestoes}
                    questoes={questoes}
                    estudarQuery={estudarQuery}
                  />

                  <VitrineQuestaoLink
                    slug={firstSlug}
                    estudarQuery={estudarQuery}
                    className={cn(vitrineBrand.buttonSecondary, 'min-h-12 w-full')}
                  >
                    {totalResolvidas === 0 ? 'Começar este assunto' : 'Entrar no assunto'}
                  </VitrineQuestaoLink>
                </>
              ) : (
                <p className="py-6 text-center text-sm text-slate-500">
                  Nenhuma questão disponível neste assunto.
                </p>
              )}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}

export default VitrineSubjectSheet;
