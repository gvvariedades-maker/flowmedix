'use client';

import { ArrowRight } from 'lucide-react';
import { formatAvantCodigo } from '@/lib/avantCodigo';
import type { VitrineResumeHint } from '@/lib/vitrine/resume';
import { VitrineQuestaoLink } from '@/components/vitrine/VitrineQuestaoLink';

export type VitrineResumeCardProps = {
  resume: VitrineResumeHint;
  estudarQuery?: string;
};

export function VitrineResumeCard({ resume, estudarQuery = '' }: VitrineResumeCardProps) {
  const codigoLabel = formatAvantCodigo(resume.avantCodigo);

  return (
    <div
      data-testid="vitrine-resume-card"
      className="flex flex-col gap-3 rounded-r-2xl border border-green-100 border-l-[#8fe020] bg-green-50 px-4 py-3 [border-left-width:4px] sm:flex-row sm:items-center sm:justify-between sm:gap-4"
    >
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#3d6b0f]">
          Continuar de onde parou
        </p>
        <p className="mt-0.5 truncate text-sm font-bold leading-snug text-slate-900">
          {resume.tituloAula}
        </p>
        {codigoLabel ? (
          <p className="mt-0.5 font-mono text-[11px] text-slate-500">{codigoLabel}</p>
        ) : null}
      </div>

      <VitrineQuestaoLink
        slug={resume.questaoSlug}
        estudarQuery={estudarQuery}
        className="btn-editorial-primary inline-flex min-h-[44px] shrink-0 items-center justify-center gap-2 self-start rounded-xl px-4 py-2.5 text-sm font-black uppercase tracking-wide sm:self-auto"
      >
        Retomar estudo
        <ArrowRight size={16} aria-hidden />
      </VitrineQuestaoLink>
    </div>
  );
}

export default VitrineResumeCard;
