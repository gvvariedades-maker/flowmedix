import { Shield } from 'lucide-react';
import { LANDING_AUTORIDADE } from '@/lib/marketing/landingCopy';

export function LandingAutoridade() {
  return (
    <section className="bg-white px-4 py-14 sm:px-6">
      <div className="card-elevated mx-auto max-w-2xl rounded-2xl border-slate-200 bg-[#f1f5f9] p-10 text-center shadow-sm">
        <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center">
          <Shield size={48} className="text-[#3d6b0f]" aria-hidden />
        </div>
        <p className="text-xl font-semibold leading-relaxed text-slate-800">{LANDING_AUTORIDADE.text}</p>
        <p className="mt-4 text-sm text-slate-500">{LANDING_AUTORIDADE.sub}</p>
      </div>
    </section>
  );
}
