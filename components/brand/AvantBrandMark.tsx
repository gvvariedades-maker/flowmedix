import { AvantLogo, type AvantLogoSizeToken } from '@/components/brand/AvantLogo';
import { cn } from '@/lib/utils';

type AvantBrandMarkProps = {
  /** `sm` = header mobile (~40px); `md` = sidebar (~48px). */
  size?: 'sm' | 'md';
  className?: string;
  variant?: 'cyber' | 'editorial';
};

const BRAND_MARK_SIZE: Record<NonNullable<AvantBrandMarkProps['size']>, AvantLogoSizeToken> = {
  sm: 'nav',
  md: 'md',
};

/**
 * Lockup compacto do dashboard — delega a `AvantLogo` (escala e tokens únicos).
 * Editorial: wordmark verde `#166534`; cyber: lockup neon (landing).
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
