'use client';

import NeuroSlide from '@/components/slides/NeuroSlide';

const VERSUS_SAMPLE = {
  type: 'versus_arena' as const,
  slide_title: 'Assepsia vs. Antissepsia',
  concept_a: {
    title: 'Assepsia',
    icon: 'Shield',
    points: ['Previne a entrada de microrganismos', 'Ex.: campo cirúrgico estéril'],
  },
  concept_b: {
    title: 'Antissepsia',
    icon: 'FlaskConical',
    points: ['Destrói microrganismos na pele', 'Ex.: álcool 70% antes da punção'],
  },
};

const SCANNER_SAMPLE = {
  type: 'syllable_scanner' as const,
  slide_title: 'Acentuação em prova',
  word: 'an-tis-sep-sia',
  tonicIndex: 3,
  rule: 'Oxítona terminada em ia — acento na última sílaba.',
};

export default function NeuroslideShowcaseCaptureClient() {
  return (
    <div className="min-h-screen bg-[#010409] p-6">
      <p className="mb-6 text-center text-xs text-slate-500">
        Captura de showcase — rodar: npm run capture:landing-neuroslides
      </p>
      <div className="mx-auto flex max-w-[420px] flex-col gap-10">
        <section data-capture="versus" className="overflow-hidden rounded-2xl border border-white/10">
          <div className="h-[min(78vh,680px)] w-full">
            <NeuroSlide data={VERSUS_SAMPLE} standalone />
          </div>
        </section>
        <section data-capture="scanner" className="overflow-hidden rounded-2xl border border-white/10">
          <div className="h-[min(78vh,680px)] w-full">
            <NeuroSlide data={SCANNER_SAMPLE} standalone />
          </div>
        </section>
      </div>
    </div>
  );
}
