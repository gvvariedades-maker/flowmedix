import { cn } from '@/lib/utils';

type AvantBrandMarkProps = {
  size?: 'sm' | 'md';
  className?: string;
};

export function AvantBrandMark({ size = 'md', className }: AvantBrandMarkProps) {
  const isSm = size === 'sm';

  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <div
        className={cn(
          'flex shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#3d35ff] to-[#7b2fff] shadow-[0_0_12px_rgba(61,53,255,0.3)]',
          isSm ? 'h-8 w-8 text-sm' : 'h-8 w-8 text-sm',
        )}
        aria-hidden
      >
        ⚡
      </div>
      <span
        className={cn(
          'font-extrabold tracking-[0.12em] text-[#00ff88] drop-shadow-[0_0_12px_rgba(0,255,136,0.35)]',
          isSm ? 'text-sm' : 'text-sm',
        )}
        style={{ fontFamily: 'var(--font-syne)' }}
      >
        AVANT
      </span>
    </div>
  );
}
