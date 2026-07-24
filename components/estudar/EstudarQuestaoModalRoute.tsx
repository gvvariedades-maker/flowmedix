'use client';

import { useCallback, useEffect, useRef, type ReactNode } from 'react';
import dynamic from 'next/dynamic';
import EstudarQuestaoSkeleton from '@/components/lesson/EstudarQuestaoSkeleton';

const AvantLessonPlayer = dynamic(() => import('@/components/lesson/AvantLessonPlayer'), {
  ssr: false,
  loading: () => <EstudarQuestaoSkeleton mobileFullBleed />,
});
import { useQuestaoNavigation } from '@/components/lesson/questao-navigation-context';
import { useEstudarPayloadStale } from '@/components/lesson/useEstudarPayloadStale';
import { isEstudarModalRouteEnabled } from '@/lib/estudar/estudarL0Config';
import { setEstudarModalOverlayOpen } from '@/lib/estudar/estudarModalOpenBridge';
import { useBodyScrollLock } from '@/lib/layout/useBodyScrollLock';
import { cn } from '@/lib/utils';

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

function getFocusableIn(container: HTMLElement | null): HTMLElement[] {
  if (!container) return [];
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter((el) => {
    if (el.getAttribute('tabindex') === '-1') return false;
    if (el.hasAttribute('disabled')) return false;
    const style = window.getComputedStyle(el);
    if (style.visibility === 'hidden' || style.display === 'none') return false;
    return typeof el.tabIndex === 'number' && el.tabIndex >= 0;
  });
}

type EstudarQuestaoModalRouteProps = {
  children: ReactNode;
};

/**
 * Intercepting route @modal (fase 11.2): questão sobre a vitrine no mobile.
 * Desktop: sem overlay — player permanece no shell ao lado da sidebar.
 * `children` inclui EstudarQuestaoHydrator (render null).
 */
export function EstudarQuestaoModalRoute({ children }: EstudarQuestaoModalRouteProps) {
  const { displayPayload, dismissToVitrine, isDismissingToVitrine } = useQuestaoNavigation();
  const payloadStale = useEstudarPayloadStale();
  const panelRef = useRef<HTMLDivElement>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);
  const modalEnabled = isEstudarModalRouteEnabled();
  const showModalLoading = !displayPayload;
  const showModalOverlay = !isDismissingToVitrine;

  useBodyScrollLock(modalEnabled && showModalOverlay);

  useEffect(() => {
    if (!modalEnabled) return;
    setEstudarModalOverlayOpen(showModalOverlay);
    return () => setEstudarModalOverlayOpen(false);
  }, [modalEnabled, showModalOverlay]);

  const close = useCallback(() => {
    dismissToVitrine({
      fromPlano: displayPayload?.fromPlano,
      fromCaderno: displayPayload?.fromCaderno,
      vitrineQuerySuffix: displayPayload?.vitrineQuerySuffix,
    });
  }, [displayPayload, dismissToVitrine]);

  useEffect(() => {
    if (!modalEnabled || !showModalOverlay) return;
    previousActiveElementRef.current = document.activeElement as HTMLElement | null;
    const id = requestAnimationFrame(() => {
      getFocusableIn(panelRef.current)[0]?.focus();
    });
    return () => {
      cancelAnimationFrame(id);
      previousActiveElementRef.current?.focus();
    };
  }, [modalEnabled, showModalOverlay]);

  useEffect(() => {
    if (!modalEnabled || !showModalOverlay) return;
    const panel = panelRef.current;
    if (!panel) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        close();
        return;
      }
      if (e.key !== 'Tab') return;
      const focusable = getFocusableIn(panel);
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (!active || !panel.contains(active)) {
        e.preventDefault();
        first.focus();
        return;
      }
      if (e.shiftKey) {
        if (active === first) {
          e.preventDefault();
          last.focus();
        }
      } else if (active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown, true);
    return () => document.removeEventListener('keydown', onKeyDown, true);
  }, [modalEnabled, showModalOverlay, close]);

  if (!modalEnabled) {
    return <>{children}</>;
  }

  return (
    <>
      {children}
      {showModalOverlay ? (
        <div
          className="fixed inset-0 z-[100] flex flex-col md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label={showModalLoading ? 'Carregando questão' : 'Questão'}
          aria-busy={showModalLoading || payloadStale || undefined}
        >
          <button
            type="button"
            tabIndex={-1}
            className="absolute inset-0 bg-slate-900/45 backdrop-blur-[2px]"
            aria-label="Fechar questão"
            onClick={close}
          />
          <div
            ref={panelRef}
            className={cn(
              'relative z-10 mt-auto flex min-h-0 max-h-full flex-1 flex-col overflow-hidden pt-safe',
              'rounded-t-[2rem] border border-slate-200 bg-white shadow-2xl',
              '[view-transition-name:estudar-questao-root]',
            )}
          >
            <div
              className={cn(
                'flex min-h-0 flex-1 flex-col overflow-hidden',
                payloadStale && 'pointer-events-none opacity-90',
              )}
              aria-busy={payloadStale || undefined}
            >
              {showModalLoading ? (
                <EstudarQuestaoSkeleton mobileFullBleed />
              ) : (
                <AvantLessonPlayer
                  key={displayPayload!.moduloSlug ?? 'estudar-lesson-player-modal'}
                  {...displayPayload!}
                  payloadStale={payloadStale}
                />
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
