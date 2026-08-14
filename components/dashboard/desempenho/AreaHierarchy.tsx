'use client';

import { useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AreaPerformance, AssuntoPerformance } from '@/lib/desempenho/types';
import {
  desempenhoPctTone,
  formatDesempenhoConfianca,
  formatDesempenhoDate,
  formatDesempenhoPctComAmostra,
} from '@/components/dashboard/desempenho/formatDesempenho';
import { DesempenhoSelecaoBar } from '@/components/dashboard/desempenho/DesempenhoSelecaoBar';
import { DESEMPENHO_SELECAO_MAX_ASSUNTOS } from '@/lib/cadernos/desempenhoSelecao';

const PCT_TONE_CLASS = {
  neutral: 'text-slate-700',
  danger: 'text-[var(--color-danger-text)]',
  warning: 'text-[var(--color-warning-text)]',
  success: 'text-[var(--color-success-text)]',
} as const;

const BAR_TONE_CLASS = {
  neutral: 'bg-slate-300',
  danger: 'bg-[var(--color-danger)]',
  warning: 'bg-[var(--color-warning)]',
  success: 'bg-[var(--color-success)]',
} as const;

type Props = {
  areas: AreaPerformance[];
};

/**
 * Hierarquia progressiva área → assunto (substitui a tabela de largura fixa).
 *
 * Fechada, a área já é o panorama: nome, `% · fração`, respondidas, cobertura,
 * confiança e barra comparável. Um toque abre os assuntos — sem rolagem
 * horizontal em 320–412 px e sem `<table>` de largura mínima.
 */
export function AreaHierarchy({ areas }: Props) {
  const areasComPratica = useMemo(
    () =>
      areas
        .map((area) => ({
          ...area,
          assuntos: area.assuntos.filter((a) => a.respondidas > 0 || a.totalDisponivel > 0),
        }))
        .filter((area) => area.assuntos.length > 0),
    [areas],
  );

  const [abertas, setAbertas] = useState<readonly string[]>([]);
  const [selecionados, setSelecionados] = useState<readonly string[]>([]);
  const todasAbertas =
    areasComPratica.length > 0 && abertas.length === areasComPratica.length;

  // Teto explícito: melhor bloquear o 7º assunto do que truncar em silêncio na
  // hora de gravar a seleção para o wizard.
  const alternarSelecao = useCallback((tituloAula: string) => {
    setSelecionados((atual) => {
      if (atual.includes(tituloAula)) return atual.filter((titulo) => titulo !== tituloAula);
      if (atual.length >= DESEMPENHO_SELECAO_MAX_ASSUNTOS) return atual;
      return [...atual, tituloAula];
    });
  }, []);
  const limiteAtingido = selecionados.length >= DESEMPENHO_SELECAO_MAX_ASSUNTOS;

  if (areasComPratica.length === 0) {
    return (
      <p className="rounded-xl border border-border bg-background px-4 py-8 text-center text-sm text-muted-foreground">
        Nenhuma atividade com os filtros atuais.
      </p>
    );
  }

  const toggle = (areaId: string) =>
    setAbertas((atual) =>
      atual.includes(areaId) ? atual.filter((id) => id !== areaId) : [...atual, areaId],
    );

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() =>
            setAbertas(todasAbertas ? [] : areasComPratica.map((area) => area.areaId))
          }
          className="inline-flex min-h-11 items-center text-sm font-medium text-[var(--color-brand-text)] underline-offset-2 hover:underline"
        >
          {todasAbertas ? 'Recolher mapa' : 'Ver mapa completo'}
        </button>
      </div>

      <ul className="space-y-2">
        {areasComPratica.map((area) => (
          <AreaRow
            key={area.areaId}
            area={area}
            aberta={abertas.includes(area.areaId)}
            onToggle={() => toggle(area.areaId)}
            selecionados={selecionados}
            onAlternarSelecao={alternarSelecao}
            limiteAtingido={limiteAtingido}
          />
        ))}
      </ul>

      <DesempenhoSelecaoBar
        assuntos={selecionados}
        limiteAtingido={limiteAtingido}
        onLimpar={() => setSelecionados([])}
      />
    </div>
  );
}

