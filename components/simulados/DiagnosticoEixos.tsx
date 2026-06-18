'use client';

import { useMemo } from 'react';
import { AlertTriangle, TrendingDown, TrendingUp } from 'lucide-react';
import {
  agruparErrosPorEixo,
  buildDiagnosticoRodape,
  resolveDiagnosticoBancaLabel,
} from '@/lib/simulado/diagnosticoEixos';
import type { SimuladoConclusaoIncentivos, SimuladoQuestaoItem } from '@/lib/simulado/types';
import { cn } from '@/lib/utils';

type DiagnosticoEixosProps = {
  questoes: SimuladoQuestaoItem[];
  filtros: Record<string, unknown>;
  incentivos?: SimuladoConclusaoIncentivos | null;
};

function EixoBarra({ erros, total }: { erros: number; total: number }) {
  const acertos = total - erros;
  const acertosPct = total > 0 ? (acertos / total) * 100 : 0;
  const errosPct = total > 0 ? (erros / total) * 100 : 0;

  return (
    <div
      className="flex h-2 w-full overflow-hidden rounded-full bg-slate-200"
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

function EixoEvolucaoBarra({
  anterior,
  atual,
}: {
  anterior: number;
  atual: number;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2 text-[11px] text-slate-500">
        <span>Antes: {anterior}%</span>
        <span className="font-medium text-emerald-600">Agora: {atual}%</span>
      </div>
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className="absolute inset-y-0 left-0 bg-slate-400/50"
          style={{ width: `${Math.min(100, anterior)}%` }}
          aria-hidden
        />
        <div
          className="absolute inset-y-0 left-0 bg-emerald-500"
          style={{ width: `${Math.min(100, atual)}%` }}
          aria-hidden
        />
      </div>
    </div>
  );
}

export function DiagnosticoEixos({ questoes, filtros, incentivos }: DiagnosticoEixosProps) {
  const eixos = useMemo(() => agruparErrosPorEixo(questoes), [questoes]);
  const rodape = useMemo(
    () => buildDiagnosticoRodape(resolveDiagnosticoBancaLabel(filtros, questoes)),
    [filtros, questoes],
  );

  const evolucao = incentivos?.eixos_evolucao ?? [];
  const dominios = incentivos?.dominios ?? [];
  const hasEvolucao = evolucao.length > 0;
  const hasDominios = dominios.length > 0;
  const hasFracos = eixos.length > 0;

  if (!hasEvolucao && !hasDominios && !hasFracos) return null;

  return (
    <div className="space-y-6">
      {hasEvolucao ? (
        <section
          aria-labelledby="simulado-evolucao-eixos-titulo"
          className="card-elevated-lg space-y-4 p-6"
        >
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
            <h2
              id="simulado-evolucao-eixos-titulo"
              className="text-sm font-semibold uppercase tracking-wider text-slate-500"
            >
              Evolução por eixo
            </h2>
          </div>

          <ul className="space-y-4">
            {evolucao.map((item) => (
              <li key={item.eixo} className="space-y-2 rounded-xl border border-emerald-200/70 bg-emerald-50/50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="min-w-0 truncate text-sm font-medium text-slate-800">
                    {item.eixo}
                  </span>
                  <span
                    className={cn(
                      'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums',
                      'bg-emerald-100 text-emerald-700',
                    )}
                  >
                    <TrendingUp className="h-3 w-3" aria-hidden />+{item.delta_pontos} p.p.
                  </span>
                </div>
                <EixoEvolucaoBarra
                  anterior={item.percentual_anterior}
                  atual={item.percentual_atual}
                />
                <p className="text-xs text-slate-600">{item.mensagem}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {hasDominios ? (
        <section
          aria-labelledby="simulado-dominios-titulo"
          className="card-elevated-lg space-y-3 p-6"
        >
          <div className="flex items-center gap-2">
            <TrendingDown className="h-4 w-4 shrink-0 rotate-180 text-emerald-600" aria-hidden />
            <h2
              id="simulado-dominios-titulo"
              className="text-sm font-semibold uppercase tracking-wider text-slate-500"
            >
              Pegadinhas dominadas
            </h2>
          </div>
          <ul className="space-y-2">
            {dominios.map((item) => (
              <li
                key={item.eixo}
                className="rounded-xl border border-emerald-200/80 bg-white px-4 py-3 text-sm text-slate-800"
              >
                {item.mensagem}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {hasFracos ? (
        <section aria-labelledby="simulado-diagnostico-titulo" className="card-elevated-lg space-y-4 p-6">
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
                  <span className="min-w-0 truncate font-medium text-slate-800">{item.eixo}</span>
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
      ) : null}
    </div>
  );
}
