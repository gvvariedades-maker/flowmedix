'use client';

import dynamic from 'next/dynamic';
import { useEffect } from 'react';
import DashboardShell from '@/app/(dashboard)/DashboardShell';
import NeuroSlide from '@/components/slides/core/NeuroSlide';
import { useEditorialTheme } from '@/lib/layout/useEditorialTheme';
import {
  HERO_CAPTURE_LAPTOP_RENDER,
  HERO_CAPTURE_PHONE_RENDER,
  HERO_CAPTURE_SIDEBAR_OFFSET_PX,
  heroCaptureScreenCss,
} from '@/lib/marketing/heroCaptureDimensions';
import type { QuestaoCompleta } from '@/types/lesson';

const AvantLessonPlayer = dynamic(() => import('@/components/lesson/AvantLessonPlayer'), {
  ssr: false,
});

type HeroMockupCapturePanelsProps = {
  questao: QuestaoCompleta;
};

export function HeroMockupCapturePanels({ questao }: HeroMockupCapturePanelsProps) {
  useEditorialTheme();
  const conceptSlide = questao.reverse_study_slides?.[0];
  const laptopScreen = heroCaptureScreenCss('laptop');
  const tabletScreen = heroCaptureScreenCss('tablet');
  const phoneScreen = heroCaptureScreenCss('phone');

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
      {/* Desktop — recorte na proporção da tela do laptop no hero */}
      <section
        id="hero-laptop"
        data-testid="hero-laptop"
        className="relative overflow-hidden bg-[#f1f5f9]"
        style={{ width: laptopScreen.width, height: laptopScreen.height }}
        aria-hidden
      >
        <div
          data-testid="hero-laptop-screen"
          className="relative overflow-hidden bg-[#f1f5f9]"
          style={{ width: laptopScreen.width, height: laptopScreen.height }}
        >
          <div
            style={{
              width: HERO_CAPTURE_LAPTOP_RENDER.width,
              height: HERO_CAPTURE_LAPTOP_RENDER.height,
              marginLeft: -HERO_CAPTURE_SIDEBAR_OFFSET_PX,
            }}
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
          </div>
        </div>
      </section>

      {/* Tablet — NeuroSlide na proporção da moldura portrait */}
      <section
        id="hero-tablet"
        data-testid="hero-tablet"
        className="relative overflow-hidden bg-[#010409]"
        style={{ width: tabletScreen.width, height: tabletScreen.height }}
        aria-hidden
      >
        <div
          data-testid="hero-tablet-screen"
          className="relative h-full w-full overflow-hidden bg-[#010409]"
        >
          {conceptSlide ? (
            <NeuroSlide
              data={conceptSlide}
              questionSlug="hero-mockup-capture"
              slideIndex={0}
              standalone
              questionFamilyId="vf"
            />
          ) : null}
        </div>
      </section>

      {/* Mobile — recorte na proporção da tela do phone no hero */}
      <section
        id="hero-phone"
        data-testid="hero-phone"
        className="relative overflow-hidden bg-[#f1f5f9]"
        style={{ width: phoneScreen.width, height: phoneScreen.height }}
        aria-hidden
      >
        <div
          data-testid="hero-phone-screen"
          className="relative overflow-hidden bg-[#f1f5f9]"
          style={{ width: phoneScreen.width, height: phoneScreen.height }}
        >
          <div
            style={{
              width: HERO_CAPTURE_PHONE_RENDER.width,
              height: HERO_CAPTURE_PHONE_RENDER.height,
            }}
          >
            <AvantLessonPlayer dados={questao} mode="preview" />
          </div>
        </div>
      </section>
    </div>
  );
}
