'use client';

import { createPortal } from 'react-dom';
import { useEffect, useState, type ReactNode } from 'react';

type EstudoReversoHostProps = {
  /** LP/preview: permanece embutido no card; live: portal fullscreen no body. */
  preview: boolean;
  children: ReactNode;
};

/** Escapa transforms do shell (Framer page, modal da questão) para fullscreen real. */
export function EstudoReversoHost({ preview, children }: EstudoReversoHostProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (preview) return children;
  if (!mounted) return null;
  return createPortal(children, document.body);
}
