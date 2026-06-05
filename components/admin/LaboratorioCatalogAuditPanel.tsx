'use client';

import { useCallback, useState } from 'react';
import {
  AlertCircle,
  BarChart3,
  CheckCircle2,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import type { CatalogContentAuditReport } from '@/lib/admin/catalogContentAudit';

type AuditResponse = CatalogContentAuditReport & { status?: string };

export function LaboratorioCatalogAuditPanel() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<AuditResponse | null>(null);

  const runAudit = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        '/api/admin/laboratorio/catalog-audit?sampleSize=20&issueLimit=100',
        { credentials: 'same-origin' },
      );
      const body = await res.json();
      if (!res.ok) {
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }
      setReport(body as AuditResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha na auditoria');
      setReport(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const s = report?.summary;
  const issueTotal = s
    ? s.missing_slides +
      s.slide_count_not_four +
      s.missing_premium_type +
      s.zod_invalid +
      s.tecconcursos_reference
    : 0;

  return (
    <details
      className="group rounded-2xl border border-indigo-200 bg-indigo-50/50 px-4 py-3 text-slate-700 shadow-sm open:pb-4"
      onToggle={(e) => {
        if (e.currentTarget.open && !report && !loading) {
          void runAudit();
        }
      }}
    >
      <summary className="cursor-pointer list-none text-left text-xs font-bold uppercase tracking-wider text-indigo-900/90">
        <span className="inline-flex items-center gap-2">
          <BarChart3 className="h-3.5 w-3.5 shrink-0 text-indigo-600" aria-hidden />
          Auditoria do catálogo (slides / Zod)
          {report && (
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                issueTotal > 0 ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'
              }`}
            >
              {report.scanned_rows} questões
            </span>
          )}
          <span className="text-[10px] font-semibold text-indigo-700/80 group-open:hidden">
            (expandir relatório)
          </span>
        </span>
      </summary>

      <div className="mt-3 space-y-3 border-t border-indigo-200/80 pt-3">
        <p className="text-[12px] leading-relaxed text-slate-600">
          Varre <code className="rounded bg-white/80 px-1 text-[11px]">modulos_estudo</code>: questões
          sem <code className="text-[11px]">reverse_study_slides</code>, pacote diferente de 4 tipos
          principais, falhas <code className="text-[11px]">QuestaoCompletaSchema</code> e amostra de 20
          slugs com layouts premium (tap / compare / reference_table).
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => void runAudit()}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-[11px] font-bold uppercase text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" aria-hidden />
            )}
            {loading ? 'Auditando…' : 'Atualizar auditoria'}
          </button>
          {report?.generated_at && (
            <span className="text-[10px] text-slate-500">
              {new Date(report.generated_at).toLocaleString('pt-BR')}
            </span>
          )}
        </div>

        {error && (
          <p className="flex items-start gap-2 text-xs text-red-600" role="alert">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            {error}
          </p>
        )}

        {report && s && (
          <>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
              <Stat label="Catálogo total" value={report.catalog_total} />
              <Stat label="Pacote 4× premium OK" value={s.fully_premium_package} ok />
              <Stat label="Sem slides" value={s.missing_slides} warn={s.missing_slides > 0} />
              <Stat label="≠ 4 slides" value={s.slide_count_not_four} warn={s.slide_count_not_four > 0} />
              <Stat label="Tipo principal ausente" value={s.missing_premium_type} warn={s.missing_premium_type > 0} />
              <Stat label="Zod inválido" value={s.zod_invalid} warn={s.zod_invalid > 0} />
              <Stat label="TecConcursos" value={s.tecconcursos_reference} warn={s.tecconcursos_reference > 0} />
            </div>

            {report.issue_rows.length > 0 && (
              <div className="max-h-48 overflow-auto rounded-xl border border-indigo-100 bg-white/80 p-2">
                <p className="mb-2 text-[10px] font-black uppercase text-indigo-800">
                  Primeiras {report.issue_rows.length} com problema
                </p>
                <ul className="space-y-1 text-[11px]">
                  {report.issue_rows.slice(0, 30).map((row) => (
                    <li key={row.modulo_slug} className="font-mono text-slate-700">
                      <span className="font-sans font-semibold text-slate-900">{row.modulo_slug}</span>
                      {' — '}
                      {row.issues.join(', ')}
                      {row.slide_count > 0 && ` (${row.slide_count} slides)`}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="rounded-xl border border-slate-200 bg-white/90 p-3">
              <p className="mb-2 text-[10px] font-black uppercase text-slate-600">
                Amostra {report.sample_size} — validação + layouts premium
              </p>
              <ul className="space-y-2 text-[11px]">
                {report.sample_validation.map((row) => (
                  <li
                    key={row.modulo_slug}
                    className={`rounded-lg border px-2 py-1.5 ${
                      row.valid ? 'border-green-100 bg-green-50/50' : 'border-amber-100 bg-amber-50/40'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                      {row.valid ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-600" aria-hidden />
                      ) : (
                        <AlertCircle className="h-3.5 w-3.5 text-amber-600" aria-hidden />
                      )}
                      <span className="font-mono text-[10px]">{row.modulo_slug}</span>
                    </div>
                    <p className="mt-0.5 text-slate-500">
                      tap: {row.premium_layouts.logic_flow_tap ? 'sim' : 'não'} · compare:{' '}
                      {row.premium_layouts.danger_zone_compare ? 'sim' : 'não'} · tabela:{' '}
                      {row.premium_layouts.golden_rule_reference_table ? 'sim' : 'não'}
                    </p>
                    {row.issues.length > 0 && (
                      <p className="mt-0.5 text-amber-800">{row.issues.join(' · ')}</p>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {report.notes.length > 0 && (
              <ul className="list-disc pl-4 text-[10px] text-slate-500">
                {report.notes.map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </details>
  );
}

function Stat({
  label,
  value,
  ok,
  warn,
}: {
  label: string;
  value: number;
  ok?: boolean;
  warn?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border px-2 py-1.5 ${
        warn ? 'border-amber-200 bg-amber-50' : ok ? 'border-green-200 bg-green-50' : 'border-slate-200 bg-white'
      }`}
    >
      <p className="text-[9px] font-bold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="text-sm font-black text-slate-900">{value.toLocaleString('pt-BR')}</p>
    </div>
  );
}
