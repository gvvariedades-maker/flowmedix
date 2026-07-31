'use client';

import { useEffect } from 'react';
import NeuroSlide from '@/components/slides/core/NeuroSlide';
import {
  buildGallerySlide,
  galleryQuestionMeta,
  type GalleryFixtureKind,
} from '@/lib/slides/variantGalleryFixtures';
import type { SlideTypeKey } from '@/lib/neurocanvas/declaredVariants';

type Props = {
  slideType: SlideTypeKey;
  variant: string;
  fixture: GalleryFixtureKind;
  /** Quando true, renderiza default + stress na mesma página (índice / captura batch). */
  bothFixtures?: boolean;
};

function FixturePanel({
  slideType,
  variant,
  fixture,
  index,
}: {
  slideType: SlideTypeKey;
  variant: string;
  fixture: GalleryFixtureKind;
  index: number;
}) {
  const slide = buildGallerySlide(slideType, variant, fixture);
  const questionMeta = galleryQuestionMeta();
  return (
    <section
      data-testid={`variant-gallery-panel-${fixture}`}
      data-variant={variant}
      data-slide-type={slideType}
      data-fixture={fixture}
      className="overflow-y-auto rounded-2xl border border-slate-200 bg-[#010409] shadow-sm"
      style={{ minHeight: 420, maxHeight: 780 }}
    >
      <div className="border-b border-white/10 px-4 py-2 text-xs text-slate-400">
        {slideType} · {variant} · {fixture}
      </div>
      <NeuroSlide data={slide} questionMeta={questionMeta} slideIndex={index} standalone />
    </section>
  );
}

export function VariantGalleryClient({
  slideType,
  variant,
  fixture,
  bothFixtures = false,
}: Props) {
  useEffect(() => {
    document.documentElement.setAttribute('data-variant-gallery', `${slideType}__${variant}`);
    try {
      window.localStorage.setItem('avant-estudo-reverso-welcome-seen', 'true');
    } catch {
      // ignore
    }
    return () => {
      document.documentElement.removeAttribute('data-variant-gallery');
    };
  }, [slideType, variant]);

  return (
    <div className="min-h-screen bg-slate-100 p-6" data-testid="variant-gallery-root">
      <header className="mb-6">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          NeuroSlides · variant gallery
        </p>
        <h1 className="text-xl font-semibold text-slate-900">
          {slideType} / {variant}
        </h1>
        <p className="text-sm text-slate-600">
          fixture={bothFixtures ? 'default+stress' : fixture}
        </p>
      </header>

      <div className={`grid gap-6 ${bothFixtures ? 'lg:grid-cols-2' : ''}`}>
        {bothFixtures ? (
          <>
            <FixturePanel slideType={slideType} variant={variant} fixture="default" index={0} />
            <FixturePanel slideType={slideType} variant={variant} fixture="stress" index={1} />
          </>
        ) : (
          <FixturePanel slideType={slideType} variant={variant} fixture={fixture} index={0} />
        )}
      </div>
    </div>
  );
}
