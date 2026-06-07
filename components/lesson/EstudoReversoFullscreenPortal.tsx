'use client';

import { useClientMounted } from '@/lib/hooks/useClientMounted';
import { createPortal } from 'react-dom';
import { type ReactNode } from 'react';

type EstudoReversoHostProps = {
  /** LP/preview: permanece embutido no card; live: portal fullscreen no body. */
  preview: boolean;
  children: ReactNode;
};

/**
 * Escapa transforms do shell (Framer page, modal da questão) para fullscreen real.
 * Antes do mount do portal, mantém children na árvore (evita flash vazio no 1º paint).
 */
export function EstudoReversoHost({ preview, children }: EstudoReversoHostProps) {
  const mounted = useClientMounted();

  if (preview) return children;
  if (!mounted) return children;
  return createPortal(children, document.body);
}
