'use client';

import { useEffect, useState } from 'react';
import { BrandCta } from '@/components/landing/lp-ui';
import { LANDING_HERO, LANDING_PRECO_PRO } from '@/lib/marketing/landingCopy';
import { cn } from '@/lib/utils';

export function LandingStickyCta() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      const ratio = max > 0 ? window.scrollY / max : 0;
      setVisible(ratio >= 0.35);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
      className={cn(
        'fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-[#f1f5f9]/95 p-3 backdrop-blur-xl transition-transform duration-300 sm:hidden',
        visible ? 'translate-y-0' : 'translate-y-full',
      )}
      role="region"
      aria-label="Ação rápida"
    >
      <div className="mx-auto flex max-w-lg items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-bold text-slate-900">{LANDING_HERO.ctaPrimary}</p>
          <p className="text-[10px] text-slate-500">Pro R$ {LANDING_PRECO_PRO}/mês depois</p>
        </div>
        <BrandCta href="/register" className="shrink-0 px-4 py-2.5 text-xs" data-analytics="lp-sticky-cta">
          Grátis
        </BrandCta>
      </div>
    </div>
  );
}
