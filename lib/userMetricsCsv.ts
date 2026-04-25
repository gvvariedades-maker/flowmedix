import type { UserMetricsResponse } from '@/lib/validations';

function escapeCsvField(v: string | number): string {
  const s = String(v);
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function line(cells: (string | number)[]): string {
  return cells.map(escapeCsvField).join(',');
}

/**
 * CSV para Excel (pt-BR): BOM UTF-8 + ponto e vírgula seria outro formato;
 * aqui vírgula é o padrão internacional; Excel BR abre com UTF-8 se importar como dados.
 */
export function buildUserMetricsCsv(data: UserMetricsResponse): string {
  const rows: string[] = [];
  rows.push(line(['metrica', 'valor']));
  rows.push(line(['totalUsers', data.totalUsers]));
  rows.push(line(['confirmedTotal', data.confirmedTotal]));
  rows.push(line(['newLast7Days_utc_7dias_corridos', data.newLast7Days]));
  rows.push(line(['newLast30Days_utc_30dias_corridos', data.newLast30Days]));
  rows.push(line(['newWeekToDateUtc_semana_atual_seg_ate_hoje_utc', data.newWeekToDateUtc]));
  rows.push(line(['generatedAt_iso', data.generatedAt]));
  rows.push('');
  rows.push(line(['tipo', 'data', 'fim_exclusivo_ou_vazio', 'contagem']));
  for (const d of data.last7DaysByDay) {
    rows.push(line(['dia_utc', d.date, '', d.count]));
  }
  for (const w of data.last4IsoWeeks) {
    rows.push(line(['semana_iso_completa_utc', w.weekStart, w.weekEndExclusive, w.count]));
  }
  return `\uFEFF${rows.join('\r\n')}\r\n`;
}

export function downloadUserMetricsCsv(data: UserMetricsResponse, fileBase = 'avant-cadastros-metricas'): void {
  const csv = buildUserMetricsCsv(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
  a.href = url;
  a.download = `${fileBase}-${stamp}.csv`;
  a.rel = 'noopener';
  a.click();
  URL.revokeObjectURL(url);
}
