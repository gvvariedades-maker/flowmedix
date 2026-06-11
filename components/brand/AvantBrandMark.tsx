import { cn } from '@/lib/utils';

type AvantBrandMarkProps = {
  size?: 'sm' | 'md';
  className?: string;
  variant?: 'cyber' | 'editorial';
};

export function AvantBrandMark({
  size = 'md',
  className,
  variant = 'editorial',
}: AvantBrandMarkProps) {
  const isSm = size === 'sm';
  const editorial = variant === 'editorial';

  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <div
        className={cn(
          'flex shrink-0 items-center justify-center rounded-lg text-sm',
          isSm ? 'h-8 w-8' : 'h-8 w-8',
          editorial
            ? 'bg-[#8fe020]/15 text-[#3d6b0f]'
            : 'bg-gradient-to-br from-[#3d35ff] to-[#7b2fff] shadow-[0_0_12px_rgba(61,53,255,0.3)]',
        )}
        aria-hidden
      >
        ⚡
      </div>
      <span
        className={cn(
          'font-extrabold tracking-[0.12em]',
          isSm ? 'text-sm' : 'text-sm',
          editorial ? 'text-[#3d6b0f]' : 'text-[#00ff88] drop-shadow-[0_0_12px_rgba(0,255,136,0.35)]',
        )}
        style={{ fontFamily: 'var(--font-syne)' }}
      >
        AVANT
      </span>
    </div>
  );
}
