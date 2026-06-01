'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  computeTempoMetaSegundos,
  formatElapsedHms,
} from '@/lib/simulado/provaMeta';

export type UseProvaElapsedInput = {
  provaIniciadaEm: string | null;
  totalQuestoes: number;
  ritmoMetaSegundosPorQuestao: number | null;
};

export type UseProvaElapsedResult = {
  elapsedMs: number;
  elapsedLabel: string;
  metaLabel: string;
  passedMeta: boolean;
  tempoMetaTotalSegundos: number | null;
};

function computeElapsedMs(provaIniciadaEm: string | null, nowMs: number): number {
  if (!provaIniciadaEm) return 0;
  const start = Date.parse(provaIniciadaEm);
  if (Number.isNaN(start)) return 0;
  return Math.max(0, nowMs - start);
}

export function useProvaElapsed({
  provaIniciadaEm,
  totalQuestoes,
  ritmoMetaSegundosPorQuestao,
}: UseProvaElapsedInput): UseProvaElapsedResult {
  const tempoMetaTotalSegundos = useMemo(
    () => computeTempoMetaSegundos(totalQuestoes, ritmoMetaSegundosPorQuestao),
    [totalQuestoes, ritmoMetaSegundosPorQuestao],
  );

  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    if (!provaIniciadaEm) return;

    setNowMs(Date.now());
    const id = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [provaIniciadaEm]);

  const elapsedMs = computeElapsedMs(provaIniciadaEm, nowMs);
  const elapsedLabel = formatElapsedHms(elapsedMs);

  const metaLabel =
    tempoMetaTotalSegundos == null
      ? 'Sem meta'
      : formatElapsedHms(tempoMetaTotalSegundos * 1000);

  const passedMeta =
    tempoMetaTotalSegundos != null && elapsedMs > tempoMetaTotalSegundos * 1000;

  return {
    elapsedMs,
    elapsedLabel,
    metaLabel,
    passedMeta,
    tempoMetaTotalSegundos,
  };
}
