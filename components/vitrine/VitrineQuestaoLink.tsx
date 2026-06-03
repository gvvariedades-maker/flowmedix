'use client';

import Link from 'next/link';
import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type FocusEvent,
  type MouseEvent,
  type PointerEvent,
} from 'react';
import { useQuestaoNavigationOptional } from '@/components/lesson/questao-navigation-context';
import { buildEstudarHref } from '@/lib/estudar/navigation';
import { shouldSkipEstudarPrefetch } from '@/lib/estudar/prefetchPolicy';

export type VitrineQuestaoLinkProps = Omit<ComponentPropsWithoutRef<'a'>, 'href'> & {
  slug: string;
  /** Query da vitrine (`?banca=…&page=…`) repassada à questão. */
  estudarQuery?: string;
};

export function buildVitrineSlugComQuery(slug: string, estudarQuery = ''): string {
  return `${slug}${estudarQuery}`;
}

function isModifiedClick(event: MouseEvent<HTMLAnchorElement>): boolean {
  return (
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey ||
    event.button !== 0
  );
}

export const VitrineQuestaoLink = forwardRef<HTMLAnchorElement, VitrineQuestaoLinkProps>(
  function VitrineQuestaoLink(
    {
      slug,
      estudarQuery = '',
      className,
      children,
      onClick,
      onPointerEnter,
      onFocus,
      ...rest
    },
    ref,
  ) {
    const nav = useQuestaoNavigationOptional();
    const slugComQuery = buildVitrineSlugComQuery(slug, estudarQuery);
    const href = buildEstudarHref(slugComQuery);

    const maybePrefetch = () => {
      if (shouldSkipEstudarPrefetch() || !nav) return;
      nav.prefetchEstudar(slugComQuery);
    };

    const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
      onClick?.(event);
      if (event.defaultPrevented || isModifiedClick(event)) return;
      // Navegação nativa do Next.js Link (intercept @modal + Hydrator no servidor).
      // Evita depender só de navigateEstudar, que falhava ao voltar da vitrine.
    };

    const handlePointerEnter = (event: PointerEvent<HTMLAnchorElement>) => {
      onPointerEnter?.(event);
      maybePrefetch();
    };

    const handleFocus = (event: FocusEvent<HTMLAnchorElement>) => {
      onFocus?.(event);
      maybePrefetch();
    };

    return (
      <Link
        ref={ref}
        href={href}
        className={className}
        onClick={handleClick}
        onPointerEnter={handlePointerEnter}
        onFocus={handleFocus}
        {...rest}
      >
        {children}
      </Link>
    );
  },
);
