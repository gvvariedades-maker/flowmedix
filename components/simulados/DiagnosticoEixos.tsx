'use client';

import { useMemo } from 'react';
import { AlertTriangle } from 'lucide-react';
import {
  agruparErrosPorEixo,
  buildDiagnosticoRodape,
  resolveDiagnosticoBancaLabel,
} from '@/lib/simulado/diagnosticoEixos';
import type { SimuladoQuestaoItem } from '@/lib/simulado/types';

type DiagnosticoEixosProps = {
  questoes: SimuladoQuestaoItem[];
  filtros: Record<string, unknown>;
};

function EixoBarra({ erros, total }: { erros: number; total: number }) {
  const acertos = total - erros;
  const acertosPct = total > 0 ? (acertos / total) * 100 : 0;
  const errosPct = total > 0 ? (erros / total) * 100 : 0;

  return (
    <div
      className="flex h-2 w-full overflow-hidden rounded-full bg-white/5"
      role="img"
      aria-label={`${acertos} acertos e ${erros} erros de ${total} questões`}
    >
      {acertosPct > 0 ? (
        <div
          className="h-full bg-emerald-400 transition-[width] duration-200"
          style={{ width: `${acertosPct}%` }}
        />
      ) : null}
      {errosPct > 0 ? (
        <div
          className="h-full bg-rose-400 transition-[width] duration-200"
          style={{ width: `${errosPct}%` }}
        />
      ) : null}
    </div>
  );
}

export function DiagnosticoEixos({ questoes, filtros }: DiagnosticoEixosProps) {
  const eixos = useMemo(() => agruparErrosPorEixo(questoes), [questoes]);
  const rodape = useMemo(
    () => buildDiagnosticoRodape(resolveDiagnosticoBancaLabel(filtros, questoes)),
    [filtros, questoes],
  );

  if (eixos.length === 0) return null;

  return (
    <section aria-labelledby="simulado-diagnostico-titulo" className="space-y-4">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400/80" aria-hidden />
        <h2
          id="simulado-diagnostico-titulo"
          className="text-sm font-semibold uppercase tracking-wider text-slate-500"
        >
          Seus pontos fracos
        </h2>
      </div>

      <ul className="space-y-4">
        {eixos.map((item) => (
          <li key={item.eixo} className="space-y-2">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="min-w-0 truncate font-medium text-slate-200">{item.eixo}</span>
              <span className="shrink-0 tabular-nums text-xs text-slate-400">
                {item.erros} {item.erros === 1 ? 'erro' : 'erros'} · {item.total}{' '}
                {item.total === 1 ? 'questão' : 'questões'}
              </span>
            </div>
            <EixoBarra erros={item.erros} total={item.total} />
          </li>
        ))}
      </ul>

      <p className="text-xs text-slate-500">{rodape}</p>
    </section>
  );
}
