'use client';

import dynamic from 'next/dynamic';
import { useEffect, useMemo } from 'react';
import NeuroSlide from '@/components/slides/core/NeuroSlide';
import { useEditorialTheme } from '@/lib/layout/useEditorialTheme';
import type { QuestaoCompleta } from '@/types/lesson';

const AvantLessonPlayer = dynamic(() => import('@/components/lesson/AvantLessonPlayer'), {
  ssr: false,
});

type SlideMoldReviewProps = {
  questao: QuestaoCompleta;
  branch: string;
};

export function SlideMoldReviewPanels({ questao, branch }: SlideMoldReviewProps) {
  useEditorialTheme();
  const slides = useMemo(
    () => questao.reverse_study_slides ?? [],
    [questao.reverse_study_slides],
  );
  const questionMeta = useMemo(
    () => ({
      ...questao.meta,
      pedagogical_branch: branch,
    }),
    [questao.meta, branch],
  );

  useEffect(() => {
    document.documentElement.setAttribute('data-slide-mold-review', branch);
    const microtipKeys = [
      'reverse-study.option-elimination',
      'reverse-study.answer-before-feedback',
      'reverse-study.feedback-learning',
      'reverse-study.reverse-study-intro',
      'reverse-study.dots-meaning',
      'reverse-study.concept-map',
      'reverse-study.golden-rule',
      'reverse-study.logic-flow',
      'reverse-study.danger-zone',
      'reverse-study.study-completed',
    ];
    try {
      for (const key of microtipKeys) {
        window.localStorage.setItem(`avant.microtip.${key}`, 'true');
      }
      window.localStorage.setItem('avant-estudo-reverso-welcome-seen', 'true');
    } catch {
      // ignore
    }
    return () => {
      document.documentElement.removeAttribute('data-slide-mold-review');
    };
  }, [branch]);

  const slidePanels = useMemo(
    () =>
      slides.map((slide, idx) => ({
        key: `${slide.type}-${idx}`,
        slide,
        label: `slide-${idx + 1}-${slide.type}`,
      })),
    [slides],
  );

  return (
    <div className="min-h-screen bg-slate-100 p-6" data-testid="slide-mold-review-root">
      <header className="mb-6">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">L3 visual mold</p>
        <h1 className="text-xl font-semibold text-slate-900">branch={branch}</h1>
        <p className="text-sm text-slate-600">{questao.meta?.subtopico}</p>
      </header>

      <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="mb-2 text-xs font-medium text-slate-500">Player (enunciado)</p>
        <div data-testid="mold-player" className="max-h-[640px] overflow-hidden rounded-xl">
          <AvantLessonPlayer dados={questao} mode="preview" previewImmersive />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {slidePanels.map(({ key, slide, label }, idx) => (
          <section
            key={key}
            data-testid={`mold-slide-${idx + 1}`}
            data-slide-label={label}
            className="overflow-y-auto rounded-2xl border border-slate-200 bg-[#010409] shadow-sm"
            style={{ minHeight: 420, maxHeight: 720 }}
          >
            <div className="border-b border-white/10 px-4 py-2 text-xs text-slate-400">{label}</div>
            <NeuroSlide data={slide} questionMeta={questionMeta} slideIndex={idx} standalone />
          </section>
        ))}
      </div>
    </div>
  );
}
