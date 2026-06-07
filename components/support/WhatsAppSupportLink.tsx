import { cn } from '@/lib/utils';
import { buildWhatsAppUrl, formatWhatsAppDisplay } from '@/lib/whatsapp';
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
  const href = buildWhatsAppUrl();

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
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
    </a>
  );
}
