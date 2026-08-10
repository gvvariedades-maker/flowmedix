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
 * `md` = sidebar fixa (15.5rem/248px, `PlanStatusCard`) — sem essa redução o
 * wordmark "AVANT enf" em `lg` (~287px com ícone+gap) não cabe no espaço
 * disponível (~232px) e é cortado.
 */
const BRAND_MARK_WORDMARK_SCALE: Record<NonNullable<AvantBrandMarkProps['size']>, number> = {
  sm: 1,
  md: 0.75,
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
      wordmarkScale={BRAND_MARK_WORDMARK_SCALE[size]}
      tone={variant === 'editorial' ? 'brand' : 'default'}
      animated={false}
      className={cn(className)}
    />
  );
}
