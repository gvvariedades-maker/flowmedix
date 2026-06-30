'use client';

import dynamic from 'next/dynamic';
import { useEffect } from 'react';
import { useEditorialTheme } from '@/lib/layout/useEditorialTheme';
import type { QuestaoCompleta } from '@/types/lesson';

const AvantLessonPlayer = dynamic(() => import('@/components/lesson/AvantLessonPlayer'), {
  ssr: false,
});

type QuestaoReviewPanelsProps = {
  questao: QuestaoCompleta;
  slug: string;
  source: string;
};

export function QuestaoReviewPanels({ questao, slug, source }: QuestaoReviewPanelsProps) {
  useEditorialTheme();

  useEffect(() => {
    document.documentElement.setAttribute('data-questao-review', slug);
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
      document.documentElement.removeAttribute('data-questao-review');
    };
  }, [slug]);

  return (
    <div className="min-h-screen bg-[#f1f5f9]" data-testid="questao-review-root">
      <header className="border-b border-slate-200 bg-white px-4 py-3">
        <p className="text-xs text-slate-500">questao-review · source={source}</p>
        <h1 className="truncate text-sm font-medium text-slate-800">{slug}</h1>
      </header>
      <div data-testid="questao-review-player">
        <AvantLessonPlayer dados={questao} mode="preview" previewImmersive />
      </div>
    </div>
  );
}
