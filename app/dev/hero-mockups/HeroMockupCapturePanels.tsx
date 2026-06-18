'use client';

import dynamic from 'next/dynamic';
import { useEffect } from 'react';
import DashboardShell from '@/app/(dashboard)/DashboardShell';
import NeuroSlide from '@/components/slides/core/NeuroSlide';
import { useEditorialTheme } from '@/lib/layout/useEditorialTheme';
import type { QuestaoCompleta } from '@/types/lesson';

const AvantLessonPlayer = dynamic(() => import('@/components/lesson/AvantLessonPlayer'), {
  ssr: false,
});

type HeroMockupCapturePanelsProps = {
  questao: QuestaoCompleta;
};

export function HeroMockupCapturePanels({ questao }: HeroMockupCapturePanelsProps) {
  useEditorialTheme(true);
  const conceptSlide = questao.reverse_study_slides?.[0];

  useEffect(() => {
    document.documentElement.setAttribute('data-hero-capture', '1');
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
      document.documentElement.removeAttribute('data-hero-capture');
    };
  }, []);

  return (
    <div className="bg-slate-100">
      {/* Desktop — player editorial com sidebar */}
      <section
        id="hero-laptop"
        data-testid="hero-laptop"
        className="relative h-[900px] w-[1440px] overflow-hidden bg-[#f1f5f9]"
        aria-hidden
      >
        <DashboardShell
          initialUserEmail={null}
          initialDisplayName="Aluno"
          initialIsAdmin={false}
          isPro={false}
          proSource={null}
          proExpiresAt={null}
          initialMatriculatedConcursos={[]}
        >
          <div className="h-full min-h-0">
            <AvantLessonPlayer dados={questao} mode="preview" previewImmersive />
          </div>
        </DashboardShell>
      </section>

      {/* Tablet portrait — NeuroSlide Mapa de Conceitos (LPP) */}
      <section
        id="hero-tablet"
        data-testid="hero-tablet"
        className="relative h-[1024px] w-[768px] overflow-hidden bg-[#010409]"
        aria-hidden
      >
        {conceptSlide ? (
          <NeuroSlide
            data={conceptSlide}
            questionSlug="hero-mockup-curativos"
            slideIndex={0}
            standalone
            questionFamilyId="vf"
          />
        ) : null}
      </section>

      {/* Mobile — questão */}
      <section
        id="hero-phone"
        data-testid="hero-phone"
        className="relative h-[844px] w-[390px] overflow-hidden bg-[#f1f5f9]"
        aria-hidden
      >
        <AvantLessonPlayer dados={questao} mode="preview" />
      </section>
    </div>
  );
}
