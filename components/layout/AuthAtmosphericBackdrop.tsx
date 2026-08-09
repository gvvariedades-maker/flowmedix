import { cn } from '@/lib/utils';

type AuthAtmosphericBackdropProps = {
  /** `editorial` = fundo claro sutil (spike login); `dark` = blobs cyber (register legado). */
  variant?: 'dark' | 'editorial';
};

/** Blobs + grelha (login/register); conteúdo deve usar `relative z-10` sobre o fundo. */
export function AuthAtmosphericBackdrop({ variant = 'dark' }: AuthAtmosphericBackdropProps) {
  if (variant === 'editorial') {
    return (
      <div className="pointer-events-none fixed inset-0" aria-hidden>
        <div className="absolute top-[-18%] right-[-8%] h-[420px] w-[420px] rounded-full bg-[#F26522]/8 blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-6%] h-[360px] w-[360px] rounded-full bg-slate-200/80 blur-[90px]" />
      </div>
    );
  }

  return (
    <div className={cn('pointer-events-none fixed inset-0')} aria-hidden>
      <div className="absolute top-[-22%] left-1/2 h-[520px] w-[min(140%,980px)] -translate-x-1/2 rounded-full bg-cyan-500/20 blur-[130px]" />
      <div className="absolute bottom-[-12%] right-[-10%] h-[500px] w-[500px] rounded-full bg-[#F26522]/10 blur-[130px]" />
      <div className="absolute top-1/2 left-[-15%] h-[420px] w-[420px] rounded-full bg-indigo-600/20 blur-[130px]" />
      <div
        className="absolute inset-0 opacity-[0.055]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,.15) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.15) 1px, transparent 1px)`,
          backgroundSize: '64px 64px',
        }}
      />
    </div>
  );
}
