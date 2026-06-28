import { LANDING_AUTORIDADE } from '@/lib/marketing/landingCopy';

export function LandingAutoridade() {
  return (
    <section className="bg-white px-4 py-14 sm:px-6">
      <div className="card-elevated mx-auto max-w-2xl rounded-2xl border-slate-200 bg-[#f1f5f9] p-10 text-center shadow-sm">
        <div
          className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#8fe020]/40 bg-[#8fe020]/15 text-xl font-black text-[#3d6b0f]"
          aria-hidden
        >
          {LANDING_AUTORIDADE.initials}
        </div>
        <p className="text-sm font-bold uppercase tracking-wide text-[#3d6b0f]">
          {LANDING_AUTORIDADE.name}
        </p>
        <p className="mt-1 text-xs font-semibold text-slate-500">{LANDING_AUTORIDADE.role}</p>
        <p className="mt-6 text-xl font-semibold leading-relaxed text-slate-800">
          {LANDING_AUTORIDADE.text}
        </p>
        <p className="mt-4 text-sm text-slate-500">{LANDING_AUTORIDADE.sub}</p>
      </div>
    </section>
  );
}
