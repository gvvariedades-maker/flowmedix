'use client';

import dynamic from 'next/dynamic';
import type { LucideIcon } from 'lucide-react';
import { Brain, CalendarDays, ClipboardCheck, FileQuestion } from 'lucide-react';
import { motion } from 'framer-motion';
import { BrandCta, SectionLabel } from '@/components/landing/lp-ui';
import { LANDING_METODO } from '@/lib/marketing/landingCopy';
import { landingFadeUp } from '@/lib/marketing/landingMotion';
import { LandingGabaritoPreview } from '@/components/marketing/LandingGabaritoPreview';
import { LandingPlanoDiarioPreview } from '@/components/marketing/LandingPlanoDiarioPreview';
import { cn } from '@/lib/utils';

const LandingQuestionPreview = dynamic(
  () =>
    import('@/components/marketing/LandingQuestionPreview').then((m) => ({
      default: m.LandingQuestionPreview,
    })),
  { ssr: false, loading: () => <PreviewSkeleton /> },
);

const LandingNeuroSlideLive = dynamic(
  () =>
    import('@/components/marketing/LandingNeuroSlideLive').then((m) => ({
      default: m.LandingNeuroSlideLive,
    })),
  { ssr: false, loading: () => <PreviewSkeleton /> },
);

function PreviewSkeleton() {
  return (
    <div className="flex h-full min-h-[200px] items-center justify-center bg-slate-50 text-xs text-slate-400">
      Carregando…
    </div>
  );
}

type MetodoStep = {
  n: string;
  title: string;
  text: string;
  icon: LucideIcon;
  preview: 'question' | 'gabarito' | 'neuroslide' | 'plano';
  slideIndex?: number;
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
    slideIndex: 0,
  },
  {
    n: '04',
    title: 'Revisão no momento certo',
    text: 'Plano diário automático com revisão espaçada. Sem planilha. Sem decisão manual de quando revisar.',
    icon: CalendarDays,
    preview: 'plano',
  },
];

function StepPreview({ step }: { step: MetodoStep }) {
  const frameClass = 'h-[min(280px,42vw)] overflow-hidden bg-slate-50 sm:h-[260px]';

  switch (step.preview) {
    case 'question':
      return (
        <div className={cn(frameClass, 'origin-top scale-[0.92] sm:scale-[0.88]')}>
          <LandingQuestionPreview className="min-h-0" />
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
        <div className={cn(frameClass, 'bg-[#f8fafc]')}>
          <LandingNeuroSlideLive slideIndex={step.slideIndex ?? 0} />
        </div>
      );
    case 'plano':
      return (
        <div className={frameClass}>
          <LandingPlanoDiarioPreview className="h-full" />
        </div>
      );
    default:
      return null;
  }
}

/** Seção "Simples como 1, 2, 3, 4" com previews ao vivo do app. */
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
              <div className="p-6 pb-4">
                <div className="flex items-start gap-4">
                  <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-[#8fe020] bg-[#8fe020]/10 text-sm font-black text-[#3d6b0f]">
                    {step.n}
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-lg font-black text-slate-900">{step.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.text}</p>
                    <step.icon className="mt-3 text-[#3d6b0f]" size={18} aria-hidden />
                  </div>
                </div>
              </div>
              <div className="mt-auto border-t border-slate-100">
                <StepPreview step={step} />
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
