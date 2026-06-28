import Link from 'next/link';
import { AvantLogo } from '@/components/brand/AvantLogo';
import { WhatsAppSupportLink } from '@/components/support/WhatsAppSupportLink';
import { LANDING_FOOTER } from '@/lib/marketing/landingCopy';

export function LandingFooter() {
  return (
    <footer className="bg-[#0f172a] px-4 py-10 sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 text-center sm:flex-row sm:text-left">
        <div className="flex flex-col items-center gap-3 sm:items-start">
          <AvantLogo size="md" tone="default" animated={false} />
          <span className="text-sm text-slate-400">{LANDING_FOOTER.tagline}</span>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 sm:justify-start">
            <Link href="/blog" className="text-sm font-semibold text-slate-300 hover:text-white">
              Blog
            </Link>
            <Link href="/planos" className="text-sm font-semibold text-slate-300 hover:text-white">
              Concursos
            </Link>
            <WhatsAppSupportLink className="text-sm text-slate-400 hover:text-[#25D366]" />
          </div>
        </div>
        <p className="text-xs text-slate-600">{LANDING_FOOTER.copyright}</p>
      </div>
    </footer>
  );
}
