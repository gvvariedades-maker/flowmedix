import { cn } from '@/lib/utils';

export type QuestaoPlayerShellSurface = 'player-live' | 'player-card' | 'skeleton';

/** Mobile edge-to-edge: imersivo inline ou sheet @modal — sem radius no shell. */
export function questaoPlayerMobileFullBleed(options: {
  immersive?: boolean;
  modalActive?: boolean;
}): boolean {
  return Boolean(options.immersive || options.modalActive);
}

const MOBILE_FULL_BLEED_SHELL =
  'max-md:rounded-none max-md:border-0 max-md:shadow-none';

/**
 * Classes do shell raiz do player / skeleton.
 * Desktop mantém card editorial (`md:rounded-[2.5rem]` onde aplicável).
 */
export function questaoPlayerShellRootClass(
  surface: QuestaoPlayerShellSurface,
  options: {
    immersive?: boolean;
    modalActive?: boolean;
    previewImmersive?: boolean;
  } = {},
): string {
  const mobileFullBleed = questaoPlayerMobileFullBleed(options);
  const base = 'flex min-h-0 w-full flex-1 flex-col overflow-hidden font-sans';

  if (surface === 'skeleton') {
    return cn(
      base,
      'card-elevated-lg shadow-none max-md:min-h-[min(72vh,640px)]',
      mobileFullBleed && MOBILE_FULL_BLEED_SHELL,
      'md:rounded-[2.5rem]',
    );
  }

  const isLiveSurface =
    surface === 'player-live' || Boolean(options.previewImmersive);

  return cn(
    'relative h-full bg-white',
    base,
    isLiveSurface
      ? cn('border-0 shadow-none', mobileFullBleed && MOBILE_FULL_BLEED_SHELL)
      : cn(
          'card-elevated-lg border border-slate-200 shadow-lg md:rounded-[2.5rem]',
          mobileFullBleed && MOBILE_FULL_BLEED_SHELL,
        ),
    options.immersive && surface === 'player-live' && 'max-md:min-h-[100dvh]',
  );
}
