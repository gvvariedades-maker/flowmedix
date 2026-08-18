'use client';

import dynamic from 'next/dynamic';
import type { LucideIcon } from 'lucide-react';
import { ArrowRight, Brain, ClipboardCheck, FileQuestion, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { BrandCta, SectionLabel } from '@/components/landing/lp-ui';
import { LANDING_DEMO_JOURNEY_LABEL } from '@/lib/marketing/landingDemoPreview';
import { LANDING_METODO } from '@/lib/marketing/landingCopy';
import { landingFadeUp } from '@/lib/marketing/landingMotion';
import { LandingGabaritoPreview } from '@/components/marketing/LandingGabaritoPreview';
import { LandingProgressoPreview } from '@/components/marketing/LandingProgressoPreview';
import { cn } from '@/lib/utils';

const LandingQuestionPreview = dynamic(
  () =>
    import('@/components/marketing/LandingQuestionPreview').then((m) => ({
      default: m.LandingQuestionPreview,
    })),
  { ssr: false, loading: () => <PreviewSkeleton /> },
);

const LandingNeuroSlideCarousel = dynamic(
  () =>
    import('@/components/marketing/LandingNeuroSlideCarousel').then((m) => ({
      default: m.LandingNeuroSlideCarousel,
    })),
  { ssr: false, loading: () => <PreviewSkeleton /> },
);

function PreviewSkeleton() {
  return (
    <div className="flex h-full min-h-[220px] items-center justify-center bg-slate-50 text-xs text-slate-400">
      Carregando…
    </div>
  );
}

type MetodoStep = {
  n: string;
  title: string;
  text: string;
  icon: LucideIcon;
  preview: 'question' | 'gabarito' | 'neuroslide' | 'progresso';
};

const STEPS: MetodoStep[] = [
  {
    n: '01',
    title: 'Questão real de concurso',
    text: 'Formato exato da banca para Técnico — não teoria de enfermeiro. Filtre por banca, ano e órgão.',
    icon: FileQuestion,
    preview: 'question',
  },
  {
    n: '02',
    title: 'Gabarito + diagnóstico',
    text: "Saiba se errou por conceito, interpretação ou pegadinha. Não é só 'alternativa B correta'.",
    icon: ClipboardCheck,
    preview: 'gabarito',
  },
  {
    n: '03',
    title: 'NeuroSlides',
    text: 'Mapa mental, regra de ouro, fluxo lógico, zona de perigo. 4 telas que fixam o conceito antes de você fechar o app.',
    icon: Brain,
    preview: 'neuroslide',
  },
  {
    n: '04',
    title: 'Diagnóstico que vira progresso',
    text: 'Cada erro fica marcado e ligado ao NeuroSlide certo. Você sabe exatamente o que revisar em seguida.',
    icon: TrendingUp,
    preview: 'progresso',
  },
];

function previewFrameClass(preview: MetodoStep['preview']) {
  switch (preview) {
    case 'question':
      return 'h-[min(340px,52vw)] sm:h-[320px]';
    case 'neuroslide':
      return 'h-[min(380px,58vw)] sm:h-[360px]';
    case 'gabarito':
    case 'progresso':
      return 'h-[min(320px,48vw)] sm:h-[300px]';
    default:
      return 'h-[280px]';
  }
}

function StepPreview({ step }: { step: MetodoStep }) {
  const frameClass = cn('overflow-hidden bg-slate-50', previewFrameClass(step.preview));

  switch (step.preview) {
    case 'question':
      return (
        <div className={cn(frameClass, 'origin-top scale-[0.98]')}>
          <LandingQuestionPreview className="min-h-0 h-full" />
        </div>
      );
    case 'gabarito':
      return (
        <div className={frameClass}>
          <LandingGabaritoPreview className="h-full" />
        </div>
      );
    case 'neuroslide':
      return (
        <div className={frameClass}>
          <LandingNeuroSlideCarousel className="h-full" />
        </div>
      );
    case 'progresso':
      return (
        <div className={frameClass}>
          <LandingProgressoPreview className="h-full overflow-y-auto" />
        </div>
      );
    default:
      return null;
  }
}

/** Seção "Simples como 1, 2, 3, 4" — mesma questão demo em cada preview. */
export function LandingMetodoSteps() {
  return (
    <section id="metodo" className="bg-white px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="text-center sm:text-left">
          <SectionLabel>{LANDING_METODO.label}</SectionLabel>
          <h2 className="text-2xl font-[1000] tracking-tight text-slate-900 sm:text-4xl">
            {LANDING_METODO.h2}
          </h2>
          <p className="mt-3 max-w-2xl text-base text-slate-600">{LANDING_METODO.sub}</p>
          <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#F26522]/40 bg-[#F26522]/10 px-4 py-2 text-xs font-bold text-[#9A3412]">
            <ArrowRight size={14} aria-hidden />
            Do enunciado ao diagnóstico — {LANDING_DEMO_JOURNEY_LABEL}
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {STEPS.map((step, i) => (
            <motion.article
              key={step.n}
              className="card-elevated-lg flex flex-col overflow-hidden rounded-3xl border-slate-200/80"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-40px' }}
              variants={landingFadeUp}
              custom={i}
            >
              <StepPreview step={step} />
              <div className="border-t border-slate-100 p-5 sm:p-6">
                <div className="flex items-start gap-3">
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-[#F26522] bg-[#F26522]/10 text-xs font-black text-[#9A3412]">
                    {step.n}
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-base font-black text-slate-900 sm:text-lg">{step.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{step.text}</p>
                    <step.icon className="mt-2.5 text-[#9A3412]" size={16} aria-hidden />
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        <div className="mt-10 flex justify-center sm:justify-start">
          <BrandCta href="/register" size="lg">
            {LANDING_METODO.ctaFooter}
          </BrandCta>
        </div>
      </div>
    </section>
  );
}
