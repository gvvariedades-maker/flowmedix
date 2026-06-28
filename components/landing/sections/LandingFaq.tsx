import { EditorialFaqItem } from '@/components/landing/lp-ui';
import { LANDING_FAQ, landingFaqItems } from '@/lib/marketing/landingCopy';

export function LandingFaq() {
  const items = landingFaqItems();

  return (
    <section id="faq" className="bg-[#f1f5f9] px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-2xl">
        <h2 className="text-center text-2xl font-[1000] tracking-tight text-slate-900 sm:text-3xl">
          {LANDING_FAQ.title}
        </h2>
        <div className="card-elevated mt-10 rounded-xl border-slate-200 px-6">
          {items.map((item) => (
            <EditorialFaqItem key={item.q} q={item.q} a={item.a} />
          ))}
        </div>
      </div>
    </section>
  );
}
