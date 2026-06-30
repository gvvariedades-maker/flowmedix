'use client';

import { useCallback, useEffect, useState } from 'react';
import { Loader2, ShieldCheck } from 'lucide-react';

type HealthRow = {
  subtopico: string;
  production_status: string;
  can_sell: boolean;
  pass: boolean;
  should_block: boolean;
  open_p0: number;
  stale_p0: number;
  open_p1: number;
  report_rate_pct: number;
  health_streak_days: number | null;
  last_blocked_reason: string | null;
};

/** Badge de saúde L5 por subtópico handcraft (admin). */
export function SubtopicoQualityHealthPanel() {
  const [rows, setRows] = useState<HealthRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/subtopico-quality?all=1', {
        credentials: 'same-origin',
      });
      if (!res.ok) {
        setRows([]);
        return;
      }
      const body = await res.json();
      const items = (body.items ?? []) as Array<{
        subtopico: string;
        production_status: string;
        can_sell: boolean;
        continuous: {
          health_streak_days?: number;
          last_blocked_reason?: string | null;
        } | null;
        content_health: {
          pass: boolean;
          should_block?: boolean;
          stale_p0_count?: number;
          open_reports: { p0: number; p1: number };
          report_rate_pct: number;
        };
      }>;

      setRows(
        items.map((item) => ({
          subtopico: item.subtopico,
          production_status: item.production_status,
          can_sell: item.can_sell,
          pass: item.content_health.pass,
          should_block: item.content_health.should_block ?? false,
          open_p0: item.content_health.open_reports.p0,
          stale_p0: item.content_health.stale_p0_count ?? 0,
          open_p1: item.content_health.open_reports.p1,
          report_rate_pct: item.content_health.report_rate_pct,
          health_streak_days: item.continuous?.health_streak_days ?? null,
          last_blocked_reason: item.continuous?.last_blocked_reason ?? null,
        })),
      );
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchAll();
  }, [fetchAll]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
        <Loader2 className="h-4 w-4 animate-spin" />
        Saúde por subtópico…
      </div>
    );
  }

  if (rows.length === 0) return null;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <ShieldCheck className="h-4 w-4 text-emerald-600" />
        <h2 className="text-sm font-semibold text-slate-900">Saúde de conteúdo (L5)</h2>
      </div>
      <div className="flex flex-wrap gap-2">
        {rows.map((row) => {
          const isBlocked = row.production_status === 'blocked';
          const badgeClass = isBlocked
            ? 'border-red-300 bg-red-50 text-red-900'
            : row.should_block
              ? 'border-orange-300 bg-orange-50 text-orange-900'
              : row.pass
                ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                : 'border-amber-200 bg-amber-50 text-amber-900';

          const tooltip = [
            row.subtopico,
            `can_sell: ${row.can_sell}`,
            `P0:${row.open_p0} P1:${row.open_p1}`,
            row.stale_p0 > 0 ? `P0 stale:${row.stale_p0}` : null,
            `${row.report_rate_pct}%`,
            row.health_streak_days != null ? `streak: ${row.health_streak_days}d` : null,
            row.last_blocked_reason ? `blocked: ${row.last_blocked_reason}` : null,
          ]
            .filter(Boolean)
            .join(' · ');

          return (
            <div
              key={row.subtopico}
              className={`rounded-lg border px-2.5 py-1.5 text-[10px] ${badgeClass}`}
              title={tooltip}
            >
              <span className="font-bold">{row.production_status}</span>
              {row.can_sell ? <span className="ml-1 text-emerald-700">$</span> : null}
              <span className="mx-1">·</span>
              <span className="inline-block max-w-[140px] truncate align-bottom">
                {row.subtopico.split('(')[0]?.trim().slice(0, 24)}
              </span>
              {row.health_streak_days != null && row.health_streak_days > 0 ? (
                <span className="ml-1 text-slate-600">{row.health_streak_days}d</span>
              ) : null}
              {row.open_p0 > 0 ? (
                <span className="ml-1 font-bold text-red-600">P0:{row.open_p0}</span>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
