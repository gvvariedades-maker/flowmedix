'use client';

import { startTransition, useCallback, useEffect, useMemo, useState } from 'react';
import { chaveDiaPlano, storageKeyPlanoMarcados } from './plano-marcados-storage';

export function usePlanoDiarioMarcados(userId: string) {
  const day = useMemo(() => chaveDiaPlano(), []);

  const [ids, setIds] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const k = storageKeyPlanoMarcados(userId, day);
    try {
      const raw = localStorage.getItem(k);
      if (raw) {
        const parsed = JSON.parse(raw) as unknown;
        if (Array.isArray(parsed)) {
          const next = parsed.filter((x): x is string => typeof x === 'string');
          startTransition(() => {
            setIds(next);
          });
        }
      }
    } catch {
      /* ignora parse inválido */
    }
    startTransition(() => setHydrated(true));
  }, [userId, day]);

  const persist = useCallback(
    (next: string[]) => {
      setIds(next);
      try {
        localStorage.setItem(storageKeyPlanoMarcados(userId, day), JSON.stringify(next));
      } catch {
        /* quota / privado */
      }
    },
    [userId, day],
  );

  const isMarcado = useCallback((id: string) => ids.includes(id), [ids]);

  const toggle = useCallback(
    (id: string) => {
      setIds((prev) => {
        const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
        try {
          localStorage.setItem(storageKeyPlanoMarcados(userId, day), JSON.stringify(next));
        } catch {
          /* */
        }
        return next;
      });
    },
    [userId, day],
  );

  const limparHoje = useCallback(() => {
    persist([]);
  }, [persist]);

  return {
    isMarcado,
    toggle,
    limparHoje,
    hydrated,
    marcadosCount: ids.length,
    diaKey: day,
  };
}
