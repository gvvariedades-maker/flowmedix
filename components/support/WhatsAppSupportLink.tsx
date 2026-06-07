'use client';

import { cn } from '@/lib/utils';
import { buildWhatsAppUrl, formatWhatsAppDisplay, openWhatsAppChat } from '@/lib/whatsapp';
import { WhatsAppIcon } from '@/components/support/WhatsAppIcon';

type WhatsAppSupportLinkProps = {
  className?: string;
  showNumber?: boolean;
  children?: React.ReactNode;
};

export function WhatsAppSupportLink({
  className,
  showNumber = false,
  children,
}: WhatsAppSupportLinkProps) {
  return (
    <button
      type="button"
      onClick={openWhatsAppChat}
      className={cn(
        'inline-flex items-center gap-2 font-bold text-[#25D366] transition-colors hover:text-[#20bd5a]',
        className,
      )}
    >
      <WhatsAppIcon size={18} />
      <span>
        {children ?? 'Falar no WhatsApp'}
        {showNumber ? ` (${formatWhatsAppDisplay()})` : null}
      </span>
      <span className="sr-only">{buildWhatsAppUrl()}</span>
    </button>
  );
}
