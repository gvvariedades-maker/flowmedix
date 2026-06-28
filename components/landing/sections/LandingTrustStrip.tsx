import { LANDING_TRUST_CHIPS } from '@/lib/marketing/landingCopy';

export function LandingTrustStrip() {
  return (
    <section className="border-y border-slate-100 bg-white px-4 py-6 sm:px-6">
      <ul className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-3 sm:gap-4">
        {LANDING_TRUST_CHIPS.map((chip) => (
          <li
            key={chip}
            className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700"
          >
            {chip}
          </li>
        ))}
      </ul>
    </section>
  );
}