function AreaRow({
  area,
  aberta,
  onToggle,
  selecionados,
  onAlternarSelecao,
  limiteAtingido,
}: {
  area: AreaPerformance;
  aberta: boolean;
  onToggle: () => void;
  selecionados: readonly string[];
  onAlternarSelecao: (tituloAula: string) => void;
  limiteAtingido: boolean;
}) {
  const tone = desempenhoPctTone(area.percentual, area.amostraSuficiente);
  const painelId = `area-assuntos-${area.areaId}`;
  const totalAssuntos = area.assuntos.length;

  return (
    <li className="metric-card overflow-hidden p-0">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={aberta}
        aria-controls={painelId}
        className="flex w-full min-h-11 flex-col gap-2 px-4 py-3 text-left transition-colors hover:bg-slate-50/70"
      >
        <span className="flex items-start justify-between gap-3">
          <span className="min-w-0 text-sm font-semibold text-slate-900">{area.areaLabel}</span>
          <span
            className={cn('shrink-0 text-sm font-bold tabular-nums', PCT_TONE_CLASS[tone])}
          >
            {formatDesempenhoPctComAmostra(area.percentual, area.acertos, area.respondidas)}
          </span>
        </span>

        <span className="block h-1.5 overflow-hidden rounded-full bg-slate-100" aria-hidden>
          <span
            className={cn('block h-full rounded-full', BAR_TONE_CLASS[tone])}
            style={{
              width: `${area.amostraSuficiente && area.percentual !== null ? area.percentual : 0}%`,
            }}
          />
        </span>

        <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
          <span>{area.respondidas} respondidas</span>
          <span aria-hidden>·</span>
          <span>cobertura {area.coberturaPct}%</span>
          <span aria-hidden>·</span>
          <span>{formatDesempenhoConfianca(area.confidenceId)}</span>
          <span className="ml-auto inline-flex items-center gap-1 font-medium text-[var(--color-brand-text)]">
            {aberta ? 'Ocultar assuntos' : `Ver assuntos (${totalAssuntos})`}
            <ChevronDown
              className={cn('h-3.5 w-3.5 transition-transform', aberta && 'rotate-180')}
              aria-hidden
            />
          </span>
        </span>
      </button>

      <ul id={painelId} hidden={!aberta} className="border-t border-border/70">
        {area.assuntos.map((assunto) => (
          <AssuntoRow
            key={assunto.tituloAula}
            assunto={assunto}
            selecionado={selecionados.includes(assunto.tituloAula)}
            onAlternarSelecao={onAlternarSelecao}
            limiteAtingido={limiteAtingido}
          />
        ))}
      </ul>
    </li>
  );
}

function AssuntoRow({
  assunto,
  selecionado,
  onAlternarSelecao,
  limiteAtingido,
}: {
  assunto: AssuntoPerformance;
  selecionado: boolean;
  onAlternarSelecao: (tituloAula: string) => void;
  limiteAtingido: boolean;
}) {
  const tone = desempenhoPctTone(assunto.percentual, assunto.amostraSuficiente);
  const bloqueado = limiteAtingido && !selecionado;

  return (
    <li className="border-b border-border/60 px-4 py-3 last:border-0">
      <div className="flex items-start justify-between gap-3">
        <label className="flex min-h-11 min-w-0 flex-1 items-start gap-2.5">
          <input
            type="checkbox"
            checked={selecionado}
            disabled={bloqueado}
            onChange={() => onAlternarSelecao(assunto.tituloAula)}
            className="mt-0.5 h-5 w-5 shrink-0 rounded border-slate-300 text-[var(--color-brand)] accent-[var(--color-brand)] disabled:opacity-40"
          />
          <span className="min-w-0 break-words text-sm font-medium text-slate-900">
            {assunto.tituloAula}
          </span>
        </label>
        <p className={cn('shrink-0 text-sm font-semibold tabular-nums', PCT_TONE_CLASS[tone])}>
          {formatDesempenhoPctComAmostra(
            assunto.percentual,
            assunto.acertos,
            assunto.respondidas,
          )}
        </p>
      </div>
      <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
        <span>
          {assunto.acertos} acerto{assunto.acertos === 1 ? '' : 's'} · {assunto.erros} erro
          {assunto.erros === 1 ? '' : 's'}
        </span>
        <span aria-hidden>·</span>
        <span>
          cobertura {assunto.coberturaPct}% ({assunto.respondidas}/{assunto.totalDisponivel})
        </span>
        <span aria-hidden>·</span>
        <span>{formatDesempenhoConfianca(assunto.confidenceId)}</span>
        {assunto.ultimaPratica ? (
          <>
            <span aria-hidden>·</span>
            <span>última prática {formatDesempenhoDate(assunto.ultimaPratica)}</span>
          </>
        ) : null}
      </p>
      <Link
        href={`/estudar?assunto=${encodeURIComponent(assunto.tituloAula)}&status=pending`}
        aria-label={`Testar em outra questão de ${assunto.tituloAula}`}
        className="mt-2 inline-flex min-h-11 items-center text-sm font-medium text-[var(--color-brand-text)] underline-offset-2 hover:underline"
      >
        Testar em outra questão
      </Link>
    </li>
  );
}
