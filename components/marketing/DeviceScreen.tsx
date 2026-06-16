'use client';

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';

type DeviceScreenProps = {
  /** Largura lógica do conteúdo (px) — "resolução" da tela virtual. */
  logicalWidth: number;
  /** Altura lógica do conteúdo (px). */
  logicalHeight: number;
  children: ReactNode;
};

/**
 * Renderiza o filho em resolução lógica fixa e escala para o container real.
 * O container externo recebe `height = logicalHeight * scale` automaticamente.
 */
export function DeviceScreen({ logicalWidth, logicalHeight, children }: DeviceScreenProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  const recompute = useCallback(() => {
    const el = wrapRef.current;
    if (!el) return;
    const { width } = el.getBoundingClientRect();
    if (width > 0) setScale(width / logicalWidth);
  }, [logicalWidth]);

  useLayoutEffect(() => {
    recompute();
  }, [recompute]);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(recompute);
    ro.observe(el);
    return () => ro.disconnect();
  }, [recompute]);

  return (
    <div ref={wrapRef} className="w-full" style={{ height: logicalHeight * scale, overflow: 'hidden' }}>
      <div
        style={{
          width: logicalWidth,
          height: logicalHeight,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          overflow: 'hidden',
        }}
      >
        {children}
      </div>
    </div>
  );
}
