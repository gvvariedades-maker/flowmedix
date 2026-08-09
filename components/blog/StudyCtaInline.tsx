import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function StudyCtaInline() {
  return (
    <div className="my-8 rounded-[2rem] border border-cyan-400/20 bg-cyan-950/20 p-6">
      <p className="mb-4 text-base font-medium leading-relaxed text-slate-200">
        Praticando esse conteúdo no AVANT enf? Resolva questões reais sobre esse tema agora.
      </p>
      <Link
        href="/register"
        className="inline-flex items-center gap-2 rounded-2xl bg-[#F26522] px-6 py-3 text-sm font-black tracking-wide text-slate-950 uppercase shadow-lg shadow-[rgba(242,101,34,0.2)] transition-all hover:bg-[#E05518] hover:scale-[1.02]"
      >
        Estudar no AVANT enf
        <ArrowRight size={16} />
      </Link>
    </div>
  );
}
