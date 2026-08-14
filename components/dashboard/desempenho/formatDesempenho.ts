/** Helpers de exibição do hub `/desempenho` (aba Estudo). */

import {
  getConfidenceLevel,
  type ConfidenceLevelId,
} from '@/lib/desempenho/confidence';

export function formatDesempenhoPct(value: number | null): string {
  if (value === null) return '—';
  return `${value}%`;
}

/**
 * Percentual sempre acompanhado da fração — `71% · 30/42`.
 * Sem amostra suficiente mostra só `acertos/respondidas`; sem dado, `—`.
 */
export function formatDesempenhoPctComAmostra(
  percentual: number | null,
  acertos: number,
  respondidas: number,
): string {
  if (respondidas <= 0) return '—';
  const fracao = `${acertos}/${respondidas}`;
  if (percentual === null) return fracao;
  return `${percentual}% · ${fracao}`;
}

/** Rótulo curto do nível de confiança (chip ao lado da fração). */
export function formatDesempenhoConfianca(id: ConfidenceLevelId): string {
  return getConfidenceLevel(id).label;
}

/** Frase completa do nível de confiança (leitor de tela / apoio). */
export function describeDesempenhoConfianca(id: ConfidenceLevelId): string {
  return getConfidenceLevel(id).description;
}

export function formatDesempenhoDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
  });
}

export function formatDesempenhoDateTime(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Tempo médio de resposta (ms → s / m). */
export function formatDesempenhoDurationMs(ms: number | null): string {
  if (ms === null || !Number.isFinite(ms) || ms < 0) return '—';
  if (ms < 1000) return `${Math.round(ms)} ms`;
  const totalSec = Math.round(ms / 1000);
  if (totalSec < 60) return `${totalSec}s`;
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return s > 0 ? `${m}m ${String(s).padStart(2, '0')}s` : `${m}m`;
}

/**
 * Cor semântica do % de acerto — neutra abaixo da amostra mínima.
 * `0%` com amostra real é `danger`; `0` sem amostra permanece neutro.
 */
export function desempenhoPctTone(
  percentual: number | null,
  amostraSuficiente: boolean,
): 'neutral' | 'danger' | 'warning' | 'success' {
  if (!amostraSuficiente || percentual === null) return 'neutral';
  if (percentual < 50) return 'danger';
  if (percentual < 70) return 'warning';
  return 'success';
}

/** Período civil aplicado, em texto para o aluno (Brasília). */
export function formatDesempenhoPeriodoCivil(
  startYmd: string | null,
  endYmdInclusive: string,
): string {
  const fmt = (ymd: string) => {
    const [y, m, d] = ymd.split('-');
    return `${d}/${m}/${y}`;
  };
  if (!startYmd) return `até ${fmt(endYmdInclusive)}`;
  if (startYmd === endYmdInclusive) return fmt(endYmdInclusive);
  return `${fmt(startYmd)} a ${fmt(endYmdInclusive)}`;
}
