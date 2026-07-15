import { AvantLogo, type AvantLogoSizeToken } from '@/components/brand/AvantLogo';
import { cn } from '@/lib/utils';

type AvantBrandMarkProps = {
  /** `sm` = header mobile (~40px); `md` = sidebar (~48px). */
  size?: 'sm' | 'md';
  className?: string;
  variant?: 'cyber' | 'editorial';
};

const BRAND_MARK_SIZE: Record<NonNullable<AvantBrandMarkProps['size']>, AvantLogoSizeToken> = {
  sm: 'md',
  md: 'lg',
};

/**
 * Lockup compacto do dashboard — delega a `AvantLogo` (AE + AVANT / enf).
 * Editorial: wordmark `#166534` + enf; cyber: lockup com glow mínimo.
 */
export function AvantBrandMark({
  size = 'md',
  className,
  variant = 'editorial',
}: AvantBrandMarkProps) {
  return (
    <AvantLogo
      variant="lockup"
      size={BRAND_MARK_SIZE[size]}
      tone={variant === 'editorial' ? 'brand' : 'default'}
      animated={false}
      className={cn(className)}
    />
  );
}
