/** Helpers de exibição do hub `/desempenho` (aba Estudo). */

export function formatDesempenhoPct(value: number | null): string {
  if (value === null) return '—';
  return `${value}%`;
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

/** Cor semântica do % de acerto (só com amostra suficiente). */
export function desempenhoPctTone(
  percentual: number | null,
  amostraSuficiente: boolean,
): 'neutral' | 'danger' | 'warning' | 'success' {
  if (!amostraSuficiente || percentual === null) return 'neutral';
  if (percentual < 50) return 'danger';
  if (percentual < 70) return 'warning';
  return 'success';
}
