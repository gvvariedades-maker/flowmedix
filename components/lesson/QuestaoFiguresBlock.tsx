'use client';

import { useCallback, useState } from 'react';
import { X, ZoomIn } from 'lucide-react';
import type { QuestaoFigure } from '@/lib/questaoFigures';
import { isAllowedQuestaoFigureUrl } from '@/lib/questaoFigures';
import { useBodyScrollLock } from '@/lib/layout/useBodyScrollLock';
import { cn } from '@/lib/utils';

type QuestaoFiguresBlockProps = {
  figures: QuestaoFigure[];
  className?: string;
};

export function QuestaoFiguresBlock({ figures, className }: QuestaoFiguresBlockProps) {
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [lightboxAlt, setLightboxAlt] = useState('');

  useBodyScrollLock(Boolean(lightboxUrl));

  const openLightbox = useCallback((url: string, alt: string) => {
    setLightboxUrl(url);
    setLightboxAlt(alt);
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxUrl(null);
    setLightboxAlt('');
  }, []);

  const safeFigures = figures.filter(
    (f) => f?.url && f?.alt && isAllowedQuestaoFigureUrl(f.url),
  );

  if (safeFigures.length === 0) return null;

  return (
    <>
      <div className={cn('space-y-4', className)}>
        {safeFigures.map((figure) => (
          <figure key={figure.id} className="mx-auto w-full max-w-2xl">
            <button
              type="button"
              onClick={() => openLightbox(figure.url, figure.alt)}
              className="group relative block w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F26522] focus-visible:ring-offset-2"
              aria-label={`Ampliar figura: ${figure.alt}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={figure.url}
                alt={figure.alt}
                loading="lazy"
                className="mx-auto max-h-[50vh] w-full object-contain"
              />
              <span className="pointer-events-none absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-md bg-black/55 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                <ZoomIn className="h-3.5 w-3.5" aria-hidden />
                Ampliar
              </span>
            </button>
            {figure.caption ? (
              <figcaption className="mt-2 text-center text-xs text-slate-500">{figure.caption}</figcaption>
            ) : null}
          </figure>
        ))}
      </div>

      {lightboxUrl ? (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/85 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={lightboxAlt}
          onClick={closeLightbox}
        >
          <button
            type="button"
            onClick={closeLightbox}
            className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
            aria-label="Fechar imagem ampliada"
          >
            <X className="h-5 w-5" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightboxUrl}
            alt={lightboxAlt}
            className="max-h-[90vh] max-w-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      ) : null}
    </>
  );
}
