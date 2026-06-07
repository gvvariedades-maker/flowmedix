'use client';

import { cn } from '@/lib/utils';
import { buildWhatsAppUrl } from '@/lib/whatsapp';
import { MOBILE_BOTTOM_NAV_FIXED_BOTTOM } from '@/lib/layout/mobileBottomNav';
import { WhatsAppIcon } from '@/components/support/WhatsAppIcon';

type WhatsAppFabProps = {
  /** Dashboard mobile: acima do BottomNav. Páginas públicas: canto inferior. */
  variant?: 'dashboard' | 'public';
  className?: string;
};

export function WhatsAppFab({ variant = 'dashboard', className }: WhatsAppFabProps) {
  const href = buildWhatsAppUrl();

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Tirar dúvidas no WhatsApp"
      title="Tirar dúvidas no WhatsApp"
      className={cn(
        'fixed right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full',
        'bg-[#25D366] text-white shadow-lg shadow-emerald-900/40',
        'transition-transform hover:scale-105 hover:bg-[#20bd5a] active:scale-95',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2 focus-visible:ring-offset-[#010409]',
        variant === 'dashboard'
          ? cn(MOBILE_BOTTOM_NAV_FIXED_BOTTOM, 'max-md:right-4 md:bottom-6')
          : 'bottom-6',
        className,
      )}
    >
      <WhatsAppIcon size={28} />
    </a>
  );
}
