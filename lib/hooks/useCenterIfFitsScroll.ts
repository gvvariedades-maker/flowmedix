'use client';

import { useCallback, useLayoutEffect, useRef, useState } from 'react';

const PX_TOLERANCE = 2;

/**
 * Para áreas com rolagem vertical: centraliza no eixo principal só quando o conteúdo
 * cabe na viewport; se ultrapassar, alinha ao topo para o início do slide ficar visível.
 */
export function useCenterIfFitsScroll(resizeKey: string | number) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const slotRef = useRef<HTMLDivElement>(null);
  const [centerVertically, setCenterVertically] = useState(true);

  const measure = useCallback(() => {
    const scroll = scrollRef.current;
    const slot = slotRef.current;
    if (!scroll || !slot) return;
    const fits = slot.scrollHeight <= scroll.clientHeight + PX_TOLERANCE;
    setCenterVertically(fits);
  }, []);

  useLayoutEffect(() => {
    const scroll = scrollRef.current;
    if (scroll) scroll.scrollTop = 0;
    measure();
    const id = requestAnimationFrame(() => measure());
    return () => cancelAnimationFrame(id);
  }, [resizeKey, measure]);

  useLayoutEffect(() => {
    const scroll = scrollRef.current;
    const slot = slotRef.current;
    if (!scroll) return;

    const ro = new ResizeObserver(() => measure());
    ro.observe(scroll);
    if (slot) ro.observe(slot);

    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [measure]);

  return { scrollRef, slotRef, centerVertically };
}
